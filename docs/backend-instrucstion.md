# Backend Development Instructions - Expense Management App

## 📋 Tổng Quan

Tài liệu này quy định các yêu cầu, tiêu chuẩn và quy tắc bắt buộc cho việc phát triển Backend của ứng dụng Quản Lý Chi Tiêu Cá Nhân.

**Tech Stack Requirements:**

- NestJS 10+ with TypeScript (REQUIRED)
- PostgreSQL 15+ (REQUIRED)
- TypeORM or Prisma for ORM (REQUIRED)
- Redis for caching (REQUIRED)
- JWT for authentication (REQUIRED)
- Class-validator for validation (REQUIRED)

---

## 🏗️ 1. Project Structure Requirements

### 1.1. Folder Structure Standards

**MUST follow NestJS modular architecture:**

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/                      # Configuration files
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── app.config.ts
├── common/                      # Shared code
│   ├── decorators/             # Custom decorators
│   ├── guards/                 # Auth guards, role guards
│   ├── interceptors/           # Response, logging interceptors
│   ├── filters/                # Exception filters
│   ├── pipes/                  # Validation pipes
│   ├── constants/              # App constants
│   │   ├── enums.ts           # ⭐ ALL enum definitions (REQUIRED)
│   │   ├── error-codes.ts
│   │   └── api-routes.ts
│   └── utils/                  # Helper functions
├── modules/                     # Feature modules
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   ├── strategies/        # JWT, Local strategies
│   │   └── dto/               # Data Transfer Objects
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   ├── transactions/
│   ├── accounts/
│   ├── budgets/
│   ├── categories/
│   ├── loans/
│   ├── debts/
│   ├── events/
│   ├── goals/
│   └── reports/
├── database/                    # Database related
│   ├── migrations/
│   ├── seeds/
│   └── factories/
└── types/                       # TypeScript type definitions
    ├── interfaces/
    └── enums/
```

### 1.2. File Naming Conventions

- **Modules:** kebab-case (e.g., `users.module.ts`, `loan-payments.module.ts`)
- **Controllers:** kebab-case with `.controller.ts` suffix
- **Services:** kebab-case with `.service.ts` suffix
- **Entities:** kebab-case with `.entity.ts` suffix
- **DTOs:** kebab-case with `.dto.ts` suffix
- **Interfaces:** PascalCase with `I` prefix in `.interface.ts` files
- **Types:** PascalCase with `T` prefix in `.type.ts` files
- **Enums:** PascalCase in `.enum.ts` files

### 1.3. Module Structure

**Each feature module MUST contain:**

```
feature-name/
├── feature-name.module.ts       # Module definition
├── feature-name.controller.ts   # REST API endpoints
├── feature-name.service.ts      # Business logic
├── feature-name.repository.ts   # Database operations (if using Repository pattern)
├── entities/
│   └── feature.entity.ts        # Database entity
├── dto/
│   ├── create-feature.dto.ts    # Create DTO
│   ├── update-feature.dto.ts    # Update DTO
│   └── feature-response.dto.ts  # Response DTO
├── interfaces/
│   └── feature.interface.ts     # TypeScript interfaces (if needed)
└── enums/
    └── feature-status.enum.ts   # Enums (if needed)
```

### 1.4. ENUM Constants (CRITICAL - Integer Based)

**MUST define all enums in `src/common/constants/enums.ts` using INTEGER values:**

```typescript
// src/common/constants/enums.ts

// Account Types - Database stores as SMALLINT
export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
  E_WALLET = 4,
  INVESTMENT = 5,
}

// Transaction Types
export enum TransactionType {
  INCOME = 1,
  EXPENSE = 2,
  TRANSFER = 3,
}

