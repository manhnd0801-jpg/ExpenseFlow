/**
 * API Request Types for all modules
 */

// ========== Auth Requests ==========
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
}

export interface IRefreshTokenRequest {
  refreshToken: string;
}

// ========== User Requests ==========
export interface IUpdateProfileRequest {
  fullName?: string;
  avatar?: string;
}

// ========== Account Requests ==========
export interface ICreateAccountRequest {
  name: string;
  type: number; // AccountType enum
  balance: number;
  currency: string;
}

export interface IUpdateAccountRequest {
  name?: string;
  type?: number;
  balance?: number;
  currency?: string;
}

// ========== Category Requests ==========
export interface ICreateCategoryRequest {
  name: string;
  type: number; // CategoryType enum
  icon?: string;
  color?: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  icon?: string;
  color?: string;
}

// ========== Transaction Requests ==========
export interface ICreateTransactionRequest {
  accountId: string;
  categoryId: string;
  amount: number;
  type: number; // TransactionType enum
  note?: string;
  date: string;
  eventId?: string;
  imageUrl?: string;
}

export interface IUpdateTransactionRequest {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  type?: number;
  note?: string;
  date?: string;
  eventId?: string;
  imageUrl?: string;
}

export interface ITransactionQueryParams {
  page?: number;
  limit?: number;
  type?: number;
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  eventId?: string;
  search?: string;
}

// ========== Budget Requests ==========
export interface ICreateBudgetRequest {
  categoryId?: string;
  amount: number;
  period: number; // BudgetPeriod enum
  startDate: string;
  endDate?: string;
}

export interface IUpdateBudgetRequest {
  categoryId?: string;
  amount?: number;
  period?: number;
  startDate?: string;
  endDate?: string;
}

export interface IBudgetProgressResponse {
  budgetId: string;
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  remainingAmount: number;
  remainingDays?: number;
}

// ========== Goal Requests ==========
export interface ICreateGoalRequest {
  name: string;
  targetAmount: number;
  deadline: string;
}

export interface IUpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  deadline?: string;
  status?: number;
}

export interface IContributeGoalRequest {
  amount: number;
  note?: string;
}

// ========== Debt Requests ==========
export interface ICreateDebtRequest {
  type: number; // DebtType enum
  personName: string;
  amount: number;
  interestRate?: number;
  borrowedDate: string;
  dueDate?: string;
}

export interface IUpdateDebtRequest {
  personName?: string;
  amount?: number;
  interestRate?: number;
  borrowedDate?: string;
  dueDate?: string;
  status?: number;
}

export interface IDebtPaymentRequest {
  amount: number;
  paymentDate: string;
  note?: string;
}

// ========== Event Requests ==========
export interface ICreateEventRequest {
  name: string;
  description?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
}

export interface IUpdateEventRequest {
  name?: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
}

// ========== Loan Requests ==========
export interface ICreateLoanRequest {
  accountId?: string;
  name: string;
  type: number; // LoanType enum
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
}

export interface IUpdateLoanRequest {
  accountId?: string;
  name?: string;
  type?: number;
  principalAmount?: number;
  interestRate?: number;
  termMonths?: number;
  startDate?: string;
  status?: number;
}

export interface ILoanPrepaymentRequest {
  amount: number;
  paymentDate: string;
  reduceTermMonths: boolean; // true = reduce term, false = reduce monthly payment
}

export interface ILoanScheduleResponse {
  loanId: string;
  schedule: Array<{
    paymentNumber: number;
    paymentDate: string;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    remainingBalance: number;
  }>;
}

// ========== Reminder Requests ==========
export interface ICreateReminderRequest {
  title: string;
  description?: string;
  type: number; // ReminderType enum
  dueDate: string;
  frequency?: number;
}

export interface IUpdateReminderRequest {
  title?: string;
  description?: string;
  type?: number;
  dueDate?: string;
  frequency?: number;
  isActive?: boolean;
}

// ========== Report Requests ==========
export interface IReportQueryParams {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  accountIds?: string[];
  type?: number;
}

export interface IDashboardReportResponse {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  totalAccounts: number;
  totalCategories: number;
  totalTransactions: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: number;
    categoryName: string;
    accountName: string;
    date: string;
    note?: string;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  categoryBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
    color?: string;
  }>;
}

export interface IIncomeExpenseReportResponse {
  period: string;
  income: number;
  expense: number;
  netAmount: number;
  transactionCount: number;
}

export interface ICategoryBreakdownResponse {
  categoryId: string;
  categoryName: string;
  type: number;
  amount: number;
  percentage: number;
  transactionCount: number;
  color?: string;
}

// ========== Export Requests ==========
export interface IExportRequest {
  format: 'pdf' | 'excel' | 'csv';
  startDate?: string;
  endDate?: string;
  includeAccounts?: string[];
  includeCategories?: string[];
}
