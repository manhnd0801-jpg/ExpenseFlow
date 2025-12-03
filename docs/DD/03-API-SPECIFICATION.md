# API Specification - Quản Lý Chi Tiêu

## 1. API Overview

### Base URL

```
Development: http://localhost:3000/api
Production: https://api.expense-manager.com/api
```

### Authentication

```
All protected endpoints require JWT token in header:
Authorization: Bearer <access_token>
```

### Date/Time Format

**Important:** All date/time fields use ISO 8601 format with full timestamp:

```
Format: YYYY-MM-DDTHH:mm:ss.sssZ
Example: "2025-12-03T14:30:00.000Z"

Affected fields:
- loans: startDate, disbursementDate, nextPaymentDate, lastPaymentDate
- loan_payments: paymentDate, dueDate
- debts: borrowedDate, dueDate
- debt_payments: paymentDate
- transactions: date
```

Frontend must:

- Send dates using `dayjs().toISOString()` or `new Date().toISOString()`
- NOT use `.format('YYYY-MM-DD')` which loses time component
- Display using `dayjs(date).format('DD/MM/YYYY HH:mm')` when showing time

### Response Format

```typescript
// Success Response
{
  "success": true,
  "data": any,
  "message": string,
  "timestamp": string
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any[]
  },
  "timestamp": string
}
```

### Enum Values (CRITICAL)

**⚠️ QUAN TRỌNG: Tất cả type/status fields sử dụng INTEGER values**

API sử dụng **integer-based enums** cho tất cả type/status fields để tối ưu performance và đồng bộ FE-BE-DB:

```typescript
// Request & Response LUÔN dùng số, KHÔNG phải string

// ✅ ĐÚNG - Request với integer
POST /transactions
{
  "type": 2,              // 2 = Expense (KHÔNG phải "expense")
  "accountId": "uuid",
  "categoryId": "uuid",
  "amount": 50000
}

// ❌ SAI - Request với string
POST /transactions
{
  "type": "expense",      // SAI! Phải dùng số 2
  "accountId": "uuid"
}

// Response cũng trả về integer
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": 2,            // 2 = Expense
    "amount": 50000
  }
}
```

**Enum Mapping Reference:**

```typescript
// Account Types (type field trong accounts)
1 = Cash (Tiền mặt)
2 = Bank (Ngân hàng)
3 = Credit Card (Thẻ tín dụng)
4 = E-Wallet (Ví điện tử)
5 = Investment (Đầu tư)

// Transaction Types (type field trong transactions)
1 = Income (Thu nhập)
2 = Expense (Chi tiêu)
3 = Transfer (Chuyển khoản)

// Category Types (type field trong categories)
1 = Income (Thu nhập)
2 = Expense (Chi tiêu)

// Budget Periods (period field trong budgets)
1 = Daily (Hàng ngày)
2 = Weekly (Hàng tuần)
3 = Monthly (Hàng tháng)
4 = Quarterly (Hàng quý)
5 = Yearly (Hàng năm)
6 = Custom (Tùy chỉnh)

// Status Fields (status trong loans, debts, goals, etc.)
1 = Active (Đang hoạt động)
2 = Paid/Completed (Đã hoàn thành)
3 = Cancelled/Defaulted (Hủy/Nợ xấu)
4 = Overdue/Other (Quá hạn/Khác)

// Payment Status (status trong loan_payments)
1 = Pending (Chưa trả)
2 = Paid (Đã trả)
3 = Overdue (Quá hạn)
4 = Skipped (Bỏ qua)
```

**Frontend Display:**

- Frontend nhận integer từ API
- Sử dụng label mapping để hiển thị text cho user
- Ví dụ: `type: 2` → hiển thị "Chi tiêu" trên UI

**Lợi ích:**

- ⚡ Performance: So sánh số nhanh hơn string
- 💾 Storage: Tiết kiệm bandwidth (2 bytes vs nhiều bytes)
- 🔄 Consistency: Đồng bộ hoàn toàn giữa FE-BE-DB
- 🛡️ Type-safe: Validate dễ dàng với range checking

**Lưu ý trong ví dụ API bên dưới:**

- Một số ví dụ vẫn dùng string để dễ đọc (documentation purpose)
- Trong thực tế, PHẢI dùng integer như mô tả ở trên
- Backend sẽ reject requests với string values

---

## 2. Authentication APIs

### 2.1. Register

```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "Nguyen Van A"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nguyen Van A"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}

Errors:
- 400: Email already exists
- 400: Invalid email format
- 400: Password too weak
```

### 2.2. Login

```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nguyen Van A",
      "currency": "VND",
      "language": "vi"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}

Errors:
- 401: Invalid credentials
- 403: Email not verified
```

### 2.3. Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "refresh_token"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

### 2.4. Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 2.5. Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "reset_token",
  "newPassword": "NewSecurePassword123"
}

Response: 200 OK
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 3. Transaction APIs

### 3.1. Get Transactions (Paginated)

