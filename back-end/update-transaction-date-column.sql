-- Migration: Update transaction.date from DATE to TIMESTAMP
-- Date: 2025-11-29
-- Description: Change transaction date column to support storing time

-- Update column type
ALTER TABLE transactions 
ALTER COLUMN date TYPE TIMESTAMP USING date::TIMESTAMP;

-- Verify change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'date';
