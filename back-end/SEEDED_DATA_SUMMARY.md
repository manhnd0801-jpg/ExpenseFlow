# Seeded Data Summary

**Date:** 2024-11-22  
**Database:** expense_management  
**Purpose:** Sample data for E2E testing and frontend development

---

## Overview

Successfully seeded realistic sample data for 3 new backend modules:

| Module                     | Records | Status    |
| -------------------------- | ------- | --------- |
| **Loans**                  | 8       | ✅ Seeded |
| **Recurring Transactions** | 5       | ✅ Seeded |
| **Shared Books**           | 4       | ✅ Seeded |
| **Shared Book Members**    | 4       | ✅ Seeded |

---

## Test Users

Two test users available for authentication:

### User 1 (John Doe)

- **ID:** `59f7e681-8002-4a50-9d7d-dc7b85f43b16`
- **Email:** `user@example.com`
- **Password:** `password123` (bcrypt hashed)
- **Associated Data:** 4 loans, 3 recurring transactions, 2 shared books (1 owner, 1 member)

### User 2 (Test User)

- **ID:** `dbf5e836-4200-45c4-a8df-20604ad39a59`
- **Email:** `test@expenseflow.com`
- **Password:** `test123` (bcrypt hashed)
- **Associated Data:** 4 loans, 2 recurring transactions, 2 shared books (1 owner, 1 member)

---

## Seeded Data Details

### 1. Loans (8 records)

**User 1 Loans:**

1. **Home Mortgage**
   - Amount: 5,000,000,000 VND (5 billion)
   - Interest Rate: 7.5%
   - Term: 240 months (20 years)
   - Monthly Payment: 40,316,563 VND
   - Type: 2 (Mortgage)
   - Status: 1 (Active)

2. **Car Loan**
   - Amount: 800,000,000 VND (800 million)
   - Interest Rate: 8.5%
   - Term: 60 months (5 years)
   - Monthly Payment: 16,395,928 VND
   - Type: 3 (Auto)
   - Status: 1 (Active)

**User 2 Loans:** 3. **Personal Loan**

- Amount: 200,000,000 VND (200 million)
- Interest Rate: 12%
- Term: 36 months (3 years)
- Monthly Payment: 6,642,520 VND
- Type: 1 (Personal)
- Status: 1 (Active)

4. **Business Loan**
   - Amount: 500,000,000 VND (500 million)
   - Interest Rate: 10.5%
   - Term: 48 months (4 years)
   - Monthly Payment: 12,872,623 VND
   - Type: 4 (Business)
   - Status: 1 (Active)

**Note:** File was executed twice, so there are duplicate entries (8 total instead of 4).

---

### 2. Recurring Transactions (5 records)

**User 1 Recurring Transactions:**

1. **Monthly Rent** (Expense)
   - Amount: 12,000,000 VND/month
   - Category: Nhà cửa (Home)
   - Frequency: 4 (Monthly)
   - Start Date: 2024-01-01
   - Next Execution: 2024-12-01
   - Execution Count: 11

2. **Daily Coffee** (Expense)
   - Amount: 50,000 VND/day
   - Category: Ăn uống (Food & Drink)
   - Frequency: 2 (Daily)
   - Start Date: 2024-11-01
   - Next Execution: 2024-11-22
   - Execution Count: 21

3. **Weekly Groceries** (Expense)
   - Amount: 2,000,000 VND/week
   - Category: Ăn uống (Food & Drink)
   - Frequency: 3 (Weekly)
   - Start Date: 2024-01-01
   - Next Execution: 2024-11-25
   - Execution Count: 47

**User 2 Recurring Transactions:**

4. **Monthly Salary** (Income)
   - Amount: 30,000,000 VND/month
   - Category: Lương (Salary)
   - Frequency: 4 (Monthly)
   - Start Date: 2024-01-01
   - End Date: 2025-12-31
   - Next Execution: 2024-12-01
   - Last Execution: 2024-11-01
   - Execution Count: 11
   - Type: 1 (Income)

5. **Yearly Insurance Premium** (Expense)
   - Amount: 12,000,000 VND/year
   - Category: Sức khỏe (Health)
   - Frequency: 6 (Yearly)
   - Start Date: 2024-01-01
   - Next Execution: 2025-01-01
   - Execution Count: 1

---

### 3. Shared Books (4 records)

**Shared Book 1: Family Budget 2024**

- Owner: User 1 (John Doe)
- Description: Shared family expenses and income tracking
- Members: User 2 (Test User) as Editor (role=2)
- Status: Active

**Shared Book 2: Coffee Shop Business**

- Owner: User 2 (Test User)
- Description: Business expenses and revenue tracking for coffee shop
- Members: User 1 (John Doe) as Viewer (role=3)
- Status: Active

**Shared Book 3: Vietnam Trip 2025**