```http
GET /transactions?page=1&limit=20&type=expense&categoryId=uuid&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- type: income | expense | transfer
- categoryId: uuid
- accountId: uuid
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
- search: string (search in note)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "accountId": "uuid",
      "categoryId": "uuid",
      "amount": 50000,
      "type": "expense",
      "transactionDate": "2025-01-15",
      "note": "Ăn trưa",
      "imageUrl": null,
      "category": {
        "id": "uuid",
        "name": "Ăn uống",
        "icon": "utensils",
        "color": "#FF6B6B"
      },
      "account": {
        "id": "uuid",
        "name": "Ví tiền mặt",
        "type": "cash"
      },
      "createdAt": "2025-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 3.2. Get Transaction Detail

```http
GET /transactions/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "accountId": "uuid",
    "categoryId": "uuid",
    "amount": 50000,
    "type": "expense",
    "transactionDate": "2025-01-15",
    "note": "Ăn trưa với đồng nghiệp",
    "imageUrl": "https://...",
    "eventId": "uuid",
    "tags": ["công việc", "team"],
    "category": {...},
    "account": {...},
    "event": {...},
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z"
  }
}
```

### 3.3. Create Transaction

```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "accountId": "uuid",
  "categoryId": "uuid",
  "amount": 50000,
  "type": "expense",
  "transactionDate": "2025-01-15",
  "note": "Ăn trưa",
  "imageUrl": null,
  "eventId": null,
  "tags": ["ăn uống"],
  "toAccountId": null  // Required if type = 'transfer'
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "accountId": "uuid",
    ...
  },
  "message": "Transaction created successfully"
}

Errors:
- 400: Invalid input data
- 404: Account or Category not found
- 403: Insufficient balance (for expenses)
```

### 3.4. Update Transaction

```http
PUT /transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body: (all fields optional)
{
  "amount": 60000,
  "note": "Updated note",
  "categoryId": "uuid"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    ...
  },
  "message": "Transaction updated successfully"
}
```

### 3.5. Delete Transaction

```http
DELETE /transactions/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

### 3.6. Bulk Create Transactions

```http
POST /transactions/bulk
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "transactions": [
    {
      "accountId": "uuid",
      "categoryId": "uuid",
      "amount": 50000,
      "type": "expense",
      "transactionDate": "2025-01-15",
      "note": "Transaction 1"
    },
    {
      "accountId": "uuid",
      "categoryId": "uuid",
      "amount": 30000,
      "type": "expense",
      "transactionDate": "2025-01-16",
      "note": "Transaction 2"
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "transactions": [...]
  }
}
```

### 3.7. Get Transaction Summary

```http
GET /transactions/summary?startDate=2025-01-01&endDate=2025-01-31&accountId=uuid
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalIncome": 10000000,
    "totalExpense": 7500000,
    "balance": 2500000,
    "transactionCount": 85,
    "expenseByCategory": [
      {
        "categoryId": "uuid",
        "categoryName": "Ăn uống",
        "amount": 2000000,
        "percentage": 26.67,
        "transactionCount": 30
      }
    ],
    "trend": {
      "previousPeriod": {
        "totalIncome": 9500000,
        "totalExpense": 7000000
      },
      "change": {
        "income": "+5.26%",
        "expense": "+7.14%"
      }
    }
  }
}
```

---

## 4. Account APIs

### 4.1. Get All Accounts

```http
GET /accounts
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ví tiền mặt",
      "type": "cash",
      "balance": 500000,
      "currency": "VND",
      "icon": "wallet",
      "color": "#4CAF50",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

### 4.2. Create Account

```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Ngân hàng Vietcombank",
  "type": "bank",
  "balance": 10000000,
  "currency": "VND",
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "icon": "bank",
  "color": "#2196F3"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ngân hàng Vietcombank",
    ...
  }
}
```

### 4.3. Update Account

```http
PUT /accounts/:id
Authorization: Bearer <token>

Request Body:
{
  "name": "Updated name",
  "balance": 15000000
}

Response: 200 OK
```

### 4.4. Delete Account

```http
DELETE /accounts/:id
Authorization: Bearer <token>

Response: 200 OK

Errors:
- 400: Cannot delete account with existing transactions
- 400: Cannot delete default account
```

### 4.5. Transfer Between Accounts

```http
POST /accounts/transfer
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "amount": 1000000,
  "note": "Chuyển tiền"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "fromAccount": {...},
    "toAccount": {...}
  }
}
```

---

## 5. Category APIs

### 5.1. Get All Categories

```http
GET /categories?type=expense
Authorization: Bearer <token>

Query Parameters:
- type: income | expense (optional)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ăn uống",
      "type": "expense",
      "icon": "utensils",
      "color": "#FF6B6B",
      "isDefault": true,
      "parentId": null
    }
  ]
}
```

### 5.2. Create Category

```http
POST /categories
Authorization: Bearer <token>

Request Body:
{
  "name": "Cafe",
  "type": "expense",
  "icon": "coffee",
  "color": "#795548",
  "parentId": "uuid"  // Optional, for sub-category
}

Response: 201 Created
```

### 5.3. Update Category

```http
PUT /categories/:id
Authorization: Bearer <token>

Request Body:
{
  "name": "Updated name",
  "color": "#FF0000"
}

Response: 200 OK
```

### 5.4. Delete Category

```http
DELETE /categories/:id
Authorization: Bearer <token>

Response: 200 OK

Errors:
- 400: Cannot delete category with existing transactions
- 400: Cannot delete default category
```

---

## 6. Budget APIs

### 6.1. Get All Budgets

```http
GET /budgets?period=monthly&isActive=true
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ngân sách tháng 1/2025",
      "amount": 5000000,
      "period": "monthly",
      "startDate": "2025-01-01",
      "endDate": "2025-01-31",
      "categoryId": "uuid",
      "category": {...},
      "spent": 3500000,
      "remaining": 1500000,
      "percentage": 70,
      "isActive": true
    }
  ]
}
```

### 6.2. Create Budget

```http
POST /budgets
Authorization: Bearer <token>

Request Body:
{
  "name": "Ngân sách ăn uống",
  "categoryId": "uuid",
  "amount": 3000000,
  "period": "monthly",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "alertAtPercentage": 80
}

Response: 201 Created
```

### 6.3. Update Budget

```http
PUT /budgets/:id
Authorization: Bearer <token>

Request Body:
{
  "amount": 4000000,
  "alertAtPercentage": 90
}

Response: 200 OK
```

### 6.4. Delete Budget

```http
DELETE /budgets/:id
Authorization: Bearer <token>

Response: 200 OK
```

### 6.5. Get Budget Progress

```http
GET /budgets/:id/progress
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "budgetId": "uuid",
    "amount": 5000000,
    "spent": 3500000,
    "remaining": 1500000,
    "percentage": 70,
    "status": "warning", // safe | warning | exceeded
    "dailyAverage": 116667,
    "daysRemaining": 15,
    "projectedTotal": 5250000,
    "recentTransactions": [...]
  }
}
```

---

## 7. Debt APIs (Quản Lý Công Nợ với Account & Transaction Integration)

**⚠️ CRITICAL CHANGES:**

- Debts PHẢI liên kết với Account (accountId required)
- Tự động tạo Transaction khi tạo debt và payment
- Tự động cập nhật số dư Account

### 7.1. Get All Debts

```http
GET /api/v1/debts?type=1&status=1
Authorization: Bearer <token>

Query Parameters:
- type: 1 (Lending) | 2 (Borrowing)
- status: 1 (Active) | 2 (Partial Paid) | 3 (Fully Paid) | 4 (Overdue)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": 1, // 1=Lending, 2=Borrowing
      "personName": "Nguyen Van B",
      "contactInfo": "0123456789",
      "originalAmount": 10000000,
      "remainingAmount": 7000000,
      "totalInterestPaid": 150000,
      "interestRate": 5, // %/năm
      "borrowedDate": "2025-01-01T00:00:00.000Z",
      "dueDate": "2025-12-31T23:59:59.000Z",
      "paymentFrequency": 1, // 1=Monthly, 2=Quarterly, 3=Yearly, 4=One-time
      "status": 2, // Partial Paid
      "accountId": "account-uuid",
      "initialTransactionId": "transaction-uuid",
      "description": "Cho vay mua xe",
      "reminderEnabled": true,
      "reminderDaysBefore": 3,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z",

      // Relations (if included)
      "account": {
        "id": "account-uuid",
        "name": "Tiền mặt",
        "type": 1
      },
      "payments": [
        {
          "id": "payment-uuid",
          "amount": 3000000,
          "principalAmount": 2850000,
          "interestAmount": 150000,
          "paymentDate": "2025-01-15T14:30:00.000Z",
          "accountId": "account-uuid2",
          "transactionId": "transaction-uuid2"
        }
      ]
    }
  ],
  "meta": {
    "total": 10,
    "lending": {
      "count": 5,
      "totalAmount": 50000000,
      "totalRemaining": 20000000
    },
    "borrowing": {
      "count": 5,
      "totalAmount": 100000000,
      "totalRemaining": 75000000
    }
  }
}
```

### 7.2. Get Debt by ID

```http
GET /api/v1/debts/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": 1,
    "personName": "Nguyen Van B",
    "originalAmount": 10000000,
    "remainingAmount": 7000000,
    "totalInterestPaid": 150000,
    "interestRate": 5,
    "borrowedDate": "2025-01-01T00:00:00.000Z",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "status": 2,
    "accountId": "account-uuid",
    "initialTransactionId": "transaction-uuid",

    // Relations included
    "account": { ... },
    "initialTransaction": { ... },
    "payments": [ ... ]
  }
}
```

### 7.3. Create Debt

**⚠️ IMPORTANT:** Hệ thống sẽ tự động:

1. TRỪ/CỘNG tiền vào account (tùy type)
2. Tạo Transaction type=EXPENSE (Lending) hoặc INCOME (Borrowing)
3. Link debt ↔ transaction

```http
POST /api/v1/debts
Authorization: Bearer <token>
Content-Type: application/json

