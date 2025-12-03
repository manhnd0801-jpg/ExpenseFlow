-- ================================================================
-- MIGRATION: Add Debt Integration Fields
-- Purpose: Add account and transaction integration to debts system
-- Created: 2025-01-11
-- ================================================================

-- Step 1: Add debt_id to transactions table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'debt_id') THEN
        ALTER TABLE transactions ADD COLUMN debt_id UUID REFERENCES debts(id) ON DELETE SET NULL;
        CREATE INDEX idx_transactions_debt ON transactions(debt_id);
        COMMENT ON COLUMN transactions.debt_id IS 'Link to debt for debt-related transactions';
    END IF;
END
$$;

-- Step 2: Add new fields to debts table
DO $$
BEGIN
    -- Add account_id (MANDATORY for all debts)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debts' AND column_name = 'account_id') THEN
        -- First add as nullable to allow existing data
        ALTER TABLE debts ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT;
        
        -- For existing debts, we'll need to manually set account_id 
        -- (this should be handled in application logic before making it NOT NULL)
        COMMENT ON COLUMN debts.account_id IS 'Account for debt transactions (source for lending, dest for borrowing)';
        
        -- Create index for performance
        CREATE INDEX idx_debts_account ON debts(account_id);
    END IF;
    
    -- Add initial_transaction_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debts' AND column_name = 'initial_transaction_id') THEN
        ALTER TABLE debts ADD COLUMN initial_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
        COMMENT ON COLUMN debts.initial_transaction_id IS 'Transaction created when debt was established';
        CREATE INDEX idx_debts_initial_transaction ON debts(initial_transaction_id);
    END IF;
    
    -- Add total_interest_paid
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debts' AND column_name = 'total_interest_paid') THEN
        ALTER TABLE debts ADD COLUMN total_interest_paid DECIMAL(15, 2) NOT NULL DEFAULT 0;
        COMMENT ON COLUMN debts.total_interest_paid IS 'Total interest paid so far';
        
        -- Add constraint to ensure it's not negative
        ALTER TABLE debts ADD CONSTRAINT chk_debts_total_interest_paid_positive 
            CHECK (total_interest_paid >= 0);
    END IF;
END
$$;

-- Step 3: Add new fields to debt_payments table
DO $$
BEGIN
    -- Add principal_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debt_payments' AND column_name = 'principal_amount') THEN
        ALTER TABLE debt_payments ADD COLUMN principal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0;
        COMMENT ON COLUMN debt_payments.principal_amount IS 'Principal portion of the payment';
        
        -- Add constraint to ensure it's not negative
        ALTER TABLE debt_payments ADD CONSTRAINT chk_debt_payments_principal_positive 
            CHECK (principal_amount >= 0);
    END IF;
    
    -- Add interest_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debt_payments' AND column_name = 'interest_amount') THEN
        ALTER TABLE debt_payments ADD COLUMN interest_amount DECIMAL(15, 2) NOT NULL DEFAULT 0;
        COMMENT ON COLUMN debt_payments.interest_amount IS 'Interest portion of the payment';
        
        -- Add constraint to ensure it's not negative
        ALTER TABLE debt_payments ADD CONSTRAINT chk_debt_payments_interest_positive 
            CHECK (interest_amount >= 0);
    END IF;
    
    -- Add account_id (MANDATORY for all payments)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debt_payments' AND column_name = 'account_id') THEN
        -- First add as nullable to allow existing data
        ALTER TABLE debt_payments ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE RESTRICT;
        COMMENT ON COLUMN debt_payments.account_id IS 'Account receiving money (lending) or paying money (borrowing)';
        
        -- Create index for performance
        CREATE INDEX idx_debt_payments_account ON debt_payments(account_id);
    END IF;
    
    -- Add transaction_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'debt_payments' AND column_name = 'transaction_id') THEN
        ALTER TABLE debt_payments ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
        COMMENT ON COLUMN debt_payments.transaction_id IS 'Transaction created for this payment';
        CREATE INDEX idx_debt_payments_transaction ON debt_payments(transaction_id);
    END IF;
    
    -- Add constraint to ensure principal + interest = amount
    ALTER TABLE debt_payments DROP CONSTRAINT IF EXISTS chk_debt_payments_amount_breakdown;
    ALTER TABLE debt_payments ADD CONSTRAINT chk_debt_payments_amount_breakdown 
        CHECK (ABS(amount - (principal_amount + interest_amount)) < 0.01);
END
$$;

-- Step 4: Update existing data (if any) - Set default values for existing records
DO $$
BEGIN
    -- Update existing debt_payments to have principal_amount = amount if principal_amount is 0
    UPDATE debt_payments 
    SET principal_amount = amount, 
        interest_amount = 0 
    WHERE principal_amount = 0 AND amount > 0;
    
    -- Note: For existing debts and debt_payments without account_id, 
    -- the application should handle setting appropriate account_id values
    -- before making these fields NOT NULL in a future migration
END
$$;

-- Step 5: Add useful indexes for debt queries
CREATE INDEX IF NOT EXISTS idx_debts_user_status ON debts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_debts_user_type ON debts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_date ON debt_payments(debt_id, "paymentDate" DESC);
CREATE INDEX IF NOT EXISTS idx_debt_payments_user_date ON debt_payments(debt_id, "paymentDate" DESC);

-- Step 6: Add helpful views for debt analysis
CREATE OR REPLACE VIEW debt_summary AS
SELECT 
    d.id as debt_id,
    d.user_id,
    d.type,
    d.person_name,
    d.original_amount,
    d.remaining_amount,
    d.total_interest_paid,
    d.status,
    d.borrowed_date,
    d.due_date,
    COALESCE(payment_stats.total_payments, 0) as total_payments,
    COALESCE(payment_stats.payment_count, 0) as payment_count,
    COALESCE(payment_stats.last_payment_date, NULL) as last_payment_date
FROM debts d
LEFT JOIN (
    SELECT 
        debt_id,
        SUM(amount) as total_payments,
        COUNT(*) as payment_count,
        MAX("paymentDate") as last_payment_date
    FROM debt_payments
    WHERE status = 2 -- PaymentStatus.PAID
    GROUP BY debt_id
) payment_stats ON d.id = payment_stats.debt_id
WHERE d.deleted_at IS NULL;

COMMENT ON VIEW debt_summary IS 'Summary view of debts with payment statistics';

-- Migration completed successfully
SELECT 'Debt integration migration completed successfully' as status;