-- Migration: Convert DATE columns to TIMESTAMP
-- Date: 2025-01-XX
-- Purpose: Add time precision to date columns for better audit trail

-- ============================================
-- 1. LOANS TABLE
-- ============================================
-- Convert startDate from DATE to TIMESTAMP
ALTER TABLE loans 
  ALTER COLUMN "startDate" TYPE TIMESTAMP USING "startDate"::TIMESTAMP;

-- Convert nextPaymentDate from DATE to TIMESTAMP
ALTER TABLE loans 
  ALTER COLUMN "nextPaymentDate" TYPE TIMESTAMP USING "nextPaymentDate"::TIMESTAMP;

-- Convert lastPaymentDate from DATE to TIMESTAMP
ALTER TABLE loans 
  ALTER COLUMN "lastPaymentDate" TYPE TIMESTAMP USING "lastPaymentDate"::TIMESTAMP;

-- ============================================
-- 2. LOAN_PAYMENTS TABLE
-- ============================================
-- Convert paymentDate from DATE to TIMESTAMP
ALTER TABLE loan_payments 
  ALTER COLUMN "paymentDate" TYPE TIMESTAMP USING "paymentDate"::TIMESTAMP;

-- Convert dueDate from DATE to TIMESTAMP
ALTER TABLE loan_payments 
  ALTER COLUMN "dueDate" TYPE TIMESTAMP USING "dueDate"::TIMESTAMP;

-- ============================================
-- 3. DEBTS TABLE
-- ============================================
-- Convert borrowedDate from DATE to TIMESTAMP
ALTER TABLE debts 
  ALTER COLUMN "borrowedDate" TYPE TIMESTAMP USING "borrowedDate"::TIMESTAMP;

-- Convert dueDate from DATE to TIMESTAMP
ALTER TABLE debts 
  ALTER COLUMN "dueDate" TYPE TIMESTAMP USING "dueDate"::TIMESTAMP;

-- ============================================
-- 4. DEBT_PAYMENTS TABLE
-- ============================================
-- Convert paymentDate from DATE to TIMESTAMP
ALTER TABLE debt_payments 
  ALTER COLUMN "paymentDate" TYPE TIMESTAMP USING "paymentDate"::TIMESTAMP;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify the migration

-- Check loans table column types
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'loans' 
  AND column_name IN ('startDate', 'nextPaymentDate', 'lastPaymentDate', 'disbursementDate')
ORDER BY column_name;

-- Check loan_payments table column types
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'loan_payments' 
  AND column_name IN ('paymentDate', 'dueDate')
ORDER BY column_name;

-- Check debts table column types
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'debts' 
  AND column_name IN ('borrowedDate', 'dueDate')
ORDER BY column_name;

-- Check debt_payments table column types
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'debt_payments' 
  AND column_name = 'paymentDate'
ORDER BY column_name;

-- Sample data check (loans)
SELECT 
  id, 
  "startDate", 
  "nextPaymentDate", 
  "lastPaymentDate",
  "disbursementDate"
FROM loans 
LIMIT 5;

-- Sample data check (loan_payments)
SELECT 
  id, 
  "paymentDate", 
  "dueDate"
FROM loan_payments 
LIMIT 5;

-- ============================================
-- NOTES:
-- ============================================
-- 1. Existing DATE values (YYYY-MM-DD) will be converted to TIMESTAMP 
--    with time component set to 00:00:00
-- 2. All new inserts should include time component (HH:mm:ss)
-- 3. Backend entities now use @DateToString() decorator for proper JSON serialization
-- 4. Frontend must send ISO 8601 datetime strings (e.g., "2025-01-15T14:30:00.000Z")
-- 5. Backup database before running this migration
-- ============================================