Request Body (Lending - Cho vay):
{
  "type": 1, // 1=Lending
  "personName": "Nguyen Van B",
  "contactInfo": "0123456789",
  "amount": 10000000,
  "interestRate": 5, // Optional, default 0
  "borrowedDate": "2025-01-01T10:00:00.000Z", // ISO string with time
  "dueDate": "2025-12-31T23:59:59.000Z", // Optional
  "paymentFrequency": 1, // Optional: 1=Monthly, 2=Quarterly, 3=Yearly, 4=One-time
  "accountId": "account-uuid", // REQUIRED - Tài khoản nguồn
  "categoryId": "category-lending-uuid", // Optional - Category "Cho vay"
  "description": "Cho vay mua xe",
  "reminderEnabled": true,
  "reminderDaysBefore": 3
}

Request Body (Borrowing - Đi vay):
{
  "type": 2, // 2=Borrowing
  "personName": "ABC Bank",
  "contactInfo": "1900-xxxx",
  "amount": 100000000,
  "interestRate": 12,
  "borrowedDate": "2025-01-01T10:00:00.000Z",
  "dueDate": "2025-12-31T23:59:59.000Z",
  "paymentFrequency": 1, // Monthly
  "accountId": "account-bank-uuid", // REQUIRED - Tài khoản đích
  "categoryId": "category-borrowing-uuid", // Optional - Category "Vay nợ"
  "description": "Vay ngân hàng mua nhà"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": 1,
    "personName": "Nguyen Van B",
    "originalAmount": 10000000,
    "remainingAmount": 10000000,
    "totalInterestPaid": 0,
    "interestRate": 5,
    "borrowedDate": "2025-01-01T10:00:00.000Z",
    "status": 1, // Active
    "accountId": "account-uuid",
    "initialTransactionId": "transaction-uuid",

    // Auto-created transaction
    "transaction": {
      "id": "transaction-uuid",
      "type": 2, // EXPENSE (cho vay trừ tiền)
      "amount": 10000000,
      "categoryId": "category-lending-uuid",
      "description": "Cho vay: Nguyen Van B - 10,000,000 VND",
      "debtId": "uuid"
    },

    // Updated account balance
    "updatedAccount": {
      "id": "account-uuid",
      "balance": 40000000 // Giảm từ 50M → 40M
    }
  },
  "message": "Debt created successfully. Transaction recorded and account balance updated."
}
```

### 7.4. Update Debt

```http
PATCH /api/v1/debts/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "personName": "Nguyen Van B Updated",
  "contactInfo": "0987654321",
  "dueDate": "2026-01-31T23:59:59.000Z",
  "description": "Updated description",
  "reminderDaysBefore": 7
}

Response: 200 OK
{
  "success": true,
  "data": { ... updated debt ... }
}
```

### 7.5. Delete Debt

**⚠️ IMPORTANT:** Xóa debt sẽ:

- Soft delete debt (set deleted_at)
- GIỮ NGUYÊN transactions để audit
- KHÔNG hoàn tiền tự động (user tự quản lý)

```http
DELETE /api/v1/debts/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Debt deleted successfully. Transactions are retained for audit trail."
}
```

### 7.6. Record Debt Payment

**⚠️ IMPORTANT:** Hệ thống sẽ tự động:

1. CỘNG/TRỪ tiền vào account (tùy debt type)
2. Tạo Transaction type=INCOME (Lending) hoặc EXPENSE (Borrowing)
3. Cập nhật remainingAmount và status của debt
4. Lưu payment history

```http
POST /api/v1/debts/:id/payments
Authorization: Bearer <token>
Content-Type: application/json

Request Body (Lending - Thu nợ):
{
  "amount": 3000000,
  "principalAmount": 2850000, // Optional: Phần gốc
  "interestAmount": 150000, // Optional: Phần lãi
  "paymentDate": "2025-01-15T14:30:00.000Z",
  "accountId": "account-bank-uuid", // REQUIRED - Tài khoản nhận tiền
  "categoryId": "category-debt-collection-uuid", // Optional
  "paymentMethod": "Bank Transfer", // Optional
  "referenceNumber": "TRF123456", // Optional
  "note": "Thu nợ kỳ 1"
}

