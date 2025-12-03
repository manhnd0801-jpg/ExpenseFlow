# Thiết Kế Cơ Sở Dữ Liệu Chi Tiết

## 1. Database Schema Overview

### 1.1. Core Tables

1. **users** - Quản lý người dùng
2. **accounts** - Tài khoản/ví tiền
3. **categories** - Danh mục thu chi
4. **transactions** - Giao dịch
5. **budgets** - Ngân sách
6. **goals** - Mục tiêu tài chính
7. **debts** - Công nợ
8. **debt_payments** - Thanh toán công nợ
9. **events** - Sự kiện/Dự án
10. **recurring_transactions** - Giao dịch định kỳ
11. **reminders** - Nhắc nhở
12. **shared_books** - Sổ chia sẻ
13. **shared_book_members** - Thành viên sổ chia sẻ
14. **notifications** - Thông báo

---

## 2. Numeric Enum Standards (Integer-Based)

**Tại sao sử dụng Integer thay vì VARCHAR/TEXT:**

✅ **Ưu điểm:**

- **Performance**: So sánh số nhanh hơn nhiều so với string
- **Storage**: Tiết kiệm dung lượng (SMALLINT = 2 bytes vs VARCHAR = nhiều bytes)
- **Index Performance**: Index trên số cực nhanh
- **Network Transfer**: Gửi số nhẹ hơn gửi string
- **Đồng bộ FE-BE**: Dễ dàng sync constants giữa Frontend và Backend
- **Type-Safety**: Validate bằng CHECK constraint hoặc TypeScript enum
- **Maintainable**: Thêm giá trị mới không ảnh hưởng database structure

✅ **So sánh với PostgreSQL ENUM:**

- Linh hoạt hơn: Thêm/sửa/xóa giá trị dễ dàng (không cần ALTER TYPE)
- Portable: Dễ migrate sang database khác (MySQL, SQL Server)
- Performance tương đương (cả 2 đều lưu dưới dạng số)

📋 **Quy ước:**

- Sử dụng `SMALLINT` cho các trường type/status (hỗ trợ -32,768 đến 32,767)
- Bắt đầu từ 1 (không dùng 0 để tránh nhầm lẫn với NULL/false)
- Định nghĩa constants ở cả Backend và Frontend (MUST đồng bộ)

📋 **Quy ước:**

- Sử dụng `SMALLINT` cho các trường type/status (hỗ trợ -32,768 đến 32,767)
- Bắt đầu từ 1 (không dùng 0 để tránh nhầm lẫn với NULL/false)
- Định nghĩa constants ở cả Backend và Frontend (MUST đồng bộ)

---

### 2.1. Constants Mapping (Backend & Frontend MUST Sync)

**File: `backend/src/common/constants/enums.ts` (Backend - NestJS)**

```typescript
// Account Types
export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
  E_WALLET = 4,
  INVESTMENT = 5,
}

// Category Types
export enum CategoryType {
  INCOME = 1,
  EXPENSE = 2,
}

// Transaction Types
export enum TransactionType {
  INCOME = 1,
  EXPENSE = 2,
  TRANSFER = 3,
}

// Budget Periods
export enum BudgetPeriod {
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
  QUARTERLY = 4,
  YEARLY = 5,
  CUSTOM = 6,
}

// Goal Status
export enum GoalStatus {
  ACTIVE = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

// Contribution Frequency
export enum ContributionFrequency {
  WEEKLY = 1,
  MONTHLY = 2,
}

// Debt Types
export enum DebtType {
  LENDING = 1, // Cho vay
  BORROWING = 2, // Đi vay
}

// Debt Status
export enum DebtStatus {
  ACTIVE = 1,
  PARTIAL_PAID = 2,
  FULLY_PAID = 3,
  OVERDUE = 4,
}

// Payment Frequency
export enum PaymentFrequency {
  MONTHLY = 1,
  QUARTERLY = 2,
  YEARLY = 3,
  ONE_TIME = 4,
}

// Loan Types
export enum LoanType {
  PERSONAL = 1,
  MORTGAGE = 2,
  AUTO = 3,
  BUSINESS = 4,
  OTHER = 5,
}

// Loan Status
export enum LoanStatus {
  ACTIVE = 1,
  PAID_OFF = 2,
  DEFAULTED = 3,
  REFINANCED = 4,
}

// Payment Status
export enum PaymentStatus {
  PENDING = 1,
  PAID = 2,
  OVERDUE = 3,
  SKIPPED = 4,
}

// Prepayment Strategy
export enum PrepaymentStrategy {
  REDUCE_TERM = 1, // Giữ nguyên số tiền trả, giảm số tháng
  REDUCE_PAYMENT = 2, // Giữ nguyên số tháng, giảm số tiền trả
}

// Recurring Frequency
export enum RecurringFrequency {
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
  YEARLY = 4,
}

// Reminder Types
export enum ReminderType {
  PAYMENT = 1,
  DEBT = 2,
  BUDGET = 3,
  CUSTOM = 4,
}

// Reminder Frequency
export enum ReminderFrequency {
  ONCE = 1,
  DAILY = 2,
  WEEKLY = 3,
  MONTHLY = 4,
}

// Shared Book Roles
export enum BookRole {
  VIEWER = 1,
  EDITOR = 2,
  ADMIN = 3,
}

// Notification Types
export enum NotificationType {
  BUDGET_ALERT = 1,
  DEBT_REMINDER = 2,
  GOAL_ACHIEVED = 3,
  PAYMENT_DUE = 4,
  SYSTEM = 5,
}
```

**Helper functions để convert giữa số và label:**

