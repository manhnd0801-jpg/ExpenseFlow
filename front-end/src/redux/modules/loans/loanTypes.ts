/**
 * Loan Redux Types
 * Types, interfaces, and initial state for loan management
 */

import { IPaginationState } from '@/hooks';

// ==========================================
// ENUMS
// ==========================================

export enum LoanStatus {
  ACTIVE = 1,
  PAID_OFF = 2,
  DEFAULTED = 3,
}

export enum LoanType {
  PERSONAL = 1,
  MORTGAGE = 2,
  AUTO = 3,
  STUDENT = 4,
  BUSINESS = 5,
  OTHER = 6,
}

// ==========================================
// INTERFACES
// ==========================================

export interface ILoan {
  id: string;
  userId: string;
  name: string;
  type: LoanType;
  lender?: string;
  // Backend field names
  originalAmount: number; // Total loan amount
  remainingPrincipal: number; // Remaining principal to pay
  interestRate: number; // Annual interest rate percentage
  termMonths: number; // Total loan term in months
  remainingMonths: number; // Remaining months to pay
  monthlyPayment: number; // Monthly payment amount
  startDate: string;
  accountId?: string; // Account that received loan disbursement (if disbursed)
  disbursementDate?: string; // Date when loan was actually disbursed
  nextPaymentDate: string;
  lastPaymentDate?: string;
  status: LoanStatus;
  totalInterestPaid: number; // Total interest paid
  totalPrincipalPaid: number; // Total principal paid
  totalPrepayment: number;
  description?: string;
  notes?: string;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Relations from backend
  payments?: ILoanPayment[]; // Payment history from backend
  // Computed properties for UI compatibility
  remainingAmount: number; // Alias for remainingPrincipal
  interestAmount: number; // Alias for totalInterestPaid
  dueDate: string; // Alias for nextPaymentDate
}

export interface IAmortizationScheduleItem {
  month: number;
  payment: number; // Tiền trả tháng này
  principal: number; // Gốc
  interest: number; // Lãi
  balance: number; // Số dư còn lại
  date: string;
}

export interface IPaymentScheduleWithStatus extends IAmortizationScheduleItem {
  isPaid: boolean;
  status: 'paid' | 'unpaid';
  actualPaymentDate: string | null;
  actualAmount: number | null;
  paymentId: string | null;
  note: string | null;
}

export interface ILoanPayment {
  id: string;
  loanId: string;
  paymentNumber?: number | null;
  paymentDate: string;
  dueDate?: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  prepaymentAmount?: number;
  remainingPrincipal?: number;
  status?: number;
  isPrepayment?: boolean;
  isScheduled?: boolean;
  note?: string;
  transactionId?: string | null;
  createdAt: string;
}

export interface IExtraPrincipalTransaction {
  id: string;
  amount: number;
  date: string;
  note?: string;
  description?: string;
  accountId: string;
  accountName?: string;
  categoryId: string;
  categoryName?: string;
  createdAt: string;
}

// ==========================================
// PAYLOADS
// ==========================================

export interface ICreateLoanPayload {
  accountId?: string; // Account to deposit loan amount
  name: string;
  type: LoanType;
  originalAmount: number; // Changed from 'principal' to match backend
  interestRate: number;
  termMonths: number;
  startDate: string;
  description?: string;
  lender?: string;
}

export interface IUpdateLoanPayload {
  id: string;
  name?: string;
  description?: string;
  lender?: string;
  status?: LoanStatus;
  accountId?: string; // Account to deposit loan amount
}

export interface IDeleteLoanPayload {
  id: string;
}

export interface IDeleteLoanPaymentPayload {
  loanId: string;
  paymentId: string;
}

export interface IRecordLoanPaymentPayload {
  loanId: string;
  accountId: string;
  amount: number;
  paymentDate: string;
  note?: string;
  // Category selection (hybrid approach)
  categoryId?: string; // Common category for both principal and interest
  principalCategoryId?: string; // Specific category for principal payment
  interestCategoryId?: string; // Specific category for interest payment
  // Removed: prepaymentAmount (only scheduled payment allowed)
}