Request Body (Borrowing - Trả nợ):
{
  "amount": 11000000,
  "principalAmount": 10000000,
  "interestAmount": 1000000,
  "paymentDate": "2025-01-15T14:30:00.000Z",
  "accountId": "account-bank-uuid", // REQUIRED - Tài khoản trả tiền
  "categoryId": "category-debt-repayment-uuid", // Optional
  "note": "Trả nợ tháng 1"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment-uuid",
      "debtId": "debt-uuid",
      "amount": 3000000,
      "principalAmount": 2850000,
      "interestAmount": 150000,
      "paymentDate": "2025-01-15T14:30:00.000Z",
      "accountId": "account-bank-uuid",
      "transactionId": "transaction-uuid",
      "remainingBalanceAfter": 7000000,
      "status": 2 // Completed
    },

    // Auto-created transaction
    "transaction": {
      "id": "transaction-uuid",
      "type": 1, // INCOME (thu nợ cộng tiền)
      "amount": 3000000,
      "description": "Thu nợ từ Nguyen Van B - Kỳ 1",
      "debtId": "debt-uuid"
    },

    // Updated debt
    "updatedDebt": {
      "id": "debt-uuid",
      "remainingAmount": 7000000, // Giảm từ 10M → 7M
      "totalInterestPaid": 150000,
      "status": 2 // Partial Paid
    },

    // Updated account balance
    "updatedAccount": {
      "id": "account-bank-uuid",
      "balance": 43000000 // Tăng từ 40M → 43M
    }
  },
  "message": "Payment recorded successfully. Transaction created and balances updated."
}
```

### 7.7. Get Debt Payment History

```http
GET /api/v1/debts/:id/payments
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "payment-uuid",
      "debtId": "debt-uuid",
      "amount": 3000000,
      "principalAmount": 2850000,
      "interestAmount": 150000,
      "paymentDate": "2025-01-15T14:30:00.000Z",
      "accountId": "account-bank-uuid",
      "transactionId": "transaction-uuid",
      "remainingBalanceAfter": 7000000,
      "paymentMethod": "Bank Transfer",
      "referenceNumber": "TRF123456",
      "note": "Thu nợ kỳ 1",
      "status": 2,
      "createdAt": "2025-01-15T14:30:00.000Z",

      // Relations
      "account": {
        "id": "account-bank-uuid",
        "name": "Vietcombank",
        "type": 2
      },
      "transaction": {
        "id": "transaction-uuid",
        "type": 1,
        "amount": 3000000,
        "description": "Thu nợ từ Nguyen Van B - Kỳ 1"
      }
    }
  ],
  "meta": {
    "totalPayments": 3,
    "totalAmount": 9000000,
    "totalPrincipal": 8550000,
    "totalInterest": 450000
  }
}
```

### 7.8. Delete Debt Payment

**⚠️ IMPORTANT:** Chỉ được xóa trong vòng 7 ngày kể từ paymentDate

```http
DELETE /api/v1/debts/:debtId/payments/:paymentId
Authorization: Bearer <token>

Response: 200 OK (nếu < 7 ngày)
{
  "success": true,
  "message": "Payment deleted and debt state restored successfully.",
  "data": {
    "restoredDebt": {
      "remainingAmount": 10000000, // Khôi phục về trước khi payment
      "status": 1
    },
    "refundedAccount": {
      "balance": 40000000 // Hoàn tiền về account
    },
    "deletedTransaction": {
      "id": "transaction-uuid" // Transaction đã bị xóa
    }
  }
}

Response: 400 Bad Request (nếu > 7 ngày)
{
  "success": false,
  "error": {
    "code": "PAYMENT_DELETE_TIMEOUT",
    "message": "Cannot delete payment after 7 days",
    "details": [
      "Payment date: 2025-01-01T10:00:00.000Z",
      "Days elapsed: 15",
      "Delete deadline: 2025-01-08T10:00:00.000Z"
    ]
  }
}
```

### 7.9. Get Debt Summary Report

```http
GET /api/v1/debts/summary
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO string (optional)
- endDate: ISO string (optional)

Response: 200 OK
{
  "success": true,
  "data": {
    "lending": {
      "totalDebts": 5,
      "activeDebts": 3,
      "totalOriginalAmount": 50000000,
      "totalRemaining": 20000000,
      "totalCollected": 30000000,
      "totalInterestCollected": 1500000,
      "averageInterestRate": 5.2
    },
    "borrowing": {
      "totalDebts": 3,
      "activeDebts": 2,
      "totalOriginalAmount": 100000000,
      "totalRemaining": 75000000,
      "totalPaid": 25000000,
      "totalInterestPaid": 3000000,
      "averageInterestRate": 12.5
    },
    "netPosition": -55000000 // Borrowing - Lending remaining
  }
}
```

---

## 7B. Loan APIs (Quản Lý Khoản Vay với Amortization)

**Lưu ý Quan Trọng:**

- **KHÔNG có tùy chọn strategy**: Trả gốc tự do LUÔN giảm monthlyPayment, GIỮ NGUYÊN termMonths
- **Lịch trả bắt đầu từ**: disbursementDate + 1 tháng (VD: Giải ngân 3/11 → Trả đầu 3/12)
- **Xóa payment**: Chỉ được xóa trong 7 ngày, tự động restore loan state

### 7B.1. Get All Loans

```http
GET /api/v1/loans?status=1
Authorization: Bearer <token>

