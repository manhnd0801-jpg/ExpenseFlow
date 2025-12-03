# Cập Nhật Spec Chi Tiết - Quản Lý Công Nợ (Debts)

## 📋 Tổng Quan Thay Đổi

**Ngày cập nhật:** 03/12/2025

**Vấn đề phát hiện:**

- Chức năng công nợ hiện tại **KHÔNG tích hợp với Accounts và Transactions**
- Khi cho vay/đi vay: Tiền không được cộng/trừ vào tài khoản
- Không có transaction nào được tạo → Không tracking được cash flow
- Số dư tài khoản không chính xác

**Giải pháp:**

- Bắt buộc liên kết Debt với Account
- Tự động tạo Transaction khi tạo debt và payment
- Tự động cập nhật số dư Account
- Đồng bộ đầy đủ giữa Debts ↔ Transactions ↔ Accounts

---

## 📝 Chi Tiết Thay Đổi

### 1. REQUIREMENTS.md

**File:** `/docs/REQUIREMENTS.md`

**Section 2.7 - Quản Lý Công Nợ** đã được viết lại hoàn toàn:

#### 1.1. Tạo Khoản Công Nợ

**CHO VAY (Lending):**

```typescript
{
  type: 1, // Lending
  personName: "Nguyen Van B",
  amount: 10000000,
  accountId: "account-uuid", // ⭐ BẮT BUỘC - Tài khoản nguồn
  borrowedDate: "2025-01-01T10:00:00.000Z"
}

// Hệ thống tự động:
// 1. TRỪ 10M khỏi account
// 2. Tạo transaction type=EXPENSE (Chi tiêu)
// 3. Link debt ↔ transaction
```

**ĐI VAY (Borrowing):**

```typescript
{
  type: 2, // Borrowing
  personName: "ABC Bank",
  amount: 100000000,
  accountId: "account-bank-uuid", // ⭐ BẮT BUỘC - Tài khoản đích
  borrowedDate: "2025-01-01T10:00:00.000Z"
}

// Hệ thống tự động:
// 1. CỘNG 100M vào account
// 2. Tạo transaction type=INCOME (Thu nhập)
// 3. Link debt ↔ transaction
```

#### 1.2. Ghi Nhận Thanh Toán

**THU NỢ (Lending Payment):**

```typescript
// User trả tiền cho mình
{
  debtId: "debt-uuid",
  amount: 3000000,
  principalAmount: 2850000, // Gốc
  interestAmount: 150000,   // Lãi
  accountId: "account-bank-uuid", // ⭐ BẮT BUỘC - Tài khoản nhận
  paymentDate: "2025-01-15T14:30:00.000Z"
}

// Hệ thống tự động:
// 1. CỘNG 3M vào account
// 2. Tạo transaction type=INCOME
// 3. Giảm remainingAmount của debt
// 4. Update status (Active → Partial Paid → Fully Paid)
```

**TRẢ NỢ (Borrowing Payment):**

```typescript
// Mình trả tiền cho người khác
{
  debtId: "debt-uuid",
  amount: 11000000,
  principalAmount: 10000000,
  interestAmount: 1000000,
  accountId: "account-bank-uuid", // ⭐ BẮT BUỘC - Tài khoản trả
  paymentDate: "2025-01-15T14:30:00.000Z"
}

// Hệ thống tự động:
// 1. TRỪ 11M khỏi account
// 2. Tạo transaction type=EXPENSE
// 3. Giảm remainingAmount
// 4. Tăng totalInterestPaid
```

#### 1.3. Tracking Fields

```typescript
interface IDebt {
  originalAmount: number; // Số tiền gốc (KHÔNG đổi)
  remainingAmount: number; // Còn lại (giảm khi payment)
  totalInterestPaid: number; // Tổng lãi đã trả/thu

  accountId: string; // ⭐ NEW: Link to account
  initialTransactionId: string; // ⭐ NEW: Transaction khi tạo debt
}

interface IDebtPayment {
  amount: number; // Tổng tiền
  principalAmount: number; // Phần gốc
  interestAmount: number; // Phần lãi

  accountId: string; // ⭐ NEW: Tài khoản nhận/trả
  transactionId: string; // ⭐ NEW: Transaction tương ứng
  remainingBalanceAfter: number; // Số dư còn lại sau payment
}
```

---

### 2. DATABASE-DESIGN.md

**File:** `/docs/DD/02-DATABASE-DESIGN.md`

#### 2.1. Debts Table - Schema Changes

