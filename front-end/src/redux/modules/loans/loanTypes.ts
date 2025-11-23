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
  principal: number; // Số tiền vay gốc
  interestRate: number; // Lãi suất % năm
  termMonths: number; // Kỳ hạn (tháng)
  startDate: string;
  monthlyPayment: number; // Trả hàng tháng
  totalInterest: number; // Tổng lãi phải trả
  totalPayment: number; // Tổng phải trả
  remainingBalance: number; // Số dư còn lại
  status: LoanStatus;
  description?: string;
  lender?: string; // Tên người/tổ chức cho vay
  createdAt: string;
  updatedAt: string;
}

export interface IAmortizationScheduleItem {
  month: number;
  payment: number; // Tiền trả tháng này
  principal: number; // Gốc
  interest: number; // Lãi
  balance: number; // Số dư còn lại
  date: string;
}

export interface ILoanPayment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  principal: number;
  interest: number;
  note?: string;
  createdAt: string;
}

// ==========================================
// PAYLOADS
// ==========================================

export interface ICreateLoanPayload {
  name: string;
  type: LoanType;
  principal: number;
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
}

export interface IDeleteLoanPayload {
  id: string;
}

export interface IRecordLoanPaymentPayload {
  loanId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}

export interface ISimulatePrepaymentPayload {
  loanId: string;
  prepaymentAmount: number;
  prepaymentDate: string;
}

export interface IPrepaymentSimulation {
  newRemainingBalance: number;
  newMonthlyPayment: number;
  newTermMonths: number;
  interestSaved: number;
  monthsSaved: number;
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
  loanPayments: ILoanPayment[];
  prepaymentSimulation: IPrepaymentSimulation | null;
  pagination: IPaginationState;
  isLoading: boolean;
  isFetchingSchedule: boolean;
  isFetchingPayments: boolean;
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
    simulate?: string;
  };
  filters: ILoanFilters;
  lastUpdated: string | null;
}

export const initialLoanState: ILoanState = {
  loans: [],
  currentLoan: null,
  amortizationSchedule: [],
  loanPayments: [],
  prepaymentSimulation: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  isLoading: false,
  isFetchingSchedule: false,
  isFetchingPayments: false,
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
export const selectLoanPayments = (state: { loans: ILoanState }) => state.loans.loanPayments;
export const selectPrepaymentSimulation = (state: { loans: ILoanState }) =>
  state.loans.prepaymentSimulation;