Query Parameters:
- status: 1 (Active) | 2 (Paid Off) | 3 (Defaulted) | 4 (Refinanced)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Vay mua xe",
      "lender": "Ngân hàng Vietcombank",
      "type": 2, // 1=Personal, 2=Mortgage, 3=Auto, 4=Business, 5=Other
      "originalAmount": 1000000000,
      "remainingPrincipal": 803333333,
      "interestRate": 12,
      "termMonths": 60,
      "remainingMonths": 61,
      "monthlyPayment": 14575492, // Giảm từ 16800000 sau trả gốc 200M
      "startDate": "2024-11-03T00:00:00.000Z",
      "disbursementDate": "2024-11-03T10:30:00.000Z",
      "nextPaymentDate": "2025-01-03T00:00:00.000Z",
      "lastPaymentDate": "2024-12-03T14:30:00.000Z",
      "status": 1,
      "totalPrincipalPaid": 200000000,
      "totalInterestPaid": 0,
      "totalPrepayment": 200000000
    }
  ]
}
```

### 7B.2. Create Loan

```http
POST /api/v1/loans
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "Vay mua xe",
  "lender": "Ngân hàng Vietcombank",
  "type": 3, // 1=Personal, 2=Mortgage, 3=Auto, 4=Business, 5=Other
  "originalAmount": 1000000000,
  "interestRate": 12,
  "termMonths": 60,
  "startDate": "2024-11-03T00:00:00.000Z", // ISO 8601 format
  "accountId": "uuid", // Optional: Nếu có thì tự động giải ngân
  "description": "Vay ngân hàng mua xe",
  "notes": "Lãi suất cố định 12%/năm"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vay mua xe",
    "lender": "Ngân hàng Vietcombank",
    "type": 3,
    "originalAmount": 1000000000,
    "remainingPrincipal": 1000000000,
    "interestRate": 12,
    "termMonths": 60,
    "remainingMonths": 60,
    "monthlyPayment": 16800000, // Tính theo công thức amortization
    "startDate": "2024-11-03T00:00:00.000Z",
    "disbursementDate": "2024-11-03T10:30:00.000Z", // Nếu có accountId
    "nextPaymentDate": "2024-12-03T00:00:00.000Z", // disbursementDate + 1 tháng
    "status": 1,
    "accountId": "uuid"
  },
  "message": "Khoản vay được tạo thành công. Tiền đã giải ngân vào tài khoản."
}

Notes:
- Nếu có accountId: Tự động giải ngân (cộng tiền vào account + tạo transaction)
- monthlyPayment tính theo: M = P × [r(1+r)^n] / [(1+r)^n - 1]
- nextPaymentDate = disbursementDate + 1 tháng
```

### 7B.3. Get Payment Schedule with Status (60 tháng)

```http
GET /api/v1/loans/:id/payment-schedule
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "paymentNumber": 1,
      "paymentDate": "2024-12-03",
      "payment": 16800000, // Số tiền thực tế đã trả (từ database)
      "principal": 15800000,
      "interest": 1000000,
      "remainingPrincipal": 984200000,
      "isPaid": true,
      "status": "paid",
      "actualPaymentDate": "2024-12-03T00:00:00.000Z",
      "actualAmount": 16800000,
      "paymentId": "uuid",
      "note": null
    },
    {
      "paymentNumber": 2,
      "paymentDate": "2025-01-03",
      "payment": 14575492, // Số tiền tính toán với monthlyPayment mới
      "principal": 6575492,
      "interest": 8000000,
      "remainingPrincipal": 977624508,
      "isPaid": false,
      "status": "unpaid",
      "actualPaymentDate": null,
      "actualAmount": null,
      "paymentId": null,
      "note": null
    }
    // ... 58 tháng nữa
  ]
}

Notes:
- Tháng đã trả: Lấy data từ loan_payments (giữ nguyên số tiền lịch sử)
- Tháng chưa trả: Tính với loan.monthlyPayment hiện tại
- Tổng cộng 60 dòng (hoặc termMonths của khoản vay)
```

### 7B.4. Record Scheduled Payment

```http
POST /api/v1/loans/:id/payments
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "accountId": "uuid",
  "paymentDate": "2024-12-03",
  "categoryId": "uuid" // Optional, default = "Trả nợ"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "loanId": "uuid",
    "paymentNumber": 1,
    "paymentDate": "2024-12-03",
    "amount": 16800000,
    "principalAmount": 15800000,
    "interestAmount": 1000000,
    "remainingPrincipal": 984200000,
    "status": 2, // Paid
    "isPrepayment": false,
    "isScheduled": true
  },
  "message": "Thanh toán theo lịch thành công"
}

Notes:
- Trả đúng monthlyPayment của tháng hiện tại
- Tự động phân bổ principal/interest dựa trên remainingPrincipal
- Giảm remainingMonths xuống 1
- Cập nhật nextPaymentDate +1 tháng
```

### 7B.5. Make Extra Principal Payment (Trả Gốc Tự Do)

```http
POST /api/v1/loans/:id/extra-principal
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "amount": 200000000,
  "accountId": "uuid",
  "paymentDate": "2024-12-03",
  "categoryId": "uuid", // Optional
  "note": "Trả gốc tự do 200 triệu"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "newRemainingPrincipal": 803333333,
    "oldMonthlyPayment": 16800000,
    "newMonthlyPayment": 14575492,
    "termMonths": 60, // KHÔNG THAY ĐỔI
    "remainingMonths": 60, // KHÔNG THAY ĐỔI
    "savedInterest": 135000000 // Ước tính lãi tiết kiệm được
  },
  "message": "Trả gốc tự do thành công. Số tiền trả hàng tháng giảm từ 16.8M xuống 14.5M"
}

Notes:
- KHÔNG có tùy chọn strategy
- LUÔN giảm monthlyPayment, GIỮ NGUYÊN termMonths
- amount <= remainingPrincipal
- Tạo loan_payment với isPrepayment=true
- Tạo transaction liên kết
```

### 7B.6. Delete Payment (Trong 7 Ngày)

```http
DELETE /api/v1/loans/:loanId/payments/:paymentId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Đã xóa khoản thanh toán và khôi phục trạng thái khoản vay"
}