```typescript
// backend/src/common/constants/enum-labels.ts
export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.CASH]: 'Tiền mặt',
  [AccountType.BANK]: 'Ngân hàng',
  [AccountType.CREDIT_CARD]: 'Thẻ tín dụng',
  [AccountType.E_WALLET]: 'Ví điện tử',
  [AccountType.INVESTMENT]: 'Đầu tư',
};

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.INCOME]: 'Thu nhập',
  [TransactionType.EXPENSE]: 'Chi tiêu',
  [TransactionType.TRANSFER]: 'Chuyển khoản',
};

export const LoanStatusLabels: Record<LoanStatus, string> = {
  [LoanStatus.ACTIVE]: 'Đang vay',
  [LoanStatus.PAID_OFF]: 'Đã trả hết',
  [LoanStatus.DEFAULTED]: 'Nợ xấu',
  [LoanStatus.REFINANCED]: 'Tái cấu trúc',
};

// Utility function
export function getEnumLabel<T extends number>(value: T, labels: Record<T, string>): string {
  return labels[value] || 'Unknown';
}
```

**File: `frontend/src/constants/enums.ts` (Frontend - React)**

```typescript
// ⭐ MUST match EXACTLY with backend enums
// Copy toàn bộ từ backend hoặc import từ shared package

export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
  E_WALLET = 4,
  INVESTMENT = 5,
}

export enum TransactionType {
  INCOME = 1,
  EXPENSE = 2,
  TRANSFER = 3,
}

export enum CategoryType {
  INCOME = 1,
  EXPENSE = 2,
}

// ... (copy tất cả enums từ backend)

// Frontend labels (Vietnamese)
export const AccountTypeLabels: Record<AccountType, string> = {
  [AccountType.CASH]: 'Tiền mặt',
  [AccountType.BANK]: 'Ngân hàng',
  [AccountType.CREDIT_CARD]: 'Thẻ tín dụng',
  [AccountType.E_WALLET]: 'Ví điện tử',
  [AccountType.INVESTMENT]: 'Đầu tư',
};

// Helper để tạo options cho Select component
export function getEnumOptions<T extends number>(enumObj: object, labels: Record<T, string>) {
  return Object.values(enumObj)
    .filter((v) => typeof v === 'number')
    .map((value) => ({
      value: value as T,
      label: labels[value as T],
    }));
}
```

### 2.2. Cách Sử Dụng Integer Enum trong Code

**Backend (NestJS):**

```typescript
// Entity definition
import { Entity, Column } from 'typeorm';
import { AccountType } from '../common/constants/enums';

@Entity('accounts')
export class Account {
  @Column({
    type: 'smallint',
    comment: '1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment',
  })
  type: AccountType;
}

// DTO validation
import { IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAccountDto {
  @IsEnum(AccountType, {
    message: 'Type must be 1(Cash), 2(Bank), 3(Credit Card), 4(E-Wallet), or 5(Investment)',
  })
  @IsInt()
  @Type(() => Number) // Transform string to number
  type: AccountType;
}

// Service usage
const account = new Account();
account.type = AccountType.BANK; // Type-safe! Value = 2

// Response DTO - có thể include label
export class AccountResponseDto {
  id: string;
  name: string;
  type: AccountType;
  typeLabel: string; // "Ngân hàng"

  static from(account: Account): AccountResponseDto {
    return {
      ...account,
      typeLabel: AccountTypeLabels[account.type],
    };
  }
}
```

**Frontend (React + TypeScript):**

```typescript
import { AccountType, AccountTypeLabels, getEnumOptions } from '@/constants/enums';
import { Select } from 'antd';

// Component
const AccountForm: React.FC = () => {
  const [type, setType] = useState<AccountType>(AccountType.CASH); // Value = 1

  // Generate Select options
  const accountTypeOptions = getEnumOptions(AccountType, AccountTypeLabels);
  // Result: [
  //   { value: 1, label: 'Tiền mặt' },
  //   { value: 2, label: 'Ngân hàng' },
  //   { value: 3, label: 'Thẻ tín dụng' },
  //   ...
  // ]

  return <Select value={type} onChange={setType} options={accountTypeOptions} />;
};

// API call - gửi số
const createAccount = async (data: ICreateAccount) => {
  await axios.post('/accounts', {
    ...data,
    type: AccountType.BANK, // Gửi số 2, KHÔNG phải string
  });
};

// Display label
const AccountCard: React.FC<{ account: IAccount }> = ({ account }) => {
  return (
    <div>
      <span>Loại: {AccountTypeLabels[account.type]}</span>
      {/* Hiển thị: "Loại: Ngân hàng" */}
    </div>
  );
};
```

**SQL Queries:**

```sql
-- Insert với số
INSERT INTO accounts (user_id, name, type)
VALUES ('uuid-xxx', 'My Bank', 2); -- 2 = Bank

-- Query
SELECT * FROM accounts WHERE type = 2; -- Bank accounts

-- Query với label (dùng CASE)
SELECT
  id,
  name,
  type,
  CASE type
    WHEN 1 THEN 'Tiền mặt'
    WHEN 2 THEN 'Ngân hàng'
    WHEN 3 THEN 'Thẻ tín dụng'
    WHEN 4 THEN 'Ví điện tử'
    WHEN 5 THEN 'Đầu tư'
  END as type_label
FROM accounts;

-- Aggregation (rất nhanh với số)
SELECT type, COUNT(*)
FROM accounts
GROUP BY type;
```

---

## 3. Detailed Table Definitions

### 3.1. Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),

    -- Settings
    language VARCHAR(10) DEFAULT 'vi',
    currency VARCHAR(10) DEFAULT 'VND',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',

    -- Security
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### 2.2. Accounts Table

