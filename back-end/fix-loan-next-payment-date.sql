-- Fix incorrect nextPaymentDate for loans
-- This script recalculates nextPaymentDate based on lastPaymentDate or startDate

-- For loans that have been paid (have lastPaymentDate)
-- Set nextPaymentDate to 1 month after lastPaymentDate
UPDATE loans
SET "nextPaymentDate" = "lastPaymentDate" + INTERVAL '1 month'
WHERE "lastPaymentDate" IS NOT NULL
  AND status = 1  -- ACTIVE status
  AND "deletedAt" IS NULL;

-- For loans that haven't been paid yet (no lastPaymentDate)
-- Set nextPaymentDate to 1 month after disbursementDate (or startDate if no disbursement)
UPDATE loans
SET "nextPaymentDate" = COALESCE("disbursementDate", "startDate") + INTERVAL '1 month'
WHERE "lastPaymentDate" IS NULL
  AND status = 1  -- ACTIVE status
  AND "deletedAt" IS NULL;

-- Verify the fix
SELECT 
  name,
  "startDate"::date,
  "disbursementDate"::date,
  "lastPaymentDate"::date,
  "nextPaymentDate"::date,
  "remainingMonths",
  status
FROM loans
WHERE "deletedAt" IS NULL
ORDER BY "updatedAt" DESC;
