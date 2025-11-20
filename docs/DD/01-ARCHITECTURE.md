# Thiết Kế Kiến Trúc Hệ Thống - Quản Lý Chi Tiêu

## 1. Tổng Quan Kiến Trúc

### 1.1. Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Web App    │  │  Mobile App  │  │   Desktop    │      │
│  │  (React.js)  │  │(React Native)│  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │
                    HTTPS / REST API
                           │
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Load Balancer                │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer (NestJS)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Auth   │ │Transaction│ │  Budget  │ │  Report  │       │
│  │  Module  │ │  Module   │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Account │ │   Debt   │ │  Event   │ │ Reminder │       │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Loan   │ │   Goal   │ │ Sharing  │ │Notification│     │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
┌───────────────┐  ┌──────────────┐  ┌──────────┐
│  PostgreSQL   │  │    Redis     │  │  S3/Cloud│
│   Database    │  │    Cache     │  │  Storage │
└───────────────┘  └──────────────┘  └──────────┘
```

### 1.2. Layered Architecture

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Controllers)         │
│  - HTTP Request/Response handling                │
│  - Input validation                              │
│  - API Documentation (Swagger)                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          Business Logic Layer (Services)         │
│  - Core business logic                           │
│  - Data transformation                           │
│  - Business rules validation                     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│        Data Access Layer (Repositories)          │
│  - Database queries (TypeORM/Prisma)             │
│  - Data mapping                                  │
│  - Transaction management                        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Database Layer                      │
│  - PostgreSQL (Primary data)                     │
│  - Redis (Cache, Sessions, Queue)                │
└─────────────────────────────────────────────────┘
```

## 2. Frontend Architecture (React.js)

### 2.1. Cấu Trúc Thư Mục

```
src/
├── assets/                      # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/                  # Atomic Design Components
│   ├── atoms/                   # Basic UI elements
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Icon/
│   │   ├── Typography/
│   │   └── Badge/
│   │
│   ├── molecules/               # Composite components
│   │   ├── SearchBar/
│   │   ├── FormField/
│   │   ├── DateRangePicker/
│   │   ├── AmountInput/
│   │   └── CategorySelector/
│   │
│   ├── organisms/               # Complex components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── TransactionList/
│   │   ├── BudgetCard/
│   │   ├── ChartPanel/
│   │   └── DebtCard/
│   │
│   └── templates/               # Page layouts
│       ├── DashboardLayout/
│       ├── AuthLayout/
│       └── SettingsLayout/
│
├── pages/                       # Route pages
│   ├── Dashboard/
│   ├── Transactions/
│   ├── Budgets/
│   ├── Reports/
│   ├── Debts/
│   ├── Loans/                  # Loan management
│   │   ├── LoanList.tsx
│   │   ├── LoanDetail.tsx
│   │   ├── AmortizationSchedule.tsx
│   │   ├── PrepaymentModal.tsx
│   │   └── LoanCharts.tsx
│   ├── Events/
│   ├── Goals/
│   └── Settings/
│
├── redux/                       # State management
│   ├── store.ts
│   ├── rootReducer.ts
│   ├── rootSaga.ts
│   └── modules/
│       ├── auth/
│       │   ├── authSlice.ts
│       │   ├── authSaga.ts
│       │   ├── authTypes.ts
│       │   └── authSelectors.ts
│       ├── transactions/
│       ├── budgets/
│       ├── accounts/
│       ├── loans/              # Loan state management
│       │   ├── loanSlice.ts
│       │   ├── loanSaga.ts
│       │   ├── loanTypes.ts
│       │   └── loanSelectors.ts
│       └── ui/
│
├── services/                    # API Services
│   ├── api.ts                  # Axios instance config
│   ├── authService.ts
│   ├── transactionService.ts
│   ├── budgetService.ts
│   ├── debtService.ts
│   ├── loanService.ts          # Loan API calls
│   │   # - getLoanList()
│   │   # - getLoanDetail(id)
│   │   # - createLoan(data)
│   │   # - recordPayment(loanId, paymentId, data)
│   │   # - simulatePrepayment(loanId, amount, strategy)
│   │   # - getAmortizationSchedule(loanId)
│   └── reportService.ts
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePermission.ts
│   └── useNotification.ts
│
├── utils/                       # Utility functions
│   ├── formatters.ts           # Number, date formatting
│   ├── validators.ts           # Form validation
│   ├── helpers.ts              # General helpers (lodash)
│   └── constants.ts            # App constants
│
├── types/                       # TypeScript definitions
│   ├── models/
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   ├── Budget.ts
│   │   ├── Account.ts
│   │   ├── Loan.ts             # Loan & LoanPayment types
│   │   └── Debt.ts
│   ├── api/
│   └── common/
│
├── styles/                      # Global styles
│   ├── theme.ts                # Ant Design theme config
│   ├── globalStyles.ts         # Styled-components global
│   └── variables.ts            # CSS variables
│
├── routes/                      # Routing config
│   ├── index.tsx
│   ├── PrivateRoute.tsx
│   └── PublicRoute.tsx
│
├── App.tsx
└── main.tsx
```

