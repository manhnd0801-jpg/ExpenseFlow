-- Migration: Add loan_id column to transactions table
-- Purpose: Link loan disbursement transactions to their loans for better data integrity
-- Date: 2025-11-29

\c expense_management;

-- Add loan_id column
ALTER TABLE transactions 
ADD COLUMN loan_id UUID;

-- Add foreign key constraint with ON DELETE SET NULL
-- When loan is deleted, transaction remains but loan_id becomes NULL
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_loan
FOREIGN KEY (loan_id) 
REFERENCES loans(id) 
ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_transactions_loan_id ON transactions(loan_id);

-- Migrate existing data: Extract loan ID from note field
-- Update transactions where note contains "Loan ID: <uuid>"
UPDATE transactions
SET loan_id = (
  SELECT NULLIF(
    regexp_replace(note, '.*Loan ID: ([a-f0-9-]{36}).*', '\1'),
    note
  )::uuid
)
WHERE note LIKE '%Loan ID:%'
  AND note ~ 'Loan ID: [a-f0-9-]{36}'
  AND deleted_at IS NULL;

-- Verify migration
SELECT 
  COUNT(*) as total_loan_transactions,
  COUNT(loan_id) as migrated_transactions,
  COUNT(*) - COUNT(loan_id) as failed_migrations
FROM transactions
WHERE note LIKE '%Loan ID:%' OR description LIKE '%Loan disbursement%';

-- Show sample migrated transactions
SELECT id, date, amount, description, note, loan_id
FROM transactions
WHERE loan_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