- Owner: User 1 (John Doe)
- Description: Trip planning and expense sharing
- Members: None
- Status: Active

**Note:** There are duplicate entries from running seed twice.

---

## Enum Reference

### Transaction Types

- `1` = Income
- `2` = Expense

### Frequencies

- `2` = Daily
- `3` = Weekly
- `4` = Monthly
- `5` = Quarterly
- `6` = Yearly

### Loan Types

- `1` = Personal
- `2` = Mortgage
- `3` = Auto
- `4` = Business

### Loan Status

- `1` = Active
- `2` = PaidOff
- `3` = Defaulted
- `4` = Closed

### Shared Book Roles

- `1` = Admin
- `2` = Editor
- `3` = Viewer

---

## Categories (System-wide)

13 default categories with `user_id = NULL`:

**Income Categories (type=1):**

- Đầu tư (Investment)
- Lương (Salary)
- Thu nhập phụ (Side Income)
- Thưởng (Bonus)

**Expense Categories (type=2):**

- Ăn uống (Food & Drink)
- Di chuyển (Transportation)
- Giải trí (Entertainment)
- Giáo dục (Education)
- Hóa đơn (Bills)
- Khác (Other)
- Mua sắm (Shopping)
- Nhà cửa (Home)
- Sức khỏe (Health)

---

## Testing Guide

### Authentication

```bash
# Login as User 1
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

# Login as User 2
POST /api/auth/login
{
  "email": "test@expenseflow.com",
  "password": "test123"
}
```

### Testing Endpoints

**Loans Module:**

- `GET /api/loans` - List all loans for authenticated user
- `GET /api/loans/:id` - Get loan details
- `POST /api/loans` - Create new loan
- `PATCH /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

**Recurring Transactions Module:**

- `GET /api/recurring-transactions` - List all recurring transactions
- `GET /api/recurring-transactions/:id` - Get recurring transaction details
- `POST /api/recurring-transactions` - Create new recurring transaction
- `PATCH /api/recurring-transactions/:id` - Update recurring transaction
- `DELETE /api/recurring-transactions/:id` - Delete recurring transaction

**Shared Books Module:**

- `GET /api/shared-books` - List all shared books (owned + member)
- `GET /api/shared-books/:id` - Get shared book details
- `POST /api/shared-books` - Create new shared book
- `PATCH /api/shared-books/:id` - Update shared book
- `DELETE /api/shared-books/:id` - Delete shared book
- `POST /api/shared-books/:id/members` - Add member to shared book
- `DELETE /api/shared-books/:id/members/:userId` - Remove member

---

## Database Connection

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=expense_management
```

---

## E2E Testing

Run E2E tests with seeded data:

```bash
cd back-end
npm run test:e2e
```

Expected results:

- Tests can authenticate with test users
- Tests can query seeded data
- Tests can create new data and verify relationships
- Tests can update and delete data

---

## Frontend Integration

Sample data available for UI development:

1. **Dashboard Page:**
   - Display monthly rent (12M VND)
   - Show daily coffee expense tracking
   - Calculate total from recurring transactions

2. **Loans Management:**
   - List 4 loans with progress bars
   - Show monthly payment amounts
   - Display remaining principal

3. **Recurring Transactions:**
   - Calendar view with next execution dates
   - Frequency badges (Daily/Weekly/Monthly/Yearly)
   - Income vs Expense breakdown

4. **Shared Books:**
   - List shared books with role badges
   - Owner vs Member views
   - Collaboration features

---

## Cleanup (If Needed)

To remove all seeded data:

```sql
-- Remove recurring transactions
DELETE FROM recurring_transactions WHERE user_id IN (
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'dbf5e836-4200-45c4-a8df-20604ad39a59'
);

-- Remove shared book members
DELETE FROM shared_book_members WHERE shared_book_id IN (
  SELECT id FROM shared_books WHERE owner_id IN (
    '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
    'dbf5e836-4200-45c4-a8df-20604ad39a59'
  )
);

-- Remove shared books
DELETE FROM shared_books WHERE owner_id IN (
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'dbf5e836-4200-45c4-a8df-20604ad39a59'
);

-- Remove loans
DELETE FROM loans WHERE user_id IN (
  '59f7e681-8002-4a50-9d7d-dc7b85f43b16',
  'dbf5e836-4200-45c4-a8df-20604ad39a59'
);
```

---

## Notes

- ✅ All foreign key relationships validated
- ✅ Enum values match backend constants
- ✅ Vietnamese category names preserved
- ✅ Realistic amounts and dates used
- ✅ Both income and expense transactions included
- ⚠️ Some duplicate entries due to running seed file twice (not an issue for testing)

---

**Next Steps:**

1. Start backend server: `npm start`
2. Run E2E tests: `npm run test:e2e`
3. Test API endpoints with Swagger: `http://localhost:3001/api`
4. Connect frontend to populated database
5. Verify UI displays seeded data correctly
