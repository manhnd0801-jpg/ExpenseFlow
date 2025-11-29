-- Migration: Add Goal Transactions Support
-- Description: Add goal_id to transactions table and create goal_transactions table
-- Date: 2025-11-29

-- Step 1: Add goal_id column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS goal_id UUID;

-- Step 2: Create goal_transactions table
CREATE TABLE IF NOT EXISTS goal_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL,
    account_id UUID NOT NULL,
    transaction_id UUID,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Add foreign key constraints
DO $$
BEGIN
    -- Add FK for transactions.goal_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_transactions_goal'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_goal 
        FOREIGN KEY (goal_id) 
        REFERENCES goals(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;

    -- Add FK for goal_transactions.goal_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_goal_transactions_goal'
    ) THEN
        ALTER TABLE goal_transactions 
        ADD CONSTRAINT fk_goal_transactions_goal 
        FOREIGN KEY (goal_id) 
        REFERENCES goals(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;

    -- Add FK for goal_transactions.account_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_goal_transactions_account'
    ) THEN
        ALTER TABLE goal_transactions 
        ADD CONSTRAINT fk_goal_transactions_account 
        FOREIGN KEY (account_id) 
        REFERENCES accounts(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;

    -- Add FK for goal_transactions.transaction_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_goal_transactions_transaction'
    ) THEN
        ALTER TABLE goal_transactions 
        ADD CONSTRAINT fk_goal_transactions_transaction 
        FOREIGN KEY (transaction_id) 
        REFERENCES transactions(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_goal_id ON transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_transactions_goal_id ON goal_transactions(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_transactions_account_id ON goal_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_goal_transactions_transaction_id ON goal_transactions(transaction_id);

-- Step 5: Add comments
COMMENT ON TABLE goal_transactions IS 'Tracks goal contributions and withdrawals with audit trail';
COMMENT ON COLUMN goal_transactions.type IS 'CONTRIBUTION or WITHDRAWAL';
COMMENT ON COLUMN transactions.goal_id IS 'Link to goal for contribution/withdrawal transactions';

-- Verify migration
SELECT 'Migration completed successfully!' AS status;
