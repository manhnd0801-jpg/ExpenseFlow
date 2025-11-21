-- =============================================
-- ExpenseFlow Database - Quick Setup
-- Run this in pgAdmin Query Tool
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

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

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type SMALLINT NOT NULL CHECK (type IN (1, 2)),
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 5),
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    color VARCHAR(20),
    icon VARCHAR(50),
    description TEXT,
    "isExcludedFromTotal" BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    type SMALLINT NOT NULL CHECK (type IN (1, 2)),
    amount DECIMAL(15,2) NOT NULL,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    description TEXT,
    note TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringType" SMALLINT CHECK ("recurringType" >= 1 AND "recurringType" <= 4),
    "attachments" TEXT[],
    "eventId" UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("accountId") REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE RESTRICT
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    period SMALLINT NOT NULL CHECK (period >= 1 AND period <= 3),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "alertThreshold" INTEGER CHECK ("alertThreshold" >= 0 AND "alertThreshold" <= 100),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("categoryId") REFERENCES categories(id) ON DELETE CASCADE
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    "targetAmount" DECIMAL(15,2) NOT NULL,
    "currentAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    "targetDate" DATE NOT NULL,
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 4),
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Debts Table
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    type SMALLINT NOT NULL CHECK (type IN (1, 2)),
    "relatedPerson" VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    "dueDate" DATE,
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 3),
    description TEXT,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Debt Payments Table
CREATE TABLE IF NOT EXISTS debt_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "debtId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    "paymentDate" TIMESTAMP NOT NULL DEFAULT NOW(),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("debtId") REFERENCES debts(id) ON DELETE CASCADE,
    FOREIGN KEY ("accountId") REFERENCES accounts(id) ON DELETE CASCADE
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 5),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "estimatedBudget" DECIMAL(15,2),
    "actualSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency SMALLINT NOT NULL DEFAULT 1 CHECK (currency >= 1 AND currency <= 5),
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 4),
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type SMALLINT NOT NULL CHECK (type >= 1 AND type <= 4),
    "reminderDate" TIMESTAMP NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringType" SMALLINT CHECK ("recurringType" >= 1 AND "recurringType" <= 4),
    status SMALLINT NOT NULL DEFAULT 1 CHECK (status >= 1 AND status <= 3),
    "relatedEntityId" UUID,
    "relatedEntityType" VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user ON categories("userId");
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions("userId");
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets("userId");
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals("userId");
CREATE INDEX IF NOT EXISTS idx_debts_user ON debts("userId");
CREATE INDEX IF NOT EXISTS idx_events_user ON events("userId");
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders("userId");
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders("reminderDate");

-- Add foreign key for events in transactions
ALTER TABLE transactions 
ADD CONSTRAINT fk_transaction_event 
FOREIGN KEY ("eventId") REFERENCES events(id) ON DELETE SET NULL;

-- Success message
SELECT 'Database schema created successfully!' as message;