Error: 400 Bad Request (Nếu quá 7 ngày)
{
  "success": false,
  "error": {
    "code": "LOAN_006",
    "message": "Cannot delete payment older than 7 days"
  }
}

Notes:
- Chỉ xóa được payment trong vòng 7 ngày
- Tự động restore loan state (remainingPrincipal, monthlyPayment, etc.)
- Hoàn tiền về account
- Xóa transaction liên quan
```

### 7B.7. Get Loan Extra Principal History

```http
GET /api/v1/loans/:id/extra-principal
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "paymentDate": "2024-12-03",
      "amount": 200000000,
      "remainingPrincipal": 803333333,
      "previousMonthlyPayment": 16800000,
      "newMonthlyPayment": 14575492,
      "note": "Trả gốc tự do 200 triệu",
      "canDelete": true, // true nếu < 7 ngày
      "daysSincePayment": 3
    }
  ]
}
```

### 7B.8. Get Amortization Schedule (Không có trạng thái)

````http
GET /api/v1/loans/:id/amortization-schedule
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "paymentNumber": 1,
      "paymentDate": "2024-12-03",
      "payment": 14575492,
      "principal": 6575492,
      "interest": 8000000,
      "remainingPrincipal": 977624508
    },
    {
      "paymentNumber": 2,
      "paymentDate": "2025-01-03",
      "payment": 14575492,
      "principal": 6640992,
      "interest": 7934500,
      "remainingPrincipal": 970983516
    }
    // ... 58 tháng nữa
  ]
### 7B.9. Get Loan Transaction History

```http
GET /api/v1/loans/:id/extra-principal
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "transaction-uuid",
      "type": 2, // EXPENSE
      "amount": 200000000,
      "date": "2024-12-03",
      "description": "Trả nợ gốc (ngoài lịch): Vay mua xe",
      "note": "Trả gốc tự do 200 triệu",
      "accountId": "uuid",
      "account": {
        "name": "Tài khoản VCB"
      },
      "categoryId": "uuid",
      "category": {
        "name": "Trả nợ"
      },
      "paymentId": "uuid"
    },
    {
      "id": "transaction-uuid-2",
      "type": 1, // INCOME (Giải ngân)
      "amount": 1000000000,
      "date": "2024-11-03",
      "description": "Giải ngân khoản vay: Vay mua xe",
      "note": "Giải ngân từ Ngân hàng Vietcombank",
      "accountId": "uuid"
    }
  ]
}
````

---

## 7C. Debt APIs (Quản Lý Công Nợ Đơn Giản)

**Lưu ý:** Debts khác với Loans

- Debts: Công nợ đơn giản (cho vay/đi vay cá nhân), không có amortization
- Loans: Khoản vay ngân hàng có lãi suất, amortization schedule
  },
  "afterPrepayment": {
  "remainingMonths": 6,
  "monthlyPayment": 4442458,
  "totalRemainingInterest": 750000,
  "maturityDate": "2025-09-01",
  "savedInterest": 750000,
  "monthsSaved": 3
  }
  },
  "message": "Prepayment simulation. This is for preview only."
  }

````

### 7B.7. Get Loan Summary Report

```http
GET /loans/:id/summary
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "loanId": "uuid",
    "lenderName": "Ngân hàng Vietcombank",
    "originalLoan": {
      "principalAmount": 50000000,
      "interestRate": 12,
      "termMonths": 12,
      "monthlyPayment": 4442458,
      "totalInterest": 3309496,
      "totalPayment": 53309496
    },
    "currentStatus": {
      "currentPrincipal": 18053957,
      "remainingMonths": 5,
      "paidMonths": 7,
      "completionPercentage": 63.89
    },
    "paymentHistory": {
      "totalPrincipalPaid": 31946043,
      "totalInterestPaid": 1882073,
      "totalPrepayment": 20000000,
      "totalPaid": 33828116
    },
    "savings": {
      "savedInterest": 1427423,
      "monthsSavedFromPrepayment": 7
    },
    "chart": {
      "principalVsInterest": [
        {"month": 1, "principal": 3942458, "interest": 500000},
        {"month": 2, "principal": 3981883, "interest": 460575}
      ]
    }
  }
}
````

---

## 8. Event APIs

### 8.1. Get All Events

```http
GET /events?isActive=true
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Du lịch Đà Lạt",
      "description": "Chuyến du lịch gia đình",
      "budget": 15000000,
      "startDate": "2025-02-01",
      "endDate": "2025-02-05",
      "totalSpent": 8500000,
      "remaining": 6500000,
      "transactionCount": 25,
      "isActive": true
    }
  ]
}
```

### 8.2. Create Event

```http
POST /events
Authorization: Bearer <token>

Request Body:
{
  "name": "Đám cưới",
  "description": "Chi phí đám cưới",
  "budget": 200000000,
  "startDate": "2025-06-01",
  "endDate": "2025-06-15",
  "icon": "heart",
  "color": "#E91E63"
}

Response: 201 Created
```

### 8.3. Get Event Transactions

```http
GET /events/:id/transactions?page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### 8.4. Get Event Summary

