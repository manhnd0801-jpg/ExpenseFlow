# Expense Flow Backend

Personal Expense Management System - Backend API built with NestJS, PostgreSQL, and TypeORM.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: User registration, profile management, email verification
- **Account Management**: Multiple account types (cash, bank, credit card, e-wallet, investment)
- **Transaction Management**: Income, expense, and transfer transactions with receipt uploads
- **Category Management**: Customizable income/expense categories
- **Budget Management**: Period-based budgets with alerts and progress tracking
- **Goal Management**: Financial goals with progress tracking and auto-contribution
- **Debt Management**: Track lending/borrowing with payment schedules
- **Event Management**: Group transactions by events/projects
- **Reports & Analytics**: Comprehensive financial reports and insights
- **Reminders**: Payment and custom reminders with notifications

## 🛠️ Tech Stack

- **Framework**: NestJS 10+ with TypeScript
- **Database**: PostgreSQL 15+ with TypeORM
- **Cache**: Redis for session management and caching
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, rate limiting

## 📁 Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/                      # Configuration files
│   ├── database.config.ts       # Database configuration
│   ├── jwt.config.ts            # JWT configuration
│   ├── redis.config.ts          # Redis configuration
│   ├── app.config.ts            # App configuration
│   └── environment.config.ts    # Environment validation
├── common/                      # Shared code
│   ├── constants/               # Enums, error codes, API routes
│   ├── decorators/              # Custom decorators
│   ├── guards/                  # Auth guards, role guards
│   ├── interceptors/            # Response, logging interceptors
│   ├── filters/                 # Exception filters
│   ├── pipes/                   # Validation pipes
│   └── utils/                   # Helper functions
├── entities/                    # TypeORM entities
├── modules/                     # Feature modules
│   ├── auth/                    # Authentication module
│   ├── users/                   # User management
│   ├── accounts/                # Account management
│   ├── transactions/            # Transaction management
│   ├── categories/              # Category management
│   ├── budgets/                 # Budget management
│   ├── goals/                   # Goal management
│   ├── debts/                   # Debt management
│   ├── events/                  # Event management
│   └── reports/                 # Reports and analytics
├── database/                    # Database related
│   ├── migrations/              # Database migrations
│   └── seeds/                   # Seed data
└── types/                       # TypeScript type definitions
```

## 🏗️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 6+

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd expense-flow-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=expense_management

   # JWT
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Database Setup**

   ```bash
   # Create database
   createdb expense_management

   # Run migrations
   npm run migration:run

   # Seed initial data (optional)
   npm run seed
   ```

### Development

```bash
# Development mode with watch
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

### Database Operations

```bash
# Generate new migration
npm run migration:generate -- -n MigrationName

# Create empty migration
npm run migration:create -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

Once the application is running, visit:

- **Swagger UI**: `http://localhost:3001/docs`
- **API Base URL**: `http://localhost:3001/api/v1`

### Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <your_jwt_token>
```

### Main API Endpoints

#### Authentication

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

#### Accounts

- `GET /api/v1/accounts` - Get user accounts
- `POST /api/v1/accounts` - Create account
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account

#### Transactions

- `GET /api/v1/transactions` - Get transactions
- `POST /api/v1/transactions` - Create transaction
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction

#### Budgets

- `GET /api/v1/budgets` - Get budgets
- `POST /api/v1/budgets` - Create budget
- `PUT /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget

## 🔧 Configuration

### Environment Variables

| Variable         | Description                          | Default            |
| ---------------- | ------------------------------------ | ------------------ |
| `NODE_ENV`       | Environment (development/production) | development        |
| `PORT`           | Server port                          | 3001               |
| `DB_HOST`        | Database host                        | localhost          |
| `DB_PORT`        | Database port                        | 5432               |
| `DB_USERNAME`    | Database username                    | postgres           |
| `DB_PASSWORD`    | Database password                    | -                  |
| `DB_DATABASE`    | Database name                        | expense_management |
| `JWT_SECRET`     | JWT secret key                       | -                  |
| `JWT_EXPIRES_IN` | JWT expiration time                  | 1h                 |
| `REDIS_HOST`     | Redis host                           | localhost          |
| `REDIS_PORT`     | Redis port                           | 6379               |

### Database Schema

The application uses integer-based enums stored as SMALLINT in PostgreSQL:

- **Account Types**: 1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment
- **Transaction Types**: 1=Income, 2=Expense, 3=Transfer
- **Category Types**: 1=Income, 2=Expense
- **Budget Periods**: 1=Daily, 2=Weekly, 3=Monthly, 4=Quarterly, 5=Yearly, 6=Custom
- **Goal Status**: 1=Active, 2=Completed, 3=Cancelled
- **Debt Status**: 1=Active, 2=Paid, 3=Partial, 4=Overdue

## 🔒 Security

- **HTTPS**: All connections in production
- **JWT**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Configurable request limits
- **CORS**: Configurable cross-origin policies
- **Input Validation**: Comprehensive validation and sanitization
- **Security Headers**: Helmet middleware for security headers

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t expense-flow-backend .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment

1. Build the application
2. Set production environment variables
3. Run database migrations
4. Start the application with PM2 or similar process manager

## 🧪 Development Guidelines

### Code Standards

- Use TypeScript strict mode
- Follow NestJS conventions and patterns
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for all modules
- Document all API endpoints with Swagger

### Git Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests
4. Create pull request
5. Code review and merge

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email [your-email] or create an issue in the repository.

---

Built with ❤️ using NestJS and TypeScript