### 2.2. State Management Flow (Redux-Saga)

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │ dispatch(action)
       ↓
┌─────────────┐
│   Action    │
└──────┬──────┘
       │
       ├────────────────────┐
       │                    │
       ↓                    ↓
┌─────────────┐      ┌─────────────┐
│   Reducer   │      │    Saga     │
│  (Sync)     │      │   (Async)   │
└──────┬──────┘      └──────┬──────┘
       │                    │ API Call
       │                    ↓
       │             ┌─────────────┐
       │             │   Service   │
       │             └──────┬──────┘
       │                    │
       │                    ↓
       │             ┌─────────────┐
       │             │  Backend    │
       │             └──────┬──────┘
       │                    │
       │                    ↓ Response
       │             ┌─────────────┐
       │             │    Saga     │
       │             │  (success/  │
       │             │   error)    │
       │             └──────┬──────┘
       │                    │ dispatch
       ↓                    ↓
┌─────────────────────────────┐
│          Store              │
└──────────┬──────────────────┘
           │
           ↓ subscribe
┌─────────────┐
│  Component  │ (re-render)
└─────────────┘
```

## 3. Backend Architecture (NestJS)

### 3.1. Cấu Trúc Thư Mục

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
│
├── config/                      # Configuration
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── aws.config.ts
│
├── common/                      # Shared resources
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── interfaces/
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── reset-password.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   │
│   ├── transactions/
│   │   ├── transactions.module.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.repository.ts
│   │   ├── entities/
│   │   │   ├── transaction.entity.ts
│   │   │   └── recurring-transaction.entity.ts
│   │   └── dto/
│   │
│   ├── categories/
│   ├── budgets/
│   ├── accounts/
│   ├── debts/
│   ├── loans/                  # Loan management with amortization
│   │   ├── loans.module.ts
│   │   ├── loans.controller.ts
│   │   ├── loans.service.ts
│   │   ├── loans.repository.ts
│   │   ├── entities/
│   │   │   ├── loan.entity.ts
│   │   │   └── loan-payment.entity.ts
│   │   ├── dto/
│   │   │   ├── create-loan.dto.ts
│   │   │   ├── update-loan.dto.ts
│   │   │   ├── record-payment.dto.ts
│   │   │   └── prepayment.dto.ts
│   │   └── utils/
│   │       └── amortization.calculator.ts
│   ├── events/
│   ├── goals/
│   ├── reminders/
│   ├── reports/
│   ├── notifications/
│   └── sharing/
│
└── database/
    ├── migrations/
    ├── seeds/
    └── database.module.ts
```

### 3.2. Module Structure Pattern

