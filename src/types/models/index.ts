/**
 * Domain Model Types
 */

/**
 * User model
 */
export interface IUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Account/Wallet model
 */
export interface IAccount {
  id: string;
  userId: string;
  name: string;
  type: number; // AccountType enum
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Category model
 */
export interface ICategory {
  id: string;
  userId: string;
  name: string;
  type: number; // CategoryType enum (1: Income, 2: Expense)
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction model
 */
export interface ITransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: number; // TransactionType enum
  note?: string;
  imageUrl?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Budget model
 */
export interface IBudget {
  id: string;
  userId: string;
  categoryId?: string;
  amount: number;
  period: number; // BudgetPeriod enum
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Goal model
 */
export interface IGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: number; // GoalStatus enum
  createdAt: string;
  updatedAt: string;
}

/**
 * Debt model
 */
export interface IDebt {
  id: string;
  userId: string;
  type: number; // DebtType enum (1: Lending, 2: Borrowing)
  personName: string;
  amount: number;
  interestRate?: number;
  borrowedDate: string;
  dueDate?: string;
  status: number; // DebtStatus enum
  createdAt: string;
  updatedAt: string;
}

/**
 * Debt Payment model
 */
export interface IDebtPayment {
  id: string;
  debtId: string;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Event model
 */
export interface IEvent {
  id: string;
  userId: string;
  name: string;
  description?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Loan model
 */
export interface ILoan {
  id: string;
  userId: string;
  accountId?: string;
  name: string;
  type: number; // LoanType enum
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: string;
  status: number; // LoanStatus enum
  createdAt: string;
  updatedAt: string;
}

/**
 * Loan Payment model
 */
export interface ILoanPayment {
  id: string;
  loanId: string;
  paymentNumber: number;
  paymentDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingBalance: number;
  status: number; // PaymentStatus enum
  isPrepayment: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Reminder model
 */
export interface IReminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: number; // ReminderType enum
  dueDate: string;
  frequency?: number; // ReminderFrequency enum
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification model
 */
export interface INotification {
  id: string;
  userId: string;
  type: number; // NotificationType enum
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared Book model
 */
export interface ISharedBook {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared Book Member model
 */
export interface ISharedBookMember {
  id: string;
  bookId: string;
  userId: string;
  role: number; // BookRole enum
  joinedAt: string;
  updatedAt: string;
}
