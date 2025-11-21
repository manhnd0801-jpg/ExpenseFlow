-- Seed data for Loans, Recurring Transactions, and Shared Books modules
-- Date: 2024-11-21

-- Get existing user IDs (will be used in seed data)
-- User 1: 59f7e681-8002-4a50-9d7d-dc7b85f43b16 (user@example.com)
-- User 2: dbf5e836-4200-45c4-a8df-20604ad39a59 (test@expenseflow.com)

-- =====================================================
-- 1. LOANS TABLE - Sample loan data
-- =====================================================

INSERT INTO loans (
  id, 
  user_id, 
  name, 
  description, 
  "originalAmount", 
  "interestRate", 
  "termMonths", 
  "monthlyPayment", 
  "startDate", 
  "remainingPrincipal",
  "totalPrincipalPaid",
  "totalInterestPaid", 
  type, 
  status, 
  created_at, 
  updated_at,
  "remainingMonths",
  "nextPaymentDate"
) VALUES 
-- Loan 1: Home Mortgage for User 1
(
  uuid_generate_v4(),
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'Home Mortgage',
  'Primary residence mortgage - 20 years',
  5000000000, -- 5 billion VND (about $200k)
  7.5,
  240, -- 20 years
  40383000, -- Monthly payment calculated
  '2024-01-01',
  4980000000, -- Remaining principal
  20000000, -- Total principal paid
  383000, -- Total interest paid
  2, -- Mortgage
  1, -- Active
  NOW(),
  NOW(),
  239, -- Remaining months
  '2024-12-01' -- Next payment
),
-- Loan 2: Car Loan for User 1
(
  uuid_generate_v4(),
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'Car Loan - Toyota Camry',
  'Auto loan for new Toyota Camry 2024',
  800000000, -- 800 million VND
  8.5,
  60, -- 5 years
  16370000,
  '2024-06-01',
  800000000, -- Remaining principal
  0, -- Total principal paid
  0, -- Total interest paid
  3, -- Auto
  1, -- Active
  NOW(),
  NOW(),
  60, -- Remaining months
  '2024-12-01' -- Next payment
),
-- Loan 3: Personal Loan for User 2
(
  uuid_generate_v4(),
  'dbf5e836-4200-45c4-a8df-20604ad39a59',
  'Personal Loan',
  'Personal loan for home renovation',
  200000000, -- 200 million VND
  12.0,
  36, -- 3 years
  6644000,
  '2024-03-01',
  180000000, -- Remaining principal
  20000000, -- Total principal paid
  3960000, -- Total interest paid
  1, -- Personal
  1, -- Active
  NOW(),
  NOW(),
  27, -- Remaining months (9 months paid)
  '2024-12-01' -- Next payment
),
-- Loan 4: Business Loan for User 2
(
  uuid_generate_v4(),
  'dbf5e836-4200-45c4-a8df-20604ad39a59',
  'Business Expansion Loan',
  'Loan for expanding coffee shop business',
  500000000, -- 500 million VND
  10.5,
  48, -- 4 years
  12750000,
  '2023-12-01',
  450000000, -- Remaining principal
  50000000, -- Total principal paid
  10500000, -- Total interest paid
  4, -- Business
  1, -- Active
  NOW(),
  NOW(),
  36, -- Remaining months (12 months paid)
  '2024-12-01' -- Next payment
);

-- =====================================================
-- 2. RECURRING TRANSACTIONS - Sample recurring data
-- =====================================================

INSERT INTO recurring_transactions (
  id,
  user_id,
  name,
  description,
  amount,
  type,
  frequency,
  category_id,
  start_date,
  end_date,
  next_execution_date,
  last_execution_date,
  "executionCount",
  "isActive",
  created_at,
  updated_at
) 
SELECT 
  uuid_generate_v4(),
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'Monthly Rent',
  'Apartment rent payment',
  12000000, -- 12 million VND/month
  2, -- Expense
  4, -- Monthly
  c.id,
  '2024-01-01',
  '2025-12-31',
  '2024-12-01',
  '2024-11-01',
  11, -- Executed 11 times
  true,
  NOW(),
  NOW()
FROM categories c
WHERE c.name = 'Nhà cửa' AND (c.user_id = '59f7e681-8002-4a50-9d7d-dc7b85f43b16' OR c.user_id IS NULL)
LIMIT 1;

