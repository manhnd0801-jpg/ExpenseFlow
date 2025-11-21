/**
 * Core Type Definitions
 * All interfaces matching backend entities with I prefix
 */

import type {
  AccountType,
  BudgetPeriod,
  CategoryType,
  DebtStatus,
  DebtType,
  GoalStatus,
  NotificationType,
  ReminderType,
  TransactionType,
} from '@/constants/enums';

export type TId = string;
export type TTimestamp = string;

// Re-export TPaginatedResponse from api/common to avoid duplication
export type { TPaginatedResponse } from '../api/common';

export interface IUser {
  id: TId;
  email: string;
  name: string;
  avatar?: string;
  currency: string;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export interface IAccount {
  id: TId;
  userId: TId;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
}

export interface IAccountBalance {
  totalBalance: number;
  currency: string;
  accounts: IAccount[];
}

export interface ICreateAccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface IUpdateAccountRequest {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface ICategory {
  id: TId;
  userId: TId;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
}

export interface ICreateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
}

export interface ITransaction {
  id: TId;
  userId: TId;
  accountId: TId;
  categoryId: TId;
  type: TransactionType;
  amount: number;
  date: TTimestamp;
  note?: string;
  imageUrl?: string;
  eventId?: TId;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
  account?: IAccount;
  category?: ICategory;
}

export interface ITransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: TId;
  accountId?: TId;
  eventId?: TId;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ICreateTransactionRequest {
  accountId: TId;
  categoryId: TId;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
  imageUrl?: string;
  eventId?: TId;
}

export interface IUpdateTransactionRequest {
  accountId?: TId;
  categoryId?: TId;
  type?: TransactionType;
  amount?: number;
  date?: string;
  note?: string;
  imageUrl?: string;
  eventId?: TId;
}

export interface ITransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface IBudget {
  id: TId;
  userId: TId;
  categoryId: TId;
  amount: number;
  period: BudgetPeriod;
  startDate: TTimestamp;
  endDate: TTimestamp;
  spent?: number;
  remaining?: number;
  percentage?: number;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
  category?: ICategory;
}

export interface ICreateBudgetRequest {
  categoryId: TId;
  amount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface IUpdateBudgetRequest {
  categoryId?: TId;
  amount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
}

export interface IGoal {
  id: TId;
  userId: TId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: TTimestamp;
  status: GoalStatus;
  description?: string;
  icon?: string;
  color?: string;
  percentage?: number;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
}

export interface ICreateGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface IUpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  status?: GoalStatus;
  description?: string;
  icon?: string;
  color?: string;
}

export interface IContributeGoalRequest {
  amount: number;
}

export interface IDebt {
  id: TId;
  userId: TId;
  type: DebtType;
  personName: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  interestRate?: number;
  borrowedDate: TTimestamp;
  dueDate: TTimestamp;
  status: DebtStatus;
  note?: string;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
}

export interface IDebtPayment {
  id: TId;
  debtId: TId;
  amount: number;
  paymentDate: TTimestamp;
  note?: string;
  createdAt: TTimestamp;
}

export interface ICreateDebtRequest {
  type: DebtType;
  personName: string;
  amount: number;
  interestRate?: number;
  borrowedDate: string;
  dueDate: string;
  note?: string;
}

export interface IUpdateDebtRequest {
  personName?: string;
  amount?: number;
  interestRate?: number;
  borrowedDate?: string;
  dueDate?: string;
  status?: DebtStatus;
  note?: string;
}

export interface ICreateDebtPaymentRequest {
  amount: number;
  paymentDate?: string;
  note?: string;
}

export interface IEvent {
  id: TId;
  userId: TId;
  name: string;
  budget?: number;
  spent?: number;
  remaining?: number;
  startDate: TTimestamp;
  endDate: TTimestamp;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
}

export interface IEventSummary {
  event: IEvent;
  totalSpent: number;
  budget: number;
  remaining: number;
  transactionCount: number;
  transactions?: ITransaction[];
}

export interface ICreateEventRequest {
  name: string;
  budget?: number;
  startDate: string;
  endDate: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface IUpdateEventRequest {
  name?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface IReminder {
  id: TId;
  userId: TId;
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: TTimestamp;
  isRecurring: boolean;
  frequency?: number;
  isCompleted: boolean;
  completedAt?: TTimestamp;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
  deletedAt?: TTimestamp;
}

export interface ICreateReminderRequest {
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: string;
  isRecurring?: boolean;
  frequency?: number;
}

export interface IUpdateReminderRequest {
  type?: ReminderType;
  title?: string;
  description?: string;
  dueDate?: string;
  isRecurring?: boolean;
  frequency?: number;
  isCompleted?: boolean;
}

export interface INotification {
  id: TId;
  userId: TId;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: TTimestamp;
  actionUrl?: string;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export interface IUnreadNotificationCount {
  count: number;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

export interface IChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ============================================================
// REPORT TYPES
// ============================================================

export interface IIncomeExpenseReport {
  income: number;
  expense: number;
  balance: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ICategoryDistributionReport {
  categories: Array<{
    categoryId: number;
    categoryName: string;
    amount: number;
    percentage: number;
    transactionCount: number;
  }>;
  totalAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface IMonthlyTrendReport {
  months: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ICashFlowReport {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  byAccount: Array<{
    accountId: number;
    accountName: string;
    income: number;
    expense: number;
    netFlow: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ITopSpendingCategoryReport {
  categories: Array<{
    categoryId: number;
    categoryName: string;
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
  }>;
  limit: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface IFinancialSummaryReport {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  accountsCount: number;
  budgetsCount: number;
  goalsCount: number;
  debtsCount: number;
  topCategory: {
    categoryId: number;
    categoryName: string;
    amount: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}