```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,

    -- Account Type: 1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment
    type SMALLINT NOT NULL,

    balance DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'VND',

    -- For credit cards
    credit_limit DECIMAL(15, 2),
    billing_date INTEGER, -- 1-31
    payment_due_date INTEGER, -- 1-31

    -- Additional info
    bank_name VARCHAR(255),
    account_number VARCHAR(100),
    icon VARCHAR(100),
    color VARCHAR(20),

    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_balance CHECK (balance >= 0 OR type = 3),
    CONSTRAINT valid_account_type CHECK (type BETWEEN 1 AND 5)
);

-- Indexes
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_active ON accounts(user_id, is_active);
```

### 2.3. Categories Table

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    type SMALLINT NOT NULL, -- 1=Income, 2=Expense

    icon VARCHAR(100),
    color VARCHAR(20),

    -- Hierarchy support
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    is_default BOOLEAN DEFAULT FALSE, -- System default categories
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

### 2.4. Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

    -- Transaction details
    amount DECIMAL(15, 2) NOT NULL,
    type SMALLINT NOT NULL, -- 1=Income, 2=Expense, 3=Transfer

    transaction_date DATE NOT NULL,

    note TEXT,

    -- For transfers between accounts
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,

    -- Receipt/Invoice
    image_url VARCHAR(500),

    -- ⭐ NEW: Link to related entities
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    debt_id UUID REFERENCES debts(id) ON DELETE SET NULL, -- NEW: Link to debt
    loan_id UUID REFERENCES loans(id) ON DELETE SET NULL,

    -- Tags for better categorization
    tags VARCHAR(255)[], -- Array of tags

    -- Recurring transaction reference
    recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,

    -- Description with context
    description TEXT, -- Auto-generated description (VD: "Cho vay: John Doe - 10,000,000 VND")

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Indexes (Critical for performance)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_event ON transactions(event_id);
CREATE INDEX idx_transactions_goal ON transactions(goal_id);
CREATE INDEX idx_transactions_debt ON transactions(debt_id); -- NEW: Query by debt
CREATE INDEX idx_transactions_loan ON transactions(loan_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

**Ví dụ Transaction khi tạo Debt:**

```sql
-- Cho vay (Lending) - EXPENSE transaction
INSERT INTO transactions VALUES (
    user_id = 'user-xxx',
    account_id = 'account-cash', -- Trừ tiền từ tài khoản tiền mặt
    category_id = 'category-lending', -- Category "Cho vay"
    amount = 20000000,
    type = 2, -- EXPENSE
    transaction_date = '2025-12-03',
    debt_id = 'debt-xxx',
    description = 'Cho vay: John Doe - 20,000,000 VND',
    note = 'Cho vay trả góp trong 6 tháng'
);

-- Đi vay (Borrowing) - INCOME transaction
INSERT INTO transactions VALUES (
    user_id = 'user-yyy',
    account_id = 'account-bank', -- Cộng tiền vào tài khoản ngân hàng
    category_id = 'category-borrowing', -- Category "Vay nợ"
    amount = 100000000,
    type = 1, -- INCOME
    transaction_date = '2025-12-03',
    debt_id = 'debt-yyy',
    description = 'Vay nợ: ABC Bank - 100,000,000 VND',
    note = 'Vay ngân hàng lãi suất 12%/năm'
);

-- Thu nợ (Lending Payment) - INCOME transaction
INSERT INTO transactions VALUES (
    user_id = 'user-xxx',
    account_id = 'account-bank',
    category_id = 'category-debt-collection',
    amount = 5000000,
    type = 1, -- INCOME
    transaction_date = '2025-12-10',
    debt_id = 'debt-xxx',
    description = 'Thu nợ từ John Doe - Kỳ 1',
    note = 'Đã thu 5 triệu'
);

-- Trả nợ (Borrowing Payment) - EXPENSE transaction
INSERT INTO transactions VALUES (
    user_id = 'user-yyy',
    account_id = 'account-bank',
    category_id = 'category-debt-repayment',
    amount = 11000000, -- 10M gốc + 1M lãi
    type = 2, -- EXPENSE
    transaction_date = '2025-12-10',
    debt_id = 'debt-yyy',
    description = 'Trả nợ ABC Bank - Tháng 12 (10M gốc + 1M lãi)',
    note = 'Đã trả đúng hạn'
);
```

### 2.5. Budgets Table

```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,

    -- Period: 1=Daily, 2=Weekly, 3=Monthly, 4=Quarterly, 5=Yearly, 6=Custom
    period SMALLINT NOT NULL,

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Alert thresholds
    alert_at_percentage INTEGER DEFAULT 80, -- Alert at 80%

    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_amount CHECK (amount > 0),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_period CHECK (period BETWEEN 1 AND 6)
);

-- Indexes
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(user_id, start_date, end_date);
CREATE INDEX idx_budgets_active ON budgets(is_active);
```

### 2.6. Goals Table

```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,

    deadline DATE,

    status SMALLINT DEFAULT 1, -- 1=Active, 2=Completed, 3=Cancelled

    icon VARCHAR(100),
    color VARCHAR(20),

    -- Auto contribution settings
    auto_contribute BOOLEAN DEFAULT FALSE,
    contribution_amount DECIMAL(15, 2),
    contribution_frequency SMALLINT, -- 1=Weekly, 2=Monthly

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    CONSTRAINT positive_target CHECK (target_amount > 0),
    CONSTRAINT valid_current_amount CHECK (current_amount >= 0),
    CONSTRAINT valid_goal_status CHECK (status BETWEEN 1 AND 3),
    CONSTRAINT valid_contribution_frequency CHECK (contribution_frequency IS NULL OR contribution_frequency BETWEEN 1 AND 2)
);

-- Indexes
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_deadline ON goals(deadline);
```

### 2.7. Debts Table (Công Nợ - Tích Hợp với Accounts & Transactions)

**Thiết kế quan trọng:**

- Mỗi debt PHẢI liên kết với Account (tài khoản nguồn/đích)
- Mỗi debt PHẢI tạo Transaction khi khởi tạo
- Mỗi debt_payment PHẢI tạo Transaction khi thanh toán
- Đảm bảo số dư Account luôn đồng bộ với transactions

```sql
CREATE TABLE debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Debt type: 1=Lending(Cho vay), 2=Borrowing(Đi vay)
    type SMALLINT NOT NULL,

    -- Person/Organization info
    person_name VARCHAR(255) NOT NULL, -- Name of lender/borrower
    contact_info VARCHAR(255), -- Phone/Email

    -- Amount tracking
    original_amount DECIMAL(15, 2) NOT NULL, -- Số tiền gốc ban đầu (KHÔNG thay đổi)
    remaining_amount DECIMAL(15, 2) NOT NULL, -- Số tiền còn lại (giảm khi trả)
    total_interest_paid DECIMAL(15, 2) DEFAULT 0, -- Tổng lãi đã trả/thu

    interest_rate DECIMAL(5, 2) DEFAULT 0, -- % lãi suất năm

    -- Dates (TIMESTAMP for precise tracking)
    borrowed_date TIMESTAMP NOT NULL, -- Ngày vay/cho vay
    due_date TIMESTAMP, -- Hạn trả (tùy chọn)

    payment_frequency SMALLINT, -- 1=Monthly, 2=Quarterly, 3=Yearly, 4=One-time

    -- Status: 1=Active, 2=Partial Paid, 3=Fully Paid, 4=Overdue
    status SMALLINT DEFAULT 1,

    -- ⭐ CRITICAL: Link to Account & Transaction
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    -- Tài khoản nguồn (Lending) hoặc đích (Borrowing)
    -- Không cho phép xóa account nếu còn debt liên kết (RESTRICT)

    initial_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    -- Transaction được tạo khi khởi tạo debt
    -- Lending: EXPENSE transaction (trừ tiền khỏi account)
    -- Borrowing: INCOME transaction (cộng tiền vào account)

    description TEXT, -- Ghi chú mô tả khoản nợ
    notes TEXT, -- Ghi chú nội bộ

    -- Reminder settings
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 3, -- Nhắc trước X ngày

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete

    CONSTRAINT positive_amounts CHECK (
        original_amount > 0 AND
        remaining_amount >= 0 AND
        total_interest_paid >= 0
    ),
    CONSTRAINT valid_debt_type CHECK (type IN (1, 2)),
    CONSTRAINT valid_debt_status CHECK (status BETWEEN 1 AND 4),
    CONSTRAINT valid_payment_frequency CHECK (payment_frequency IS NULL OR payment_frequency BETWEEN 1 AND 4)
);

-- Indexes (Critical for performance)
CREATE INDEX idx_debts_user ON debts(user_id);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_due_date ON debts(due_date);
CREATE INDEX idx_debts_account ON debts(account_id); -- NEW: Query by account
CREATE INDEX idx_debts_active ON debts(user_id, status) WHERE status IN (1, 2, 4) AND deleted_at IS NULL;
```

### 2.8. Debt Payments Table (Lịch Sử Thanh Toán Công Nợ)

**Thiết kế quan trọng:**

- Mỗi payment PHẢI tạo Transaction tương ứng
- Lending payment → INCOME transaction (thu tiền về account)
- Borrowing payment → EXPENSE transaction (trừ tiền khỏi account)
- Phân tách rõ gốc (principal) và lãi (interest)

```sql
CREATE TABLE debt_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,

    -- Payment amounts
    amount DECIMAL(15, 2) NOT NULL, -- Tổng số tiền thanh toán
    principal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Phần gốc
    interest_amount DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Phần lãi

    payment_date TIMESTAMP NOT NULL, -- Ngày thanh toán thực tế

    -- ⭐ CRITICAL: Link to Account & Transaction
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    -- Tài khoản nhận tiền (Lending) hoặc trả tiền (Borrowing)

    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    -- Transaction được tạo khi ghi nhận payment
    -- Lending: INCOME transaction (cộng tiền vào account)
    -- Borrowing: EXPENSE transaction (trừ tiền khỏi account)

    -- Balance after this payment
    remaining_balance_after DECIMAL(15, 2) NOT NULL, -- Số dư còn lại sau payment này

    -- Payment metadata
    payment_method VARCHAR(100), -- Cash, Bank Transfer, etc.
    reference_number VARCHAR(255), -- Mã tham chiếu (bill number, transfer code)

    note TEXT, -- Ghi chú cho payment này

    -- Status: 1=Pending, 2=Completed, 3=Failed, 4=Cancelled
    status SMALLINT DEFAULT 2,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_amounts CHECK (
        amount > 0 AND
        principal_amount >= 0 AND
        interest_amount >= 0 AND
        remaining_balance_after >= 0
    ),
    CONSTRAINT valid_split CHECK (amount = principal_amount + interest_amount),
    CONSTRAINT valid_status CHECK (status BETWEEN 1 AND 4)
);

-- Indexes (Critical for performance)
CREATE INDEX idx_debt_payments_debt ON debt_payments(debt_id, payment_date DESC);
CREATE INDEX idx_debt_payments_date ON debt_payments(payment_date DESC);
CREATE INDEX idx_debt_payments_account ON debt_payments(account_id); -- NEW: Query by account
CREATE INDEX idx_debt_payments_status ON debt_payments(status);
```

**Ví dụ dữ liệu:**

```sql
-- Lending payment (Thu nợ)
INSERT INTO debt_payments VALUES (
    debt_id = 'xxx-lending-debt-id',
    amount = 5000000,
    principal_amount = 5000000,
    interest_amount = 0,
    payment_date = '2025-12-03',
    account_id = 'account-xxx', -- Tài khoản nhận tiền
    transaction_id = 'transaction-yyy', -- INCOME transaction
    remaining_balance_after = 15000000,
    note = 'Thu nợ kỳ 1 từ John Doe'
);

-- Borrowing payment (Trả nợ)
INSERT INTO debt_payments VALUES (
    debt_id = 'zzz-borrowing-debt-id',
    amount = 11000000,
    principal_amount = 10000000,
    interest_amount = 1000000, -- Lãi
    payment_date = '2025-12-03',
    account_id = 'account-zzz', -- Tài khoản trả tiền
    transaction_id = 'transaction-www', -- EXPENSE transaction
    remaining_balance_after = 90000000,
    note = 'Trả nợ tháng 12 cho ABC Bank'
);
```

### 2.8B. Loans Table (Khoản Vay có Amortization)

**Lưu ý quan trọng về Payment Strategy:**

- Hệ thống KHÔNG hỗ trợ tùy chọn strategy (reduce_term vs reduce_payment)
- Mặc định: Trả gốc tự do → Giảm monthlyPayment, GIỮ NGUYÊN termMonths
- Lý do: "Vay 60 tháng thì phải trả 60 tháng, chỉ giảm số tiền phải trả hàng tháng"

```sql
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Loan details
    name VARCHAR(255) NOT NULL, -- Tên khoản vay (VD: "Vay mua xe")
    lender VARCHAR(255), -- Tên ngân hàng/người cho vay
    type SMALLINT NOT NULL, -- 1=Personal, 2=Mortgage, 3=Auto, 4=Business, 5=Other

    original_amount DECIMAL(15, 2) NOT NULL, -- Số tiền vay gốc ban đầu (KHÔNG THAY ĐỔI)
    remaining_principal DECIMAL(15, 2) NOT NULL, -- Số gốc còn lại (giảm khi trả)

    interest_rate DECIMAL(5, 2) NOT NULL, -- % lãi suất năm (VD: 12.0)

    -- Loan term (KHÔNG THAY ĐỔI sau khi tạo)
    term_months INTEGER NOT NULL, -- Tổng số tháng vay (VD: 60)
    remaining_months INTEGER NOT NULL, -- Số tháng còn lại (giảm khi trả theo lịch)

    -- Monthly payment (CÓ THỂ THAY ĐỔI khi trả gốc tự do)
    monthly_payment DECIMAL(15, 2) NOT NULL, -- Số tiền trả hàng tháng hiện tại

    -- Dates (TIMESTAMP for precise tracking)
    start_date TIMESTAMP NOT NULL, -- Ngày ký hợp đồng vay
    disbursement_date TIMESTAMP, -- Ngày giải ngân thực tế (khi chọn account)
    next_payment_date TIMESTAMP, -- Ngày trả tiếp theo (disbursement_date + 1 tháng)
    last_payment_date TIMESTAMP, -- Ngày trả gần nhất

    status SMALLINT DEFAULT 1, -- 1=Active, 2=Paid Off, 3=Defaulted, 4=Refinanced

    -- Tracking
    total_principal_paid DECIMAL(15, 2) DEFAULT 0, -- Tổng gốc đã trả
    total_interest_paid DECIMAL(15, 2) DEFAULT 0, -- Tổng lãi đã trả
    total_prepayment DECIMAL(15, 2) DEFAULT 0, -- Tổng trả gốc tự do

    -- Account for payments
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL, -- Tài khoản giải ngân

    -- Optional fields
    description TEXT,
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 3,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete

    CONSTRAINT positive_amounts CHECK (
        original_amount > 0 AND
        remaining_principal >= 0 AND
        interest_rate >= 0 AND
        term_months > 0 AND
        remaining_months >= 0 AND
        monthly_payment >= 0
    ),
    CONSTRAINT valid_loan_type CHECK (type BETWEEN 1 AND 5),
    CONSTRAINT valid_loan_status CHECK (status BETWEEN 1 AND 4)
);

-- Indexes
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_next_payment ON loans(next_payment_date);
CREATE INDEX idx_loans_active ON loans(user_id, status) WHERE status = 1 AND deleted_at IS NULL;
```

### 2.8C. Loan Payments Table (Lịch Sử Thanh Toán Khoản Vay)

**Phân biệt 2 loại thanh toán:**

1. **Scheduled Payment** (isPrepayment=false): Thanh toán theo lịch hàng tháng
2. **Extra Principal Payment** (isPrepayment=true): Trả gốc tự do ngoài lịch

```sql
CREATE TABLE loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,

    payment_number INTEGER, -- Kỳ trả thứ mấy (1, 2, 3...) - NULL nếu là extra principal

    payment_date TIMESTAMP NOT NULL, -- Ngày thanh toán thực tế (with time)
    due_date TIMESTAMP, -- Ngày đáo hạn theo lịch (NULL nếu là extra principal)

    -- Payment amounts
    amount DECIMAL(15, 2) NOT NULL, -- Tổng số tiền trả
    principal_amount DECIMAL(15, 2) NOT NULL, -- Phần gốc
    interest_amount DECIMAL(15, 2) NOT NULL, -- Phần lãi
    prepayment_amount DECIMAL(15, 2) DEFAULT 0, -- = amount nếu isPrepayment=true

    -- Balance after payment
    remaining_principal DECIMAL(15, 2) NOT NULL, -- Số gốc còn lại sau khi trả

    status SMALLINT DEFAULT 2, -- 1=Pending, 2=Paid, 3=Failed, 4=Skipped

    -- Payment type flags
    is_prepayment BOOLEAN DEFAULT FALSE, -- TRUE = Trả gốc tự do
    is_scheduled BOOLEAN DEFAULT FALSE, -- TRUE = Thanh toán theo lịch

    -- State before this payment (for reversal)
    previous_remaining_months INTEGER, -- Để restore khi delete payment
    previous_monthly_payment DECIMAL(15, 2), -- Để restore khi delete payment

    -- Link to transaction
    transaction_id VARCHAR(255), -- UUID của transaction liên quan

    note TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_amounts CHECK (
        amount >= 0 AND
        principal_amount >= 0 AND
        interest_amount >= 0 AND
        prepayment_amount >= 0
    ),
    CONSTRAINT valid_status CHECK (status BETWEEN 1 AND 4)
);

-- Indexes
CREATE INDEX idx_loan_payments_loan ON loan_payments(loan_id, payment_number);
CREATE INDEX idx_loan_payments_due_date ON loan_payments(due_date);
CREATE INDEX idx_loan_payments_status ON loan_payments(status);
CREATE INDEX idx_loan_payments_type ON loan_payments(loan_id, is_prepayment);
```

**Ví dụ dữ liệu:**

```sql
-- Scheduled payment (tháng 1)
INSERT INTO loan_payments VALUES (
    loan_id = 'xxx',
    payment_number = 1,
    payment_date = '2025-12-03',
    due_date = '2025-12-03',
    amount = 16800000,
    principal_amount = 15800000,
    interest_amount = 1000000,
    prepayment_amount = 0,
    remaining_principal = 984200000,
    status = 2, -- Paid
    is_prepayment = FALSE,
    is_scheduled = TRUE
);

-- Extra principal payment
INSERT INTO loan_payments VALUES (
    loan_id = 'xxx',
    payment_number = NULL,
    payment_date = '2025-12-03',
    due_date = NULL,
    amount = 200000000,
    principal_amount = 200000000,
    interest_amount = 0,
    prepayment_amount = 200000000,
    remaining_principal = 784200000,
    status = 2, -- Paid
    is_prepayment = TRUE,
    is_scheduled = FALSE,
    previous_remaining_months = 60,
    previous_monthly_payment = 16800000
);
```

### 2.8D. Payment Schedule View (Lịch Trả Nợ với Trạng Thái)

**Lưu ý:** Backend tạo payment schedule động, KHÔNG lưu vào database

- Generate 60 tháng schedule on-the-fly khi request API
- Tháng đã trả: Lấy data thực từ loan_payments (giữ nguyên số tiền lịch sử)
- Tháng chưa trả: Tính toán với monthlyPayment hiện tại (đã giảm sau khi trả gốc)

```sql
-- View để tracking lịch sử thanh toán (không phải schedule)
CREATE VIEW loan_payment_history AS
SELECT
    lp.loan_id,
    l.name AS loan_name,
    l.lender,
    lp.payment_number,
    lp.payment_date,
    lp.due_date,
    lp.amount,
    lp.principal_amount,
    lp.interest_amount,
    lp.prepayment_amount,
    lp.remaining_principal,
    lp.status,
    lp.is_prepayment,
    lp.is_scheduled,
    lp.note,
    -- Cumulative totals (chỉ tính scheduled payments)
    SUM(CASE WHEN lp.is_scheduled THEN lp.principal_amount ELSE 0 END) OVER (
        PARTITION BY lp.loan_id
        ORDER BY lp.payment_date, lp.created_at
    ) as cumulative_scheduled_principal,
    SUM(CASE WHEN lp.is_scheduled THEN lp.interest_amount ELSE 0 END) OVER (
        PARTITION BY lp.loan_id
        ORDER BY lp.payment_date, lp.created_at
    ) as cumulative_scheduled_interest,
    -- Tổng trả gốc tự do
    SUM(CASE WHEN lp.is_prepayment THEN lp.prepayment_amount ELSE 0 END) OVER (
        PARTITION BY lp.loan_id
        ORDER BY lp.payment_date, lp.created_at
    ) as cumulative_prepayment
FROM loan_payments lp
JOIN loans l ON l.id = lp.loan_id
WHERE lp.status = 2 -- Paid
ORDER BY lp.payment_date DESC, lp.created_at DESC;
```

ORDER BY lp.loan_id, lp.payment_number;

````

### 2.9. Events Table

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    budget DECIMAL(15, 2),

    start_date DATE,
    end_date DATE,

    icon VARCHAR(100),
    color VARCHAR(20),

    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_active ON events(is_active);
````

### 2.10. Recurring Transactions Table

```sql
CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

    amount DECIMAL(15, 2) NOT NULL,
    type SMALLINT NOT NULL, -- 1=Income, 2=Expense

    note TEXT,

    frequency SMALLINT NOT NULL, -- 1=Daily, 2=Weekly, 3=Monthly, 4=Yearly

    -- For monthly: 1-31 (day of month)
    -- For weekly: 0-6 (0=Sunday)
    day_of_period INTEGER,

    start_date DATE NOT NULL,
    end_date DATE,

    next_occurrence DATE NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Indexes
CREATE INDEX idx_recurring_user ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next ON recurring_transactions(next_occurrence);
CREATE INDEX idx_recurring_active ON recurring_transactions(is_active);
```

### 2.11. Reminders Table

```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    type SMALLINT NOT NULL, -- 1=Payment, 2=Debt, 3=Budget, 4=Custom

    due_date TIMESTAMP NOT NULL,

    frequency SMALLINT DEFAULT 1, -- 1=Once, 2=Daily, 3=Weekly, 4=Monthly

    -- Reference IDs
    debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,

    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,

    -- Notification settings
    notify_before_minutes INTEGER DEFAULT 60, -- Remind 1 hour before

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_active ON reminders(is_active, is_completed);
```

### 2.12. Shared Books Table

```sql
CREATE TABLE shared_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_shared_books_owner ON shared_books(owner_id);
```

### 2.13. Shared Book Members Table

```sql
CREATE TABLE shared_book_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES shared_books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role SMALLINT NOT NULL DEFAULT 1, -- 1=Viewer, 2=Editor, 3=Admin

    -- Timestamps
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_book_member UNIQUE(book_id, user_id),
    CONSTRAINT valid_role CHECK (role BETWEEN 1 AND 3)
);

-- Indexes
CREATE INDEX idx_shared_members_book ON shared_book_members(book_id);
CREATE INDEX idx_shared_members_user ON shared_book_members(user_id);
```

### 2.14. Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    type SMALLINT NOT NULL, -- 1=Budget Alert, 2=Debt Reminder, 3=Goal Achieved, 4=Payment Due, 5=System

    is_read BOOLEAN DEFAULT FALSE,

    -- Link to related entity
    reference_id UUID,
    reference_type VARCHAR(50), -- transaction, budget, debt, etc.

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,

    CONSTRAINT valid_notification_type CHECK (type BETWEEN 1 AND 5)
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

---

## 3. Database Functions & Triggers

### 3.1. Auto Update Timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... Apply to other tables
```

### 3.2. Update Account Balance on Transaction

```sql
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update account balance (TransactionType: 1=Income, 2=Expense, 3=Transfer)
        IF NEW.type = 1 THEN -- Income
            UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
        ELSIF NEW.type = 2 THEN -- Expense
            UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
        ELSIF NEW.type = 3 THEN -- Transfer
            UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
            UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the balance change
        IF OLD.type = 1 THEN -- Income
            UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
        ELSIF OLD.type = 2 THEN -- Expense
            UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
        ELSIF OLD.type = 3 THEN -- Transfer
            UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
            UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_balance_update
    AFTER INSERT OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();
```

### 3.3. Update Debt Remaining Amount

```sql
CREATE OR REPLACE FUNCTION update_debt_remaining()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE debts
    SET remaining_amount = remaining_amount - NEW.amount,
        status = CASE
            WHEN (remaining_amount - NEW.amount) = 0 THEN 3  -- DebtStatus.FULLY_PAID
            WHEN (remaining_amount - NEW.amount) < principal_amount THEN 2  -- DebtStatus.PARTIAL_PAID
            ELSE status
        END
    WHERE id = NEW.debt_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER debt_payment_update
    AFTER INSERT ON debt_payments
    FOR EACH ROW EXECUTE FUNCTION update_debt_remaining();
```

### 3.4. Generate Loan Amortization Schedule

```sql
-- Function tính toán lịch trả nợ (amortization schedule)
CREATE OR REPLACE FUNCTION generate_loan_schedule(p_loan_id UUID)
RETURNS VOID AS $$
DECLARE
    v_loan loans%ROWTYPE;
    v_monthly_rate DECIMAL(10, 8);
    v_payment_date DATE;
    v_principal_payment DECIMAL(15, 2);
    v_interest_payment DECIMAL(15, 2);
    v_remaining_principal DECIMAL(15, 2);
    v_payment_num INTEGER;
BEGIN
    -- Get loan details
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;

    -- Calculate monthly interest rate
    v_monthly_rate := v_loan.interest_rate / 12 / 100;

    -- Initialize
    v_remaining_principal := v_loan.principal_amount;
    v_payment_date := v_loan.first_payment_date;

    -- Delete existing schedule
    DELETE FROM loan_payments WHERE loan_id = p_loan_id;

    -- Generate schedule for each month
    FOR v_payment_num IN 1..v_loan.loan_term_months LOOP
        -- Calculate interest for this period
        v_interest_payment := v_remaining_principal * v_monthly_rate;

        -- Calculate principal payment
        v_principal_payment := v_loan.monthly_payment - v_interest_payment;

        -- Adjust last payment if needed
        IF v_payment_num = v_loan.loan_term_months THEN
            v_principal_payment := v_remaining_principal;
        END IF;

        -- Insert payment record
        INSERT INTO loan_payments (
            loan_id,
            payment_number,
            due_date,
            payment_date,
            scheduled_principal,
            scheduled_interest,
            scheduled_total,
            principal_balance_after,
            status
        ) VALUES (
            p_loan_id,
            v_payment_num,
            v_payment_date,
            v_payment_date,
            v_principal_payment,
            v_interest_payment,
            v_principal_payment + v_interest_payment,
            v_remaining_principal - v_principal_payment,
            1  -- PaymentStatus.PENDING
        );

        -- Update remaining principal
        v_remaining_principal := v_remaining_principal - v_principal_payment;

        -- Next payment date (add 1 month)
        v_payment_date := v_payment_date + INTERVAL '1 month';
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 3.5. Recalculate Loan Schedule After Prepayment

```sql
-- Function tính lại lịch trả nợ sau khi trả nợ trước hạn
CREATE OR REPLACE FUNCTION recalculate_loan_after_prepayment(
    p_loan_id UUID,
    p_prepayment_amount DECIMAL(15, 2)
)
RETURNS VOID AS $$
DECLARE
    v_loan loans%ROWTYPE;
    v_monthly_rate DECIMAL(10, 8);
    v_new_monthly_payment DECIMAL(15, 2);
    v_new_term_months INTEGER;
BEGIN
    -- Get loan details
    SELECT * INTO v_loan FROM loans WHERE id = p_loan_id;

    -- Update current principal
    v_loan.current_principal := v_loan.current_principal - p_prepayment_amount;

    -- Monthly interest rate
    v_monthly_rate := v_loan.interest_rate / 12 / 100;

    IF v_loan.prepayment_strategy = 1 THEN  -- PrepaymentStrategy.REDUCE_TERM
        -- Strategy 1: Keep monthly payment, reduce term
        -- Calculate new term based on current principal and original monthly payment
        v_new_term_months := CEIL(
            -LN(1 - (v_loan.current_principal * v_monthly_rate / v_loan.monthly_payment))
            / LN(1 + v_monthly_rate)
        );

        UPDATE loans
        SET
            current_principal = v_loan.current_principal,
            remaining_months = v_new_term_months,
            maturity_date = first_payment_date + (v_new_term_months || ' months')::INTERVAL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_loan_id;

    ELSIF v_loan.prepayment_strategy = 2 THEN  -- PrepaymentStrategy.REDUCE_PAYMENT
        -- Strategy 2: Keep term, reduce monthly payment
        -- Calculate new monthly payment
        v_new_monthly_payment := v_loan.current_principal *
            (v_monthly_rate * POWER(1 + v_monthly_rate, v_loan.remaining_months)) /
            (POWER(1 + v_monthly_rate, v_loan.remaining_months) - 1);

        UPDATE loans
        SET
            current_principal = v_loan.current_principal,
            monthly_payment = v_new_monthly_payment,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_loan_id;
    END IF;

    -- Regenerate amortization schedule
    PERFORM generate_loan_schedule(p_loan_id);
END;
$$ LANGUAGE plpgsql;
```

### 3.6. Process Loan Payment

```sql
-- Function xử lý thanh toán khoản vay
CREATE OR REPLACE FUNCTION process_loan_payment(
    p_loan_payment_id UUID,
    p_principal_amount DECIMAL(15, 2),
    p_interest_amount DECIMAL(15, 2),
    p_prepayment_amount DECIMAL(15, 2) DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
    v_loan_id UUID;
    v_total_principal DECIMAL(15, 2);
BEGIN
    -- Update payment record
    UPDATE loan_payments
    SET
        actual_principal = p_principal_amount,
        actual_interest = p_interest_amount,
        actual_total = p_principal_amount + p_interest_amount,
        prepayment_amount = p_prepayment_amount,
        status = 2,  -- PaymentStatus.PAID
        payment_date = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_loan_payment_id
    RETURNING loan_id INTO v_loan_id;

    -- Calculate total principal paid (including prepayment)
    v_total_principal := p_principal_amount + p_prepayment_amount;

    -- Update loan
    UPDATE loans
    SET
        current_principal = current_principal - v_total_principal,
        total_principal_paid = total_principal_paid + v_total_principal,
        total_interest_paid = total_interest_paid + p_interest_amount,
        remaining_months = remaining_months - 1,
        status = CASE
            WHEN current_principal - v_total_principal <= 0 THEN 2  -- LoanStatus.PAID_OFF
            ELSE status
        END,
        paid_off_at = CASE
            WHEN current_principal - v_total_principal <= 0 THEN CURRENT_TIMESTAMP
            ELSE paid_off_at
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_loan_id;

    -- If there's prepayment, recalculate schedule
    IF p_prepayment_amount > 0 THEN
        PERFORM recalculate_loan_after_prepayment(v_loan_id, p_prepayment_amount);
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Database Relationships & ERD

### 4.1. Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│    users    │◄────────│  accounts    │◄────────│ transactions │
└─────────────┘    1:N  └──────────────┘    1:N  └──────────────┘
       │                       │                         │
       │ 1:N                   │                         │ N:1
       │                       │                         │
       ↓                       ↓                         ↓
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  budgets    │         │    goals     │         │  categories  │
└─────────────┘         └──────────────┘         └──────────────┘

       │                                                 │
       │                                                 │
       ↓                                                 ↓
┌─────────────┐                                   ┌──────────────┐
│   events    │                                   │    debts     │
└─────────────┘                                   └──────────────┘
       │                                                 │
       │ 1:N                                            │ 1:N
       ↓                                                 ↓
┌─────────────┐                                   ┌──────────────┐
│transactions │                                   │debt_payments │
└─────────────┘                                   └──────────────┘

┌─────────────┐
│    users    │
└──────┬──────┘
       │ 1:N
       ↓
┌─────────────┐         ┌──────────────────┐
│    loans    │─────────│  loan_payments   │
│             │   1:N   │  (amortization)  │
└─────────────┘         └──────────────────┘
       │ N:1
       ↓
┌─────────────┐
│  accounts   │ (Tài khoản thanh toán)
└─────────────┘

Loan Amortization Relationship:
  - Mỗi loan có nhiều loan_payments (schedule)
  - Mỗi payment chứa: scheduled_principal, scheduled_interest
  - Khi prepayment → recalculate toàn bộ schedule còn lại
```

---

## 5. Initial Seed Data

### 5.1. Default Categories

```sql
-- Sử dụng số integer (CategoryType.EXPENSE = 2, CategoryType.INCOME = 1)
INSERT INTO categories (name, type, icon, color, is_default) VALUES
-- Expense categories (type = 2)
('Ăn uống', 2, 'utensils', '#FF6B6B', TRUE),
('Di chuyển', 2, 'car', '#4ECDC4', TRUE),
('Mua sắm', 2, 'shopping-bag', '#45B7D1', TRUE),
('Giải trí', 2, 'gamepad', '#96CEB4', TRUE),
('Hóa đơn', 2, 'file-text', '#FFEAA7', TRUE),
('Sức khỏe', 2, 'heart', '#DFE6E9', TRUE),
('Giáo dục', 2, 'book', '#74B9FF', TRUE),
('Nhà cửa', 2, 'home', '#A29BFE', TRUE),

-- Income categories (type = 1)
('Lương', 1, 'briefcase', '#00B894', TRUE),
('Thưởng', 1, 'gift', '#FDCB6E', TRUE),
('Đầu tư', 1, 'trending-up', '#6C5CE7', TRUE),
('Thu nhập phụ', 1, 'dollar-sign', '#00CEC9', TRUE);
```

---

**Lưu ý**: Schema này đảm bảo tính toàn vẹn dữ liệu với constraints, indexes cho performance, và triggers tự động xử lý business logic quan trọng.