```sql
CREATE TABLE debts (
    -- ... existing fields ...

    -- ⭐ NEW FIELDS
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    -- Tài khoản nguồn (Lending) hoặc đích (Borrowing)
    -- KHÔNG cho phép xóa account nếu còn debt (RESTRICT)

    initial_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    -- Transaction được tạo khi khởi tạo debt

    total_interest_paid DECIMAL(15, 2) DEFAULT 0,
    -- Tracking tổng lãi đã trả/thu

    -- RENAMED FIELDS
    original_amount DECIMAL(15, 2), -- Renamed from principal_amount

    -- ... other fields ...
);

-- NEW INDEX
CREATE INDEX idx_debts_account ON debts(account_id);
```

#### 2.2. Debt Payments Table - Schema Changes

```sql
CREATE TABLE debt_payments (
    -- ... existing fields ...

    -- ⭐ NEW FIELDS
    principal_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interest_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,

    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    -- Tài khoản nhận (Lending) hoặc trả (Borrowing)

    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    -- Transaction tương ứng với payment này

    remaining_balance_after DECIMAL(15, 2) NOT NULL,
    -- Số dư debt còn lại sau payment

    payment_method VARCHAR(100),
    reference_number VARCHAR(255),

    status SMALLINT DEFAULT 2, -- 1=Pending, 2=Completed, 3=Failed, 4=Cancelled

    -- ... other fields ...
);

-- NEW INDEX
CREATE INDEX idx_debt_payments_account ON debt_payments(account_id);
```

#### 2.3. Transactions Table - Add debt_id

```sql
CREATE TABLE transactions (
    -- ... existing fields ...

    -- ⭐ NEW FIELD
    debt_id UUID REFERENCES debts(id) ON DELETE SET NULL,
    -- Link transaction to debt

    description TEXT,
    -- Auto-generated với context
    -- VD: "Cho vay: Nguyen Van B - 10,000,000 VND"

    -- ... other fields ...
);

-- NEW INDEX
CREATE INDEX idx_transactions_debt ON transactions(debt_id);
```

---

### 3. API-SPECIFICATION.md

**File:** `/docs/DD/03-API-SPECIFICATION.md`

**Section 7 - Debt APIs** đã được viết lại hoàn toàn với các endpoint mới:

#### 3.1. Create Debt API

```http
POST /api/v1/debts
Content-Type: application/json

Request (Lending):
{
  "type": 1,
  "personName": "Nguyen Van B",
  "amount": 10000000,
  "interestRate": 5,
  "borrowedDate": "2025-01-01T10:00:00.000Z",
  "accountId": "account-cash-uuid", // ⭐ REQUIRED
  "categoryId": "category-lending-uuid" // Optional
}

Response: 201
{
  "success": true,
  "data": {
    "debt": { ... },
    "transaction": {
      "id": "transaction-uuid",
      "type": 2, // EXPENSE
      "amount": 10000000,
      "description": "Cho vay: Nguyen Van B - 10,000,000 VND"
    },
    "updatedAccount": {
      "balance": 40000000 // Giảm từ 50M
    }
  },
  "message": "Debt created. Transaction recorded and balance updated."
}
```

#### 3.2. Record Payment API

```http
POST /api/v1/debts/:id/payments
Content-Type: application/json

Request (Thu nợ):
{
  "amount": 3000000,
  "principalAmount": 2850000,
  "interestAmount": 150000,
  "paymentDate": "2025-01-15T14:30:00.000Z",
  "accountId": "account-bank-uuid", // ⭐ REQUIRED
  "note": "Thu nợ kỳ 1"
}

Response: 201
{
  "success": true,
  "data": {
    "payment": { ... },
    "transaction": {
      "type": 1, // INCOME
      "amount": 3000000
    },
    "updatedDebt": {
      "remainingAmount": 7150000,
      "status": 2 // Partial Paid
    },
    "updatedAccount": {
      "balance": 43000000 // Tăng từ 40M
    }
  }
}
```

#### 3.3. New Endpoints

- `GET /api/v1/debts` - List with account info
- `GET /api/v1/debts/:id` - Detail with relations
- `GET /api/v1/debts/:id/payments` - Payment history with transactions
- `DELETE /api/v1/debts/:debtId/payments/:paymentId` - Delete payment (< 7 days)
- `GET /api/v1/debts/summary` - Summary report

---

### 4. BUSINESS-FLOW.md

**File:** `/docs/DD/05-BUSINESS-FLOW.md`

**Section 4 - Quy Trình Quản Lý Công Nợ** đã được viết lại với flow chart chi tiết:

#### 4.1. Create Lending Flow

```
[User] → Input lending info (+ accountId)
          ↓
[Validation] → Check account balance >= amount?
          ↓
[Transaction Flow]
  BEGIN TRANSACTION
    1. Create debt record
    2. Create EXPENSE transaction (trừ tiền)
    3. Update account balance (trigger)
    4. Link debt ↔ transaction
    5. Create reminders
  COMMIT
          ↓
[Response] → "Cho vay thành công"
             "Số dư: X → Y"
```

#### 4.2. Record Payment Flow

```
[User] → Input payment (amount, accountId)
          ↓
[Transaction Flow]
  BEGIN TRANSACTION
    1. Create debt_payment record
    2. Create INCOME/EXPENSE transaction
    3. Update account balance
    4. Link payment ↔ transaction
    5. Update debt (remainingAmount, status)
    6. Notifications (if fully paid)
  COMMIT
          ↓
[Response] → "Payment recorded"
             "Debt: X → Y"
             "Balance: A → B"
```

#### 4.3. Delete Payment Flow (< 7 days)

```
[User] → Delete payment
          ↓
[Validation] → Check days < 7?
          ↓
[Rollback Flow]
  BEGIN TRANSACTION
    1. Restore debt state
    2. Restore account balance (reverse)
    3. Delete transaction
    4. Delete payment
  COMMIT
          ↓
[Response] → "Payment deleted and state restored"
```

---

## 🔧 Implementation Checklist

### Backend (NestJS)

**Files to Update:**

1. **Entity Files:**

   - [ ] `src/entities/debt.entity.ts`

     - Add `accountId: string`
     - Add `initialTransactionId: string`
     - Add `totalInterestPaid: number`
     - Rename `principalAmount` → `originalAmount`

   - [ ] `src/entities/debt-payment.entity.ts`
     - Add `principalAmount: number`
     - Add `interestAmount: number`
     - Add `accountId: string`
     - Add `transactionId: string`
     - Add `remainingBalanceAfter: number`
     - Add `paymentMethod: string`
     - Add `referenceNumber: string`
     - Add `status: number`

2. **DTO Files:**

   - [ ] `src/modules/debts/dto/create-debt.dto.ts`

     - Add `@IsString() accountId`
     - Add `@IsOptional() categoryId`

   - [ ] `src/modules/debts/dto/record-debt-payment.dto.ts`
     - Add `principalAmount?: number`
     - Add `interestAmount?: number`
     - Add `@IsString() accountId`
     - Add `categoryId?: string`
     - Add `paymentMethod?: string`
     - Add `referenceNumber?: string`

3. **Service Files:**

   - [ ] `src/modules/debts/debts.service.ts`
     - Inject `AccountsService`, `TransactionsService`
     - Update `create()`: Add transaction creation logic
     - Update `recordPayment()`: Add transaction + balance update
     - Add `deletePayment()` method (< 7 days check)
     - Add `getSummary()` method

4. **Controller Files:**

   - [ ] `src/modules/debts/debts.controller.ts`
     - Add query params `?type=1&status=1`
     - Add response formatting with relations
     - Add DELETE `/payments/:paymentId` endpoint
     - Add GET `/summary` endpoint

5. **Migration Files:**
   - [ ] Create migration: `add-debt-account-integration.sql`

     ```sql
     ALTER TABLE debts
       ADD COLUMN account_id UUID REFERENCES accounts(id),
       ADD COLUMN initial_transaction_id UUID REFERENCES transactions(id),
       ADD COLUMN total_interest_paid DECIMAL(15,2) DEFAULT 0,
       RENAME COLUMN principal_amount TO original_amount;

     ALTER TABLE debt_payments
       ADD COLUMN principal_amount DECIMAL(15,2) DEFAULT 0,
       ADD COLUMN interest_amount DECIMAL(15,2) DEFAULT 0,
       ADD COLUMN account_id UUID REFERENCES accounts(id),
       ADD COLUMN transaction_id UUID REFERENCES transactions(id),
       ADD COLUMN remaining_balance_after DECIMAL(15,2),
       ADD COLUMN payment_method VARCHAR(100),
       ADD COLUMN reference_number VARCHAR(255),
       ADD COLUMN status SMALLINT DEFAULT 2;

     ALTER TABLE transactions
       ADD COLUMN debt_id UUID REFERENCES debts(id);

     CREATE INDEX idx_debts_account ON debts(account_id);
     CREATE INDEX idx_debt_payments_account ON debt_payments(account_id);
     CREATE INDEX idx_transactions_debt ON transactions(debt_id);
     ```