```typescript
// Example: Transactions Module

transactions/
├── transactions.module.ts          // Module definition
├── transactions.controller.ts      // HTTP endpoints
├── transactions.service.ts         // Business logic
├── transactions.repository.ts      // Data access
├── entities/
│   └── transaction.entity.ts      // Database entity
├── dto/
│   ├── create-transaction.dto.ts  // Request DTOs
│   ├── update-transaction.dto.ts
│   └── query-transaction.dto.ts
└── interfaces/
    └── transaction.interface.ts   // Type definitions
```

## 4. Database Design

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
```

### 4.2. Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, start_date, end_date);
CREATE INDEX idx_debts_user_status ON debts(user_id, status);
```

## 5. API Design

### 5.1. RESTful API Conventions

```
HTTP Method │ Endpoint                    │ Description
────────────┼─────────────────────────────┼──────────────────────
GET         │ /api/transactions           │ List transactions
GET         │ /api/transactions/:id       │ Get transaction detail
POST        │ /api/transactions           │ Create transaction
PUT         │ /api/transactions/:id       │ Update transaction
DELETE      │ /api/transactions/:id       │ Delete transaction
GET         │ /api/transactions/summary   │ Get summary/stats
POST        │ /api/transactions/bulk      │ Bulk create
```

### 5.2. Response Format

```typescript
// Success Response
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2025-11-19T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [...]
  },
  "timestamp": "2025-11-19T10:30:00Z"
}

// Paginated Response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## 6. Security Architecture

### 6.1. Authentication Flow

```
1. Login Request
   Client → POST /api/auth/login {email, password}

2. Validate Credentials
   Server → Check DB → Bcrypt compare

3. Generate Tokens
   Server → JWT Access Token (15min) + Refresh Token (7days)

4. Return Tokens
   Server → Client {accessToken, refreshToken, user}

5. Authenticated Request
   Client → Headers: {Authorization: "Bearer <accessToken>"}

6. Verify Token
   Server → JWT Guard → Validate & Decode

7. Token Refresh
   Client → POST /api/auth/refresh {refreshToken}
   Server → New Access Token
```

### 6.2. Security Layers

```
┌─────────────────────────────────────────┐
│  1. HTTPS/TLS Encryption                │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  2. CORS Configuration                  │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  3. Rate Limiting (Redis)               │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  4. JWT Authentication                  │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  5. Role-Based Access Control           │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  6. Input Validation & Sanitization     │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│  7. SQL Injection Prevention (ORM)      │
└─────────────────────────────────────────┘
```

## 7. Caching Strategy

### 7.1. Redis Cache Layers

```typescript
// L1: User Session Cache (TTL: 7 days)
cache:session:{userId} → User session data

// L2: Frequently Accessed Data (TTL: 1 hour)
cache:categories:{userId} → User categories
cache:accounts:{userId} → User accounts

// L3: Computed Data (TTL: 5 minutes)
cache:dashboard:{userId} → Dashboard summary
cache:report:{userId}:{period} → Report data

// L4: Rate Limiting (TTL: 1 minute)
ratelimit:{ip}:{endpoint} → Request count
```

## 8. File Upload & Storage

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ Upload file
       ↓
┌──────────────┐
│   Backend    │ Validate (size, type)
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ↓                 ↓
┌──────────────┐   ┌──────────────┐
│   Local      │   │  AWS S3 /    │
│   Storage    │   │  Cloudinary  │
│ (Dev only)   │   │  (Production)│
└──────────────┘   └──────┬───────┘
                          │
                          ↓ Return URL
                   ┌──────────────┐
                   │   Database   │
                   │ (Store URL)  │
                   └──────────────┘
```

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloud Provider                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Web App  │  │  Backend   │  │  Database  │        │
│  │  (Vercel/  │  │  (AWS EC2/ │  │(AWS RDS/   │        │
│  │  Netlify)  │  │   Heroku)  │  │  Railway)  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   Redis    │  │ File Store │  │   CDN      │        │
│  │ (Upstash)  │  │   (S3)     │  │(CloudFlare)│        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

---

**Lưu ý**: Kiến trúc này có thể điều chỉnh tùy theo quy mô và yêu cầu thực tế của dự án.