INSERT INTO recurring_transactions (
  id,
  user_id,
  name,
  description,
  amount,
  type,
  frequency,
  category_id,
  start_date,
  next_execution_date,
  "executionCount",
  "isActive",
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'Daily Coffee',
  'Morning coffee at Starbucks',
  50000, -- 50k VND/day
  2, -- Expense
  2, -- Daily
  c.id,
  '2024-11-01',
  '2024-11-22',
  21, -- Executed 21 times this month
  true,
  NOW(),
  NOW()
FROM categories c
WHERE c.name = 'Ăn uống' AND (c.user_id = '59f7e681-8002-4a50-9d7d-dc7b85f43b16' OR c.user_id IS NULL)
LIMIT 1;

INSERT INTO recurring_transactions (
  id,
  user_id,
  name,
  description,
  amount,
  type,
  frequency,
  category_id,
  start_date,
  next_execution_date,
  "executionCount",
  "isActive",
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'Weekly Groceries',
  'Weekly grocery shopping at supermarket',
  2000000, -- 2 million VND/week
  2, -- Expense
  3, -- Weekly
  c.id,
  '2024-01-01',
  '2024-11-25',
  47, -- Executed 47 times (weekly for 11 months)
  true,
  NOW(),
  NOW()
FROM categories c
WHERE c.name = 'Ăn uống' AND (c.user_id = '59f7e681-8002-4a50-9d7d-dc7b85f43b16' OR c.user_id IS NULL)
LIMIT 1;

INSERT INTO recurring_transactions (
  id,
  user_id,
  name,
  description,
  amount,
  type,
  frequency,
  category_id,
  start_date,
  end_date,
  next_execution_date,
  last_execution_date,
  "executionCount",
  "isActive",
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  'dbf5e836-4200-45c4-a8df-20604ad39a59',
  'Monthly Salary',
  'Monthly salary income',
  30000000, -- 30 million VND/month
  1, -- Income
  4, -- Monthly
  c.id,
  '2024-01-01',
  '2025-12-31',
  '2024-12-01',
  '2024-11-01',
  11,
  true,
  NOW(),
  NOW()
FROM categories c
WHERE c.name = 'Lương' AND (c.user_id = 'dbf5e836-4200-45c4-a8df-20604ad39a59' OR c.user_id IS NULL)
LIMIT 1;

INSERT INTO recurring_transactions (
  id,
  user_id,
  name,
  description,
  amount,
  type,
  frequency,
  category_id,
  start_date,
  next_execution_date,
  "executionCount",
  "isActive",
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(),
  'dbf5e836-4200-45c4-a8df-20604ad39a59',
  'Yearly Insurance Premium',
  'Annual health insurance payment',
  12000000, -- 12 million VND/year
  2, -- Expense
  6, -- Yearly
  c.id,
  '2024-01-01',
  '2025-01-01',
  1,
  true,
  NOW(),
  NOW()
FROM categories c
WHERE c.name = 'Sức khỏe' AND (c.user_id = 'dbf5e836-4200-45c4-a8df-20604ad39a59' OR c.user_id IS NULL)
LIMIT 1;

-- =====================================================
-- 3. SHARED BOOKS - Sample shared book data
-- =====================================================

-- Shared Book 1: Family Budget (User 1 is owner)
INSERT INTO shared_books (
  id,
  owner_id,
  name,
  description,
  "isActive",
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111', -- Fixed UUID for easier member insertion
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16', -- User 1 as owner
  'Family Budget 2024',
  'Shared family expenses and income tracking',
  true,
  NOW(),
  NOW()
);

-- Add User 2 as member (Editor) to Family Budget
INSERT INTO shared_book_members (
  id,
  shared_book_id,
  user_id,
  role,
  "isActive",
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '11111111-1111-1111-1111-111111111111',
  'dbf5e836-4200-45c4-a8df-20604ad39a59', -- User 2
  2, -- Editor
  true,
  NOW(),
  NOW()
);

-- Shared Book 2: Business Expenses (User 2 is owner)
INSERT INTO shared_books (
  id,
  owner_id,
  name,
  description,
  "isActive",
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222', -- Fixed UUID
  'dbf5e836-4200-45c4-a8df-20604ad39a59', -- User 2 as owner
  'Coffee Shop Business',
  'Business expenses tracking for coffee shop',
  true,
  NOW(),
  NOW()
);

-- Add User 1 as member (Viewer) to Business Expenses
INSERT INTO shared_book_members (
  id,
  shared_book_id,
  user_id,
  role,
  "isActive",
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '22222222-2222-2222-2222-222222222222',
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16', -- User 1
  3, -- Viewer
  true,
  NOW(),
  NOW()
);

-- Shared Book 3: Trip Planning (User 1 is owner, no members yet)
INSERT INTO shared_books (
  id,
  owner_id,
  name,
  description,
  "isActive",
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16', -- User 1 as owner
  'Vietnam Trip 2025',
  'Budget planning for Vietnam travel',
  true,
  NOW(),
  NOW()
);

-- =====================================================
-- Verification Queries (Optional - comment out when seeding)
-- =====================================================

-- Verify loans inserted
-- SELECT COUNT(*) as loan_count, type FROM loans GROUP BY type;

-- Verify recurring transactions inserted
-- SELECT COUNT(*) as recurring_count, frequency FROM recurring_transactions GROUP BY frequency;

-- Verify shared books inserted
-- SELECT sb.name, u."firstName", u."lastName", 
--        (SELECT COUNT(*) FROM shared_book_members WHERE "sharedBookId" = sb.id) as member_count
-- FROM shared_books sb
-- JOIN users u ON sb."ownerId" = u.id;