export interface ISimulatePrepaymentPayload {
  loanId: string;
  prepaymentAmount: number;
  prepaymentDate: string;
  strategy?: 'reduce_term' | 'reduce_payment'; // Optional, will be passed to backend
}

export interface IExtraPrincipalPaymentPayload {
  loanId: string;
  amount: number;
  paymentDate: string;
  accountId: string;
  categoryId?: string;
  note?: string;
  // Removed: strategy (always reduces monthly payment, keeps term unchanged)
}

export interface IDeleteExtraPrincipalTransactionPayload {
  loanId: string;
  transactionId: string;
}

export interface IPrepaymentSimulation {
  newRemainingBalance: number; // For backward compatibility
  newMonthlyPayment: number;
  newTermMonths: number;
  interestSaved: number;
  monthsSaved: number;
  // New fields from backend
  originalTermMonths: number;
  originalMonthlyPayment: number;
  totalInterestSaved: number;
  originalTotalInterest: number;
  newTotalInterest: number;
  newSchedule?: IAmortizationScheduleItem[];
}

// ==========================================
// QUERY PARAMS
// ==========================================

export interface ILoanListQuery {
  page?: number;
  limit?: number;
  status?: LoanStatus;
  type?: LoanType;
  search?: string;
}

export interface ILoanFilters {
  status?: LoanStatus;
  type?: LoanType;
  search?: string;
}

// ==========================================
// STATE
// ==========================================

export interface ILoanState {
  loans: ILoan[];
  currentLoan: ILoan | null;
  amortizationSchedule: IAmortizationScheduleItem[];
  paymentScheduleWithStatus: IPaymentScheduleWithStatus[];
  loanPayments: ILoanPayment[];
  extraPrincipalTransactions: IExtraPrincipalTransaction[];
  prepaymentSimulation: IPrepaymentSimulation | null;
  pagination: IPaginationState;
  isLoading: boolean;
  isFetchingSchedule: boolean;
  isFetchingPaymentSchedule: boolean;
  isFetchingPayments: boolean;
  isFetchingExtraPrincipal: boolean;
  isSimulating: boolean;
  error: string | null;
  errors: {
    list?: string;
    detail?: string;
    create?: string;
    update?: string;
    delete?: string;
    payment?: string;
    schedule?: string;
    paymentSchedule?: string;
    simulate?: string;
    extraPrincipal?: string;
  };
  filters: ILoanFilters;
  lastUpdated: string | null;
}

export const initialLoanState: ILoanState = {
  loans: [],
  currentLoan: null,
  amortizationSchedule: [],
  paymentScheduleWithStatus: [],
  loanPayments: [],
  extraPrincipalTransactions: [],
  prepaymentSimulation: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  isLoading: false,
  isFetchingSchedule: false,
  isFetchingPaymentSchedule: false,
  isFetchingPayments: false,
  isFetchingExtraPrincipal: false,
  isSimulating: false,
  error: null,
  errors: {},
  filters: {},
  lastUpdated: null,
};

// ==========================================
// SELECTORS HELPERS
// ==========================================

export const selectIsLoanLoading = (state: { loans: ILoanState }) => state.loans.isLoading;
export const selectLoanError = (state: { loans: ILoanState }) => state.loans.error;
export const selectLoanPagination = (state: { loans: ILoanState }) => state.loans.pagination;
export const selectCurrentLoan = (state: { loans: ILoanState }) => state.loans.currentLoan;
export const selectAmortizationSchedule = (state: { loans: ILoanState }) =>
  state.loans.amortizationSchedule;
export const selectPaymentScheduleWithStatus = (state: { loans: ILoanState }) =>
  state.loans.paymentScheduleWithStatus;
export const selectLoanPayments = (state: { loans: ILoanState }) => state.loans.loanPayments;
export const selectExtraPrincipalTransactions = (state: { loans: ILoanState }) =>
  state.loans.extraPrincipalTransactions;
export const selectPrepaymentSimulation = (state: { loans: ILoanState }) =>
  state.loans.prepaymentSimulation;