// Category Types
export enum CategoryType {
  INCOME = 1,
  EXPENSE = 2,
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

// Debt Types
export enum DebtType {
  LENDING = 1,
  BORROWING = 2,
}

// Debt Status
export enum DebtStatus {
  ACTIVE = 1,
  PARTIAL_PAID = 2,
  FULLY_PAID = 3,
  OVERDUE = 4,
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

// Reminder Types
export enum ReminderType {
  PAYMENT = 1,
  DEBT = 2,
  BUDGET = 3,
  CUSTOM = 4,
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

**Label mappings for display:**

```typescript
// src/common/constants/enum-labels.ts

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

// ... other label mappings
```

**ENUM Requirements:**

- ⭐ **MUST use INTEGER values (1, 2, 3...) matching database SMALLINT columns**
- ⭐ **MUST synchronize with database schema and Frontend enums**
- DO NOT use string enums (`'active'`, `'pending'`) - use numbers only
- DO NOT create duplicate enums in modules
- MUST export from single source (`common/constants/enums.ts`)
- Frontend MUST import exact same enum values

---

## 🔧 2. Configuration Requirements

### 2.1. Environment Variables

**MUST use ConfigModule and validate environment variables:**

```typescript
// .env file structure
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=expense_management

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**MUST validate environment variables:**

```typescript
import { IsString, IsNumber, IsEnum } from 'class-validator';

export class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;
  // ... other validations
}
```

### 2.2. Database Configuration

**MUST use TypeORM or Prisma with proper configuration:**

- Enable synchronize ONLY in development
- Use migrations in production
- Enable logging in development
- Configure connection pooling
- Set proper timezone (UTC)

### 2.3. Application Configuration

**MUST configure:**

- Global validation pipe with whitelist and transform
- CORS with allowed origins
- Helmet for security headers
- Rate limiting (10 requests/second per IP)
- Request logging with Morgan or custom logger
- Global error filter

---

## 🗄️ 3. Database Standards

### 3.1. Entity Definitions

**MUST use TypeORM entities with PostgreSQL ENUM types:**

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountType, TransactionType } from '../common/constants/enums';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({
    type: 'smallint',
    comment: '1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment',
  })
  type: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}
```

**Entity requirements:**

- **MUST use `type: 'smallint'` for all status/type columns (numeric enums)**
- **MUST add descriptive comments showing value mappings (e.g., '1=Cash, 2=Bank')**
- **DO NOT use `type: 'enum'` or `type: 'varchar'` for status/type fields**
- Use `snake_case` for database column names
- Use `camelCase` for entity property names
- Always include `id`, `createdAt`, `updatedAt`
- Implement soft delete with `deletedAt`
- Use UUIDs for primary keys
- Define proper indexes for performance
- Set cascade options carefully
- Import enums from `src/common/constants/enums` for validation/typing
-

### 3.2. Relationships

**MUST properly define relationships:**

```typescript
// One-to-Many
@OneToMany(() => Transaction, transaction => transaction.user)
transactions: Transaction[];

// Many-to-One
@ManyToOne(() => User, user => user.transactions)
@JoinColumn({ name: 'user_id' })
user: User;

// Many-to-Many (if needed)
@ManyToMany(() => Category)
@JoinTable()
categories: Category[];
```

**Relationship requirements:**

- Always specify `JoinColumn` with `name` for foreign keys
- Use `snake_case` for foreign key column names
- Set proper `onDelete` and `onUpdate` options
- Use `eager` loading carefully (avoid N+1 problem)
- Prefer lazy loading for large relations

### 3.3. Migrations

**MUST use migrations for schema changes:**

- Never use `synchronize: true` in production
- Create migration for every schema change
- Name migrations descriptively: `CreateUsersTable`, `AddEmailVerifiedToUsers`
- Test migrations with rollback
- Keep migrations in version control

---

## 📦 4. DTO (Data Transfer Objects) Standards

### 4.1. DTO Definition

**MUST use class-validator and ENUMs for all DTOs:**

```typescript
import { IsString, IsEmail, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../common/constants/enums';

export class CreateAccountDto {
  @ApiProperty({ example: 'My Bank Account' })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'integer',
    enum: [1, 2, 3, 4, 5],
    example: 2,
    description: 'Account type: 1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  type: number;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  balance: number;
}

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'VND', required: false })
  @IsString()
  @IsOptional()
  currency?: string;
}
```

**IMPORTANT - Integer Enum Validation:**

- MUST use `@IsInt()` decorator for enum fields (not `@IsEnum()` or `@IsString()`)
- MUST use `@Min()` and `@Max()` to validate range (e.g., `@Min(1) @Max(5)`)
- MUST use `@Type(() => Number)` to transform string input to number
- MUST import enums from `src/common/constants/enums` for typing (e.g., `type: number` but typed as `AccountType` in service)
- MUST document numeric values in `@ApiProperty()` (e.g., '1=Cash, 2=Bank')
- DO NOT use `@IsEnum(EnumType)` - use integer validation instead

### 4.2. DTO Requirements

**MUST follow:**

- Use `class-validator` decorators for validation
- Add `@ApiProperty()` for Swagger documentation
- Create separate DTOs for Create, Update, Response
- Use `PartialType()` for Update DTOs
- Use `PickType()` or `OmitType()` when appropriate
- Transform data types (e.g., string to Date) using `@Transform()`
- Validate nested objects with `@ValidateNested()`

### 4.3. Response DTOs

**MUST use response DTOs to exclude sensitive data:**

```typescript
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Exclude()
  password: string;

  @Expose()
  createdAt: Date;
}
```

---

## 🔌 5. API Design Standards

### 5.1. RESTful API Conventions

**MUST follow REST standards:**

- Use proper HTTP methods:

  - `GET` - Retrieve resources
  - `POST` - Create resources
  - `PUT` - Full update
  - `PATCH` - Partial update
  - `DELETE` - Delete resources

- Use proper HTTP status codes:
  - `200 OK` - Success (GET, PUT, PATCH)
  - `201 Created` - Resource created (POST)
  - `204 No Content` - Success with no body (DELETE)
  - `400 Bad Request` - Validation error
  - `401 Unauthorized` - Not authenticated
  - `403 Forbidden` - Not authorized
  - `404 Not Found` - Resource not found
  - `409 Conflict` - Duplicate resource
  - `422 Unprocessable Entity` - Business logic error
  - `500 Internal Server Error` - Server error

### 5.2. API Response Format

**MUST use consistent response format:**

```typescript
// Success response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error response
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [ ... ] // validation errors
  }
}

// Paginated response
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 5.3. Endpoint Naming

**MUST use kebab-case for URLs:**

- ✅ `/api/transactions`
- ✅ `/api/loan-payments`
- ✅ `/api/users/:id/transactions`
- ❌ `/api/Transactions`
- ❌ `/api/loanPayments`

### 5.4. Versioning

**MUST version APIs:**

- Use URL versioning: `/api/v1/transactions`
- Or header versioning: `Accept: application/vnd.api.v1+json`
- Default to latest stable version

---

## 🔐 6. Authentication & Authorization

### 6.1. JWT Authentication

**MUST implement:**

- Access token (short-lived: 1 hour)
- Refresh token (long-lived: 7 days)
- Token blacklisting on logout (using Redis)
- Secure token storage (httpOnly cookies or Authorization header)

### 6.2. Password Security

**MUST implement:**

- Hash passwords with bcrypt (salt rounds: 10)
- Validate password strength (min 6 characters, complexity rules)
- Never log or expose passwords
- Implement password reset with expiring tokens

### 6.3. Authorization

**MUST implement role-based access control:**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/users')
getUsers() { }
```

**Permission levels:**

- User can only access their own data
- Validate user ownership before any operation
- Implement resource-level permissions

---

## 🛡️ 7. Security Standards

### 7.1. Input Validation

**MUST validate all inputs:**

- Use ValidationPipe globally
- Sanitize user inputs (prevent XSS)
- Validate file uploads (type, size, extension)
- Check for SQL injection patterns
- Validate email formats strictly

### 7.2. Rate Limiting

**MUST implement rate limiting:**

- Global rate limit: 100 requests/minute per IP
- Auth endpoints: 5 requests/minute per IP
- Upload endpoints: 10 requests/hour per user

### 7.3. Security Headers

**MUST use Helmet for security headers:**

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

### 7.4. CORS Configuration

**MUST configure CORS properly:**

- Whitelist allowed origins (no wildcard in production)
- Allow specific HTTP methods
- Set credentials: true for cookies

---

## 📝 8. Logging Standards

### 8.1. Logging Levels

**MUST use appropriate log levels:**

- `error` - Errors that need immediate attention
- `warn` - Warning messages
- `info` - General information (startup, shutdown)
- `debug` - Debugging information (development only)
- `verbose` - Detailed logs (development only)

### 8.2. What to Log

**MUST log:**

- All HTTP requests (method, URL, status, duration)
- Authentication attempts (success/failure)
- Authorization failures
- Database errors
- External API calls
- Business logic errors
- File uploads

**MUST NOT log:**

- Passwords (plain or hashed)
- Access tokens or refresh tokens
- Credit card numbers
- Personal sensitive data (unless encrypted)
-

### 8.3. Log Format

**MUST include in logs:**

- Timestamp (ISO 8601 format)
- Log level
- Request ID (for tracing)
- User ID (if authenticated)
- Error stack trace (for errors)

---

## 🧪 9. Testing Requirements

### 9.1. Unit Tests

**MUST test:**

- Service methods (business logic)
- Helper functions and utilities
- Custom decorators and pipes
- Target: 80%+ code coverage

### 9.2. Integration Tests

**MUST test:**

- Controller endpoints (E2E)
- Database operations
- Authentication flows
- Authorization checks
- File upload functionality

### 9.3. Test Structure

```typescript
describe('TransactionService', () => {
  let service: TransactionService;
  let repository: Repository<Transaction>;

  beforeEach(async () => {
    // Setup test module
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should throw error if account not found', async () => {
      // Test error cases
    });
  });
});
```

---

## 📊 10. Database Query Standards

### 10.1. Query Optimization

**MUST optimize queries:**

- Use indexes on frequently queried columns
- Avoid N+1 queries (use eager loading or joins)
- Limit result sets with pagination
- Use query builders for complex queries
- Cache frequently accessed data in Redis

### 10.2. Transactions

**MUST use database transactions for:**

- Multi-step operations (create transaction + update account balance)
- Financial operations (transfers between accounts)
- Batch operations

```typescript
await this.dataSource.transaction(async (manager) => {
  await manager.save(transaction);
  await manager.update(Account, accountId, { balance });
});
```

### 10.3. Soft Deletes

**MUST implement soft deletes:**

- Set `deletedAt` timestamp instead of hard delete
- Exclude soft-deleted records in queries by default
- Provide admin endpoint to permanently delete

---

## 🚀 11. Performance Standards

### 11.1. Caching Strategy

**MUST cache:**

- User sessions in Redis
- Frequently accessed reference data (categories, currencies)
- Report data (with TTL of 5-15 minutes)
- API responses for read-heavy endpoints

### 11.2. Pagination

**MUST implement pagination:**

- Default page size: 20 items
- Maximum page size: 100 items
- Use cursor-based pagination for real-time data
- Include metadata (total, page, totalPages)

### 11.3. Response Time Targets

**MUST meet performance targets:**

- Simple queries: < 100ms
- Complex queries: < 500ms
- Report generation: < 2s
- File upload: < 5s (5MB)

---

## 📱 12. Feature-Specific Requirements

### 12.1. Transactions Module

**MUST implement:**

- CRUD operations for transactions
- Bulk import from CSV/Excel
- Receipt image upload (max 5MB, jpg/png)
- Transaction search and filtering
- Category-based aggregation
- Export to Excel/PDF
- Automatic account balance update

### 12.2. Accounts Module

**MUST implement:**

- Multiple account types (cash, bank, credit card, e-wallet)
- Balance tracking
- Transfer between accounts (atomic operation)
- Account balance history
- Currency support (VND, USD, etc.)

### 12.3. Budgets Module

**MUST implement:**

- Period-based budgets (daily, weekly, monthly, yearly)
- Category-specific budgets
- Budget progress calculation
- Alert when approaching/exceeding limit
- Budget rollover options
- Budget vs actual comparison

### 12.4. Loans Module

**MUST implement:**

- Amortization schedule generation
- Payment recording with principal/interest split
- Prepayment simulation (reduce term vs reduce payment)
- Interest calculation (monthly compound)
- Early payment penalty calculation
- Export payment schedule
- Automatic transaction creation on payment

### 12.5. Reports Module

**MUST implement:**

- Income vs Expense report (by period)
- Category distribution analysis
- Cash flow analysis
- Trend analysis (month-over-month)
- Account balance history
- Export to PDF/Excel
- Custom date range filtering

---

## 🔄 13. Error Handling Standards

### 13.1. Custom Exception Filters

**MUST implement custom exception filter:**

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    response.status(status).json({
      success: false,
      error: {
        message,
        code: this.getErrorCode(exception),
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 13.2. Custom Exceptions

**MUST create custom exceptions:**

```typescript
export class InsufficientBalanceException extends HttpException {
  constructor() {
    super('Insufficient account balance', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class DuplicateEmailException extends HttpException {
  constructor() {
    super('Email already exists', HttpStatus.CONFLICT);
  }
}
```

### 13.3. Validation Error Format

**MUST format validation errors:**

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "email must be a valid email"
      },
      {
        "field": "amount",
        "message": "amount must be a positive number"
      }
    ]
  }
}
```

---

## 📄 14. Documentation Standards

### 14.1. Swagger/OpenAPI

**MUST document all endpoints:**

```typescript
@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'Returns transactions', type: [TransactionResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @Get()
  getTransactions() {}
}
```

### 14.2. Code Documentation

**MUST document:**

- Complex business logic with JSDoc comments
- Public service methods
- Custom decorators and guards
- Utility functions
- Database schema decisions

### 14.3. README Documentation

**MUST include in README:**

- Project setup instructions
- Environment variables description
- Database setup and migrations
- Running the application
- Running tests
- API documentation URL
- Deployment instructions

---

## 🚢 15. Deployment Standards

### 15.1. Environment Configuration

**MUST support environments:**

- Development (local)
- Staging (pre-production)
- Production

**MUST use:**

- Environment-specific configuration files
- Docker for containerization
- docker-compose for local development
- Kubernetes or similar for production (optional)

### 15.2. Health Checks

**MUST implement health check endpoints:**

```typescript
@Get('health')
@ApiOperation({ summary: 'Health check' })
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

@Get('health/db')
async databaseHealth() {
  const isHealthy = await this.dataSource.query('SELECT 1');
  return {
    status: isHealthy ? 'ok' : 'error',
    database: 'PostgreSQL',
  };
}
```

### 15.3. Graceful Shutdown

**MUST implement:**

- Listen for SIGTERM and SIGINT signals
- Close database connections gracefully
- Complete pending requests before shutdown
- Timeout after 10 seconds

---

## 📋 16. Code Quality Standards

### 16.1. Code Style

**MUST follow:**

- Use ESLint with recommended NestJS rules
- Use Prettier for code formatting
- 2 spaces for indentation
- Single quotes for strings
- Semicolons at statement end
- Max line length: 120 characters

### 16.2. Naming Conventions

**MUST use:**

- PascalCase for classes: `UserService`, `TransactionController`
- camelCase for methods: `createUser()`, `getTransactions()`
- UPPER_SNAKE_CASE for constants: `MAX_FILE_SIZE`, `JWT_SECRET`
- Descriptive names: `getUserById()` not `get()`

### 16.3. TypeScript Standards

**MUST follow:**

- Use `interface` with `I` prefix: `IUser`, `ITransaction`
- Use `type` with `T` prefix: `TUserRole`, `TStatus`
- Use `enum` for fixed values: `TransactionType`, `AccountType`
- Enable strict mode in tsconfig
- Avoid `any` type (use `unknown` if needed)

---

## ⚠️ 17. Common Pitfalls to Avoid

### 17.1. DO NOT

- ❌ Use `synchronize: true` in production
- ❌ Return passwords in API responses
- ❌ Store plain text passwords
- ❌ Use `SELECT *` in queries
- ❌ Ignore database transactions for financial operations
- ❌ Hard-code configuration values
- ❌ Log sensitive data (passwords, tokens)
- ❌ Use global variables for request-scoped data
- ❌ Skip input validation
- ❌ Expose detailed error messages to clients in production

### 17.2. ALWAYS

- ✅ Validate and sanitize all inputs
- ✅ Use parameterized queries (TypeORM handles this)
- ✅ Implement proper error handling
- ✅ Use transactions for multi-step operations
- ✅ Hash passwords before storing
- ✅ Implement rate limiting
- ✅ Use environment variables for configuration
- ✅ Write tests for critical business logic
- ✅ Document API endpoints with Swagger
- ✅ Handle edge cases and errors gracefully

---

## 📋 18. Checklist Before Deployment

### 18.1. Code Quality

- [ ] All TypeScript errors resolved
- [ ] ESLint passes without errors
- [ ] All tests passing (unit + integration)
- [ ] Code coverage ≥ 80%
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed

### 18.2. Security

- [ ] Environment variables properly configured
- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens properly validated
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet middleware configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified

### 18.3. Database

- [ ] Migrations tested and verified
- [ ] Database indexes created
- [ ] Soft delete implemented
- [ ] Foreign key constraints defined
- [ ] Database backup strategy in place
- [ ] Connection pooling configured

### 18.4. Performance

- [ ] Pagination implemented on list endpoints
- [ ] Redis caching configured
- [ ] Query optimization completed
- [ ] N+1 query problems resolved
- [ ] Response times meet targets

### 18.5. Documentation

- [ ] Swagger documentation complete
- [ ] README.md updated
- [ ] Environment variables documented
- [ ] API endpoints tested and documented
- [ ] Deployment guide prepared

---

## 🎯 19. Success Criteria

**Backend is considered complete when:**

1. ✅ All API endpoints implemented per specification
2. ✅ Authentication and authorization working correctly
3. ✅ All database operations are transactional where needed
4. ✅ Test coverage ≥ 80%
5. ✅ API documentation complete (Swagger)
6. ✅ Performance targets met (response times)
7. ✅ Security measures implemented
8. ✅ Successfully integrated with Frontend
9. ✅ Production deployment successful

---

## 📞 20. Support & Communication

### 20.1. Frontend Integration

**When issues arise:**

1. Verify API specification in `docs/DD/03-API-SPECIFICATION.md`
2. Check request/response format
3. Validate authentication token
4. Review error logs
5. Update API documentation if changes made

### 20.2. Database Changes

**For schema modifications:**

1. Create migration file
2. Test migration and rollback
3. Update entity files
4. Update DTOs if needed
5. Notify team of breaking changes

### 20.3. Technical Decisions

**For architecture changes:**

1. Discuss with team lead
2. Document reasoning and alternatives
3. Update this document
4. Notify affected team members

---

**Version:** 1.0  
**Last Updated:** November 19, 2025  
**Maintained By:** Backend Development Team