### Frontend (React)

**Files to Update:**

1. **Type Definitions:**

   - [ ] `src/types/models/debt.ts`
     - Add `accountId: string`
     - Add `initialTransactionId?: string`
     - Add `totalInterestPaid: number`
     - Rename `principalAmount` → `originalAmount`
     - Add relations: `account?: IAccount`, `initialTransaction?: ITransaction`

2. **Redux:**

   - [ ] `src/redux/modules/debts/debtTypes.ts`

     - Update payload types with new fields

   - [ ] `src/redux/modules/debts/debtSaga.ts`
     - Update API call payloads
     - Handle new response format

3. **Components:**

   - [ ] `src/components/molecules/DebtForm/DebtForm.tsx`

     - Add Account selector (required)
     - Add Category selector (optional)

   - [ ] `src/components/organisms/DebtPaymentModal.tsx` (NEW)

     - Amount input
     - Principal/Interest split (optional)
     - Account selector (required)
     - Payment method input
     - Reference number input

   - [ ] `src/pages/debts/DebtsListPage.tsx`

     - Display account name in debt cards
     - Show balance changes

   - [ ] `src/pages/debts/DebtDetailPage.tsx`
     - Show initial transaction link
     - Display payment history with transactions
     - Add delete payment button (with 7-day check)

4. **Services:**
   - [ ] `src/services/api/debts.ts`
     - Update request/response types
     - Add `deletePayment()` method
     - Add `getSummary()` method

---

## ✅ Testing Checklist

### Unit Tests

- [ ] Backend: `debts.service.spec.ts`
  - Test create debt with transaction creation
  - Test payment recording with balance update
  - Test delete payment within 7 days
  - Test delete payment after 7 days (should fail)

### Integration Tests

- [ ] `debts.e2e-spec.ts`
  - POST /debts → Check transaction created + balance updated
  - POST /debts/:id/payments → Check all updates
  - DELETE /debts/:id/payments/:paymentId → Check rollback
  - GET /debts → Check includes account relations

### Frontend Tests

- [ ] Component tests with new fields
- [ ] Redux saga tests with new API format
- [ ] E2E tests for debt creation flow

---

## 📊 Migration Strategy

### Phase 1: Database Migration (Backward Compatible)

1. Run migration to add new columns (all nullable first)
2. Deploy backend with dual-mode support (old + new fields)
3. Backfill existing debts:
   ```sql
   -- Set default account for existing debts (user's first account)
   UPDATE debts d
   SET account_id = (
     SELECT id FROM accounts
     WHERE user_id = d.user_id
     ORDER BY created_at
     LIMIT 1
   )
   WHERE account_id IS NULL;
   ```

### Phase 2: Code Update

1. Update backend service logic
2. Deploy backend (still supports old API)
3. Update frontend to use new API
4. Deploy frontend

### Phase 3: Cleanup

1. Make `account_id` NOT NULL
2. Remove old API compatibility code
3. Run data validation

---

## 📈 Expected Impact

### User Experience

✅ **Improvements:**

- Số dư tài khoản luôn chính xác
- Tracking đầy đủ cash flow (cho vay/đi vay)
- Xem được transaction history đầy đủ
- Báo cáo tài chính chính xác hơn

### Data Integrity

✅ **Before:**

- Debt tracking tách biệt, không sync với accounts
- Không biết tiền đi/về từ đâu
- Số dư account không phản ánh đúng

✅ **After:**

- Debt ↔ Transaction ↔ Account hoàn toàn đồng bộ
- Mọi giao dịch đều được tracking
- Balance luôn chính xác
- Audit trail đầy đủ

---

## 📚 Related Documents

1. **REQUIREMENTS.md** - Section 2.7: Quản Lý Công Nợ (Updated)
2. **02-DATABASE-DESIGN.md** - Section 2.7, 2.8: Debts & Debt Payments (Updated)
3. **03-API-SPECIFICATION.md** - Section 7: Debt APIs (Updated)
4. **05-BUSINESS-FLOW.md** - Section 4: Quy Trình Công Nợ (Updated)

---

## 🔗 Next Steps

1. Review spec với team
2. Approve migration plan
3. Create implementation tickets
4. Start development (Backend → Frontend)
5. Testing & QA
6. Deploy to production

---

**Prepared by:** AI Assistant  
**Date:** 03/12/2025  
**Status:** Ready for Review
