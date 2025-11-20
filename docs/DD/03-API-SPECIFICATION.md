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

## 7. Debt APIs

### 7.1. Get All Debts

```http
GET /debts?type=lending&status=active
Authorization: Bearer <token>

Query Parameters:
- type: lending | borrowing
- status: active | partial_paid | fully_paid | overdue

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "lending",
      "personName": "Nguyen Van B",
      "personContact": "0123456789",
      "principalAmount": 10000000,
      "remainingAmount": 7000000,
      "interestRate": 5,
      "borrowedDate": "2025-01-01",
      "dueDate": "2025-12-31",
      "status": "partial_paid",
      "payments": [...]
    }
  ]
}
```

### 7.2. Create Debt

```http
POST /debts
Authorization: Bearer <token>

Request Body:
{
  "type": "lending",
  "personName": "Nguyen Van B",
  "personContact": "0123456789",
  "principalAmount": 10000000,
  "interestRate": 5,
  "borrowedDate": "2025-01-01",
  "dueDate": "2025-12-31",
  "paymentFrequency": "monthly",
  "note": "Cho vay mua xe"
}

Response: 201 Created
```

### 7.3. Record Debt Payment

```http
POST /debts/:id/payments
Authorization: Bearer <token>

Request Body:
{
  "amount": 1000000,
  "paymentDate": "2025-01-15",
  "note": "Trả nợ lần 1"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "debtId": "uuid",
    "amount": 1000000,
    "remainingDebt": 9000000
  }
}
```

### 7.4. Get Debt Payment History

```http
GET /debts/:id/payments
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 1000000,
      "paymentDate": "2025-01-15",
      "note": "Trả nợ lần 1",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

## 7B. Loan APIs (Quản Lý Khoản Vay với Amortization)

### 7B.1. Get All Loans

```http
GET /loans?status=active
Authorization: Bearer <token>

Query Parameters:
- status: active | paid_off | defaulted | refinanced

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "lenderName": "Ngân hàng Vietcombank",
      "loanType": "mortgage",
      "principalAmount": 50000000,
      "currentPrincipal": 35000000,
      "interestRate": 12,
      "loanTermMonths": 12,
      "remainingMonths": 9,
      "monthlyPayment": 4442458,
      "disbursementDate": "2025-01-01",
      "maturityDate": "2025-12-01",
      "status": "active",
      "totalPrincipalPaid": 15000000,
      "totalInterestPaid": 850000,
      "allowPrepayment": true,
      "prepaymentStrategy": "reduce_term"
    }
  ]
}
```

### 7B.2. Create Loan

```http
POST /loans
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "lenderName": "Ngân hàng Vietcombank",
  "loanType": "personal",
  "principalAmount": 50000000,
  "interestRate": 12,
  "loanTermMonths": 12,
  "disbursementDate": "2025-01-01",
  "firstPaymentDate": "2025-02-01",
  "accountId": "uuid",
  "allowPrepayment": true,
  "prepaymentPenaltyRate": 0,
  "prepaymentStrategy": "reduce_term",
  "note": "Vay mua xe"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "lenderName": "Ngân hàng Vietcombank",
    "principalAmount": 50000000,
    "monthlyPayment": 4442458,
    "totalInterest": 3309496,
    "totalPayment": 53309496,
    "amortizationSchedule": [...]
  },
  "message": "Loan created successfully. Amortization schedule generated."
}

Notes:
- monthlyPayment được tính tự động theo công thức:
  M = P * [r(1+r)^n] / [(1+r)^n - 1]
  Trong đó:
    P = Principal (số tiền vay)
    r = Monthly interest rate (lãi suất tháng)
    n = Number of months (số tháng vay)
```

### 7B.3. Get Loan Details with Amortization Schedule

```http
GET /loans/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "lenderName": "Ngân hàng Vietcombank",
    "loanType": "personal",
    "principalAmount": 50000000,
    "currentPrincipal": 35000000,
    "interestRate": 12,
    "loanTermMonths": 12,
    "remainingMonths": 9,
    "monthlyPayment": 4442458,
    "disbursementDate": "2025-01-01",
    "firstPaymentDate": "2025-02-01",
    "maturityDate": "2025-12-01",
    "status": "active",
    "totalPrincipalPaid": 15000000,
    "totalInterestPaid": 850000,
    "amortizationSchedule": [
      {
        "paymentNumber": 1,
        "dueDate": "2025-02-01",
        "scheduledPrincipal": 3942458,
        "scheduledInterest": 500000,
        "scheduledTotal": 4442458,
        "actualPrincipal": 3942458,
        "actualInterest": 500000,
        "prepaymentAmount": 0,
        "principalBalanceAfter": 46057542,
        "status": "paid"
      },
      {
        "paymentNumber": 2,
        "dueDate": "2025-03-01",
        "scheduledPrincipal": 3981883,
        "scheduledInterest": 460575,
        "scheduledTotal": 4442458,
        "actualPrincipal": 3981883,
        "actualInterest": 460575,
        "prepaymentAmount": 0,
        "principalBalanceAfter": 42075659,
        "status": "paid"
      },
      {
        "paymentNumber": 3,
        "dueDate": "2025-04-01",
        "scheduledPrincipal": 4021702,
        "scheduledInterest": 420756,
        "scheduledTotal": 4442458,
        "actualPrincipal": 4021702,
        "actualInterest": 420756,
        "prepaymentAmount": 20000000,
        "principalBalanceAfter": 18053957,
        "status": "paid",
        "note": "Trả nợ trước hạn 20tr"
      },
      {
        "paymentNumber": 4,
        "dueDate": "2025-05-01",
        "scheduledPrincipal": 4261919,
        "scheduledInterest": 180540,
        "scheduledTotal": 4442459,
        "principalBalanceAfter": 13792038,
        "status": "pending"
      }
    ],
    "summary": {
      "totalScheduledPayment": 53309496,
      "totalPaid": 29228233,
      "totalRemaining": 24081263,
      "savedInterestFromPrepayment": 1500000
    }
  }
}
```

### 7B.4. Record Loan Payment

```http
POST /loans/:id/payments/:paymentId
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "principalAmount": 4021702,
  "interestAmount": 420756,
  "prepaymentAmount": 20000000,
  "note": "Trả nợ tháng 3 + trả trước 20tr"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "loanId": "uuid",
    "totalPaid": 24442458,
    "newCurrentPrincipal": 18053957,
    "newRemainingMonths": 5,
    "newMaturityDate": "2025-09-01",
    "savedInterest": 1500000
  },
  "message": "Payment recorded. Loan schedule recalculated due to prepayment."
}
```

### 7B.5. Get Upcoming Loan Payments

```http
GET /loans/:id/upcoming-payments?limit=3
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "paymentNumber": 4,
      "dueDate": "2025-05-01",
      "scheduledTotal": 4442459,
      "principalPortion": 4261919,
      "interestPortion": 180540,
      "daysUntilDue": 10,
      "status": "pending"
    },
    {
      "paymentNumber": 5,
      "dueDate": "2025-06-01",
      "scheduledTotal": 4442458,
      "principalPortion": 4304548,
      "interestPortion": 137910,
      "daysUntilDue": 41,
      "status": "pending"
    }
  ]
}
```

### 7B.6. Simulate Prepayment

```http
POST /loans/:id/simulate-prepayment
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "prepaymentAmount": 10000000,
  "strategy": "reduce_term"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "currentScenario": {
      "remainingMonths": 9,
      "monthlyPayment": 4442458,
      "totalRemainingInterest": 1500000,
      "maturityDate": "2025-12-01"
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
```

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
```

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