```http
GET /events/:id/summary
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "eventId": "uuid",
    "name": "Du lịch Đà Lạt",
    "budget": 15000000,
    "totalSpent": 8500000,
    "remaining": 6500000,
    "percentage": 56.67,
    "expenseByCategory": [...],
    "dailySpending": [...]
  }
}
```

---

## 9. Report APIs

### 9.1. Get Dashboard Summary

```http
GET /reports/dashboard?period=thisMonth
Authorization: Bearer <token>

Query Parameters:
- period: today | thisWeek | thisMonth | thisYear | custom
- startDate: YYYY-MM-DD (if period=custom)
- endDate: YYYY-MM-DD (if period=custom)

Response: 200 OK
{
  "success": true,
  "data": {
    "totalIncome": 20000000,
    "totalExpense": 15000000,
    "balance": 5000000,
    "accountsBalance": 25000000,
    "budgetUsage": {
      "total": 10000000,
      "spent": 7500000,
      "percentage": 75
    },
    "topExpenseCategories": [...],
    "recentTransactions": [...],
    "upcomingPayments": [...]
  }
}
```

### 9.2. Get Income vs Expense Report

```http
GET /reports/income-expense?period=last12Months
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "labels": ["Jan", "Feb", "Mar", ...],
    "income": [20000000, 22000000, ...],
    "expense": [15000000, 16000000, ...],
    "balance": [5000000, 6000000, ...]
  }
}
```

### 9.3. Get Category Distribution

```http
GET /reports/category-distribution?type=expense&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "Ăn uống",
      "amount": 3000000,
      "percentage": 30,
      "transactionCount": 45,
      "color": "#FF6B6B"
    }
  ]
}
```

### 9.4. Export Report

```http
POST /reports/export
Authorization: Bearer <token>

Request Body:
{
  "format": "excel", // excel | pdf | csv
  "reportType": "transactions", // transactions | summary | category
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "downloadUrl": "https://...",
    "expiresAt": "2025-01-20T10:00:00Z"
  }
}
```

---

## 10. Reminder & Notification APIs

### 10.1. Get All Reminders

```http
GET /reminders?isActive=true&isCompleted=false
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Trả tiền điện",
      "description": "Trả tiền điện tháng 1",
      "type": "payment",
      "dueDate": "2025-01-25T09:00:00Z",
      "frequency": "monthly",
      "isActive": true,
      "isCompleted": false
    }
  ]
}
```

### 10.2. Create Reminder

```http
POST /reminders
Authorization: Bearer <token>

Request Body:
{
  "title": "Trả nợ",
  "description": "Trả nợ cho B",
  "type": "debt",
  "dueDate": "2025-02-01T09:00:00Z",
  "frequency": "once",
  "debtId": "uuid",
  "notifyBeforeMinutes": 1440
}

Response: 201 Created
```

### 10.3. Get Notifications

```http
GET /notifications?isRead=false&page=1&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Cảnh báo ngân sách",
      "message": "Bạn đã sử dụng 85% ngân sách tháng này",
      "type": "budget_alert",
      "isRead": false,
      "referenceId": "uuid",
      "referenceType": "budget",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### 10.4. Mark Notification as Read

```http
PUT /notifications/:id/read
Authorization: Bearer <token>

Response: 200 OK
```

### 10.5. Mark All as Read

```http
PUT /notifications/read-all
Authorization: Bearer <token>

Response: 200 OK
```

---

## 11. Error Codes

```typescript
const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Authorization
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

  // Business Logic
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  CANNOT_DELETE_DEFAULT: 'CANNOT_DELETE_DEFAULT',
  HAS_DEPENDENCIES: 'HAS_DEPENDENCIES',

  // Server
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};
```

---

**Lưu ý**:

- Tất cả timestamps sử dụng ISO 8601 format
- Tất cả số tiền dùng DECIMAL, không làm tròn
- Pagination mặc định: page=1, limit=20
- Rate limit: 100 requests/minute per user

**⚠️ QUAN TRỌNG VỀ ENUM VALUES:**

- **Trong production, TẤT CẢ type/status fields PHẢI dùng INTEGER** (xem mục 1 - Enum Values)
- Các ví dụ API response trong tài liệu này có thể dùng string để dễ hiểu (documentation purpose)
- Khi implement thực tế:
  - Request body PHẢI gửi integer: `"type": 2` (KHÔNG phải `"type": "expense"`)
  - Response body LUÔN trả về integer: `"type": 2`
  - Frontend phải map integer → label để hiển thị
  - Backend sẽ reject bất kỳ request nào gửi string thay vì integer

**Ví dụ thực tế:**

```json
// Request (PHẢI như thế này)
POST /transactions
{
  "accountId": "uuid",
  "categoryId": "uuid",
  "amount": 50000,
  "type": 2,              // 2 = Expense (số, không phải "expense")
  "transactionDate": "2025-01-15"
}

// Response (sẽ như thế này)
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": 2,            // Backend trả về số
    "amount": 50000,
    "category": {
      "id": "uuid",
      "name": "Ăn uống",
      "type": 2           // 2 = Expense category
    }
  }
}
```
