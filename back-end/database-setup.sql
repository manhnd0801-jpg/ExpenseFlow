-- =============================================
-- ExpenseFlow Database Setup Script
-- PostgreSQL Database Creation
-- =============================================

-- Step 1: Create Database (Run this in PostgreSQL as postgres user)
-- DROP DATABASE IF EXISTS expense_management; -- Uncomment to reset
CREATE DATABASE expense_management
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Connect to the database
\c expense_management;

-- Step 2: Create UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Set Timezone
SET timezone = 'UTC';

-- =============================================
-- MANUAL SCHEMA CREATION (If not using TypeORM sync)
-- =============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    avatar VARCHAR(255),
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 4),
    "defaultCurrency" SMALLINT NOT NULL DEFAULT 1 CHECK ("defaultCurrency" >= 1 AND "defaultCurrency" <= 5),
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    timezone VARCHAR(50),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" VARCHAR(255),
    "passwordResetToken" VARCHAR(255),
    "passwordResetExpires" TIMESTAMP,
    "lastLoginAt" TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

COMMENT ON COLUMN users.status IS '1=Active, 2=Inactive, 3=Suspended, 4=Deleted';
COMMENT ON COLUMN users."defaultCurrency" IS '1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY';

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 5),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    "bankName" VARCHAR(255),
    "accountNumber" VARCHAR(50),
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "includeInTotal" BOOLEAN NOT NULL DEFAULT true,
    "creditLimit" DECIMAL(15,2),
    "interestRate" DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON COLUMN accounts.type IS '1=Cash, 2=Bank, 3=Credit Card, 4=E-Wallet, 5=Investment';
COMMENT ON COLUMN accounts.currency IS '1=VND, 2=USD, 3=EUR, 4=JPY, 5=CNY';

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    parent_id UUID,
    name VARCHAR(255) NOT NULL,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 2),
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    keywords JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

COMMENT ON COLUMN categories.type IS '1=Income, 2=Expense';

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_deleted_at ON categories(deleted_at);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    budget DECIMAL(15,2),
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    description TEXT,
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 4),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON COLUMN events.status IS '1=Planned, 2=Active, 3=Completed, 4=Cancelled';

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_date ON events("startDate");
CREATE INDEX idx_events_deleted_at ON events(deleted_at);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    account_id UUID NOT NULL,
    to_account_id UUID,
    category_id UUID,
    event_id UUID,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 3),
    amount DECIMAL(15,2) NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(500),
    note TEXT,
    "receiptImage" VARCHAR(255),
    location VARCHAR(255),
    reference VARCHAR(100),
    tags JSONB,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    recurring_id UUID,
    "exchangeRate" DECIMAL(15,2),
    "originalCurrency" VARCHAR(3),
    "originalAmount" DECIMAL(15,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

COMMENT ON COLUMN transactions.type IS '1=Income, 2=Expense, 3=Transfer';

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category_id UUID,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    period SMALLINT NOT NULL CHECK (period >= 1 AND period <= 6),
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "alertThreshold" DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

COMMENT ON COLUMN budgets.period IS '1=Daily, 2=Weekly, 3=Monthly, 4=Quarterly, 5=Yearly, 6=Custom';

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_deleted_at ON budgets(deleted_at);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    "targetAmount" DECIMAL(15,2) NOT NULL,
    "currentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    deadline DATE,
    description TEXT,
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 3),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON COLUMN goals.status IS '1=Active, 2=Completed, 3=Cancelled';

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_deleted_at ON goals(deleted_at);

-- Debts Table
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 2),
    "personName" VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    "remainingAmount" DECIMAL(15,2) NOT NULL,
    "interestRate" DECIMAL(5,2),
    "borrowedDate" DATE NOT NULL,
    "dueDate" DATE,
    description TEXT,
    "contactInfo" VARCHAR(255),
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 4),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON COLUMN debts.type IS '1=Lending, 2=Borrowing';
COMMENT ON COLUMN debts.status IS '1=Active, 2=Paid, 3=Partial, 4=Overdue';

CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_type ON debts(type);
CREATE INDEX idx_debts_status ON debts(status);
CREATE INDEX idx_debts_deleted_at ON debts(deleted_at);

-- Debt Payments Table
CREATE TABLE IF NOT EXISTS debt_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    "paymentDate" DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE
);

CREATE INDEX idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_payment_date ON debt_payments("paymentDate");

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 4),
    "dueDate" TIMESTAMP NOT NULL,
    frequency SMALLINT CHECK (frequency >= 1 AND frequency <= 4),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSentAt" TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON COLUMN reminders.type IS '1=Payment, 2=Budget, 3=Goal, 4=Custom';
COMMENT ON COLUMN reminders.frequency IS '1=Once, 2=Daily, 3=Weekly, 4=Monthly';

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_due_date ON reminders("dueDate");
CREATE INDEX idx_reminders_deleted_at ON reminders(deleted_at);

-- =============================================
-- SEED DEFAULT CATEGORIES
-- =============================================

-- Default Expense Categories
INSERT INTO categories (id, user_id, name, type, icon, color, "isDefault", "isActive")
VALUES 
    (uuid_generate_v4(), NULL, 'Food & Dining', 2, 'utensils', '#FF6B6B', true, true),
    (uuid_generate_v4(), NULL, 'Transportation', 2, 'car', '#4ECDC4', true, true),
    (uuid_generate_v4(), NULL, 'Shopping', 2, 'shopping-bag', '#95E1D3', true, true),
    (uuid_generate_v4(), NULL, 'Entertainment', 2, 'film', '#F38181', true, true),
    (uuid_generate_v4(), NULL, 'Bills & Utilities', 2, 'file-text', '#AA96DA', true, true),
    (uuid_generate_v4(), NULL, 'Healthcare', 2, 'heart', '#FCBAD3', true, true),
    (uuid_generate_v4(), NULL, 'Education', 2, 'book', '#A8D8EA', true, true),
    (uuid_generate_v4(), NULL, 'Other Expenses', 2, 'more-horizontal', '#D3D3D3', true, true);

-- Default Income Categories
INSERT INTO categories (id, user_id, name, type, icon, color, "isDefault", "isActive")
VALUES 
    (uuid_generate_v4(), NULL, 'Salary', 1, 'briefcase', '#51CF66', true, true),
    (uuid_generate_v4(), NULL, 'Bonus', 1, 'gift', '#FFD93D', true, true),
    (uuid_generate_v4(), NULL, 'Investment', 1, 'trending-up', '#6BCF7F', true, true),
    (uuid_generate_v4(), NULL, 'Side Income', 1, 'dollar-sign', '#A8E6CF', true, true),
    (uuid_generate_v4(), NULL, 'Other Income', 1, 'plus-circle', '#B4E197', true, true);

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
SELECT 'Database schema created successfully!' AS status;
