-- Fix paid off loans that still have status = ACTIVE (1)
-- This script updates loans where:
-- 1. remainingPrincipal <= 0 OR remainingMonths <= 0
-- 2. status is still ACTIVE (1)
-- Set status to PAID_OFF (2)

-- First, check which loans will be affected
SELECT 
    id,
    name,
    "originalAmount",
    "remainingPrincipal",
    "remainingMonths",
    "monthlyPayment",
    status,
    CASE 
        WHEN status = 1 THEN 'ACTIVE'
        WHEN status = 2 THEN 'PAID_OFF'
        WHEN status = 3 THEN 'DEFAULTED'
        WHEN status = 4 THEN 'REFINANCED'
        ELSE 'UNKNOWN'
    END as status_label
FROM loans
WHERE status = 1 -- ACTIVE
  AND ("remainingPrincipal" <= 0 OR "remainingMonths" <= 0)
  AND deleted_at IS NULL;

-- Update the loans
UPDATE loans
SET 
    status = 2, -- PAID_OFF
    "remainingPrincipal" = 0,
    "remainingMonths" = 0,
    "monthlyPayment" = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 1 -- ACTIVE
  AND ("remainingPrincipal" <= 0 OR "remainingMonths" <= 0)
  AND deleted_at IS NULL;

-- Verify the changes
SELECT 
    id,
    name,
    "originalAmount",
    "remainingPrincipal",
    "remainingMonths",
    "monthlyPayment",
    status,
    CASE 
        WHEN status = 1 THEN 'ACTIVE'
        WHEN status = 2 THEN 'PAID_OFF'
        WHEN status = 3 THEN 'DEFAULTED'
        WHEN status = 4 THEN 'REFINANCED'
        ELSE 'UNKNOWN'
    END as status_label
FROM loans
WHERE id = 'bf967d70-f4df-4d74-9ede-fcdb935725ee';
