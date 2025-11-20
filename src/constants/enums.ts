/**
 * Enum Constants - MUST match backend enum values exactly
 * ⭐ These enums use INTEGER values (1, 2, 3...) matching database SMALLINT columns
 */

// Account Types
export enum AccountType {
  CASH = 1,
  BANK = 2,
  CREDIT_CARD = 3,
  DIGITAL_WALLET = 4,
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

// Goal Type
export enum GoalType {
  SAVING = 1,
  PURCHASE = 2,
  INVESTMENT = 3,
  DEBT_PAYOFF = 4,
  EMERGENCY = 5,
  OTHER = 6,
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
  COMPLETED = 3,
  OVERDUE = 4,
}

// Loan Types
export enum LoanType {
  PERSONAL = 1,
  HOME = 2,
  AUTO = 3,
  EDUCATIONAL = 4,
  OTHER = 5,
}

// Loan Status
export enum LoanStatus {
  ACTIVE = 1,
  COMPLETED = 2,
  DEFAULTED = 3,
  REFINANCED = 4,
}

// Payment Status
export enum PaymentStatus {
  PENDING = 1,
  COMPLETED = 2,
  FAILED = 3,
  SKIPPED = 4,
}

// Reminder Types
export enum ReminderType {
  PAYMENT = 1,
  BUDGET = 2,
  DEBT = 3,
  CUSTOM = 4,
}

// Book Roles (for shared books)
export enum BookRole {
  VIEWER = 1,
  EDITOR = 2,
  ADMIN = 3,
}

// Notification Types
export enum NotificationType {
  BUDGET_ALERT = 1,
  PAYMENT_DUE = 2,
  DEBT_REMINDER = 3,
  GOAL_MILESTONE = 4,
  SYSTEM = 5,
}

// Event Type
export enum EventType {
  TRAVEL = 1,
  EDUCATION = 2,
  HEALTH = 3,
  PERSONAL = 4,
  PURCHASE = 5,
  OTHER = 6,
}

// Event Status
export enum EventStatus {
  PLANNING = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}
