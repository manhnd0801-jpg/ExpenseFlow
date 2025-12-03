-- Add accountId and disbursementDate fields to loans table
-- This allows us to track which account received loan disbursement and when

-- Add accountId column
ALTER TABLE loans 
ADD COLUMN account_id UUID NULL;

-- Add disbursementDate column
ALTER TABLE loans 
ADD COLUMN disbursement_date TIMESTAMP NULL;

-- Add comment to columns
COMMENT ON COLUMN loans.account_id IS 'Account that received loan disbursement (if disbursed)';
COMMENT ON COLUMN loans.disbursement_date IS 'Date when loan was actually disbursed to account';

-- Create index for better query performance
CREATE INDEX idx_loans_account_id ON loans(account_id) WHERE account_id IS NOT NULL;
CREATE INDEX idx_loans_disbursement_date ON loans(disbursement_date) WHERE disbursement_date IS NOT NULL;

-- Update existing loans that have disbursement transactions
-- Match by note field containing "Loan ID: xxx"
UPDATE loans l
SET 
  account_id = t.account_id,
  disbursement_date = t.date
FROM transactions t
WHERE 
  t.note LIKE '%Loan ID: ' || l.id || '%'
  AND t.type = 1  -- INCOME type
  AND t.deleted_at IS NULL
  AND l.account_id IS NULL;

-- Verify the update
SELECT 
  id,
  name,
  original_amount,
  account_id,
  disbursement_date,
  created_at
FROM loans
WHERE disbursement_date IS NOT NULL
ORDER BY disbursement_date DESC
LIMIT 10;
