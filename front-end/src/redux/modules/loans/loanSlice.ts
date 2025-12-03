/**
 * Loan Redux Slice
 * Manages loan state with reducers for list, create, update, delete, payments, schedule operations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IAmortizationScheduleItem,
  ICreateLoanPayload,
  IDeleteExtraPrincipalTransactionPayload,
  IDeleteLoanPayload,
  IDeleteLoanPaymentPayload,
  IExtraPrincipalPaymentPayload,
  IExtraPrincipalTransaction,
  ILoan,
  ILoanListQuery,
  initialLoanState,
  IPaymentScheduleWithStatus,
  IPrepaymentSimulation,
  IRecordLoanPaymentPayload,
  ISimulatePrepaymentPayload,
  IUpdateLoanPayload,
} from './loanTypes';

const loanSlice = createSlice({
  name: 'loans',
  initialState: initialLoanState,
  reducers: {
    // ==========================================
    // LIST LOANS
    // ==========================================
    listLoansRequest: (state, _action: PayloadAction<ILoanListQuery>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.list = undefined;
    },

    listLoansSuccess: (
      state,
      action: PayloadAction<{
        loans: ILoan[];
        total: number;
        page: number;
        limit: number;
      }>
    ) => {
      const { loans, total, page, limit } = action.payload;
      // Map backend response to include computed properties
      state.loans = loans.map((loan) => ({
        ...loan,
        remainingAmount: loan.remainingPrincipal,
        interestAmount: loan.totalInterestPaid,
        dueDate: loan.nextPaymentDate,
      }));
      state.pagination = {
        page,
        pageSize: limit,
        total,
      };
      state.isLoading = false;
      state.error = null;
      state.errors.list = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    listLoansFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.list = action.payload;
    },

    // ==========================================
    // GET LOAN DETAIL
    // ==========================================
    getLoanDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.detail = undefined;
    },

    getLoanDetailSuccess: (state, action: PayloadAction<ILoan>) => {
      // Map backend response to include computed properties
      state.currentLoan = {
        ...action.payload,
        remainingAmount: action.payload.remainingPrincipal,
        interestAmount: action.payload.totalInterestPaid,
        dueDate: action.payload.nextPaymentDate,
      };
      // Map payments from backend response to state
      state.loanPayments = action.payload.payments || [];
      state.isLoading = false;
      state.error = null;
      state.errors.detail = undefined;
    },

    getLoanDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.detail = action.payload;
    },

    // ==========================================
    // CREATE LOAN
    // ==========================================
    createLoanRequest: (state, _action: PayloadAction<ICreateLoanPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.create = undefined;
    },

    createLoanSuccess: (state, action: PayloadAction<ILoan>) => {
      const loanWithComputed = {
        ...action.payload,
        remainingAmount: action.payload.remainingPrincipal,
        interestAmount: action.payload.totalInterestPaid,
        dueDate: action.payload.nextPaymentDate,
      };
      state.loans.unshift(loanWithComputed); // Add to beginning
      state.isLoading = false;
      state.error = null;
      state.errors.create = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    createLoanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.create = action.payload;
    },

    // ==========================================
    // UPDATE LOAN
    // ==========================================
    updateLoanRequest: (state, _action: PayloadAction<IUpdateLoanPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.update = undefined;
    },

    updateLoanSuccess: (state, action: PayloadAction<ILoan>) => {
      const loanWithComputed = {
        ...action.payload,
        remainingAmount: action.payload.remainingPrincipal,
        interestAmount: action.payload.totalInterestPaid,
        dueDate: action.payload.nextPaymentDate,
      };
      const index = state.loans.findIndex((loan) => loan.id === loanWithComputed.id);
      if (index !== -1) {
        // Remove the updated item from its current position
        state.loans.splice(index, 1);
        // Add the updated item to the beginning (to match backend updatedAt DESC)
        state.loans.unshift(loanWithComputed);
      } else {
        // If item not found, add it to the beginning
        state.loans.unshift(loanWithComputed);
      }
      if (state.currentLoan?.id === loanWithComputed.id) {
        state.currentLoan = loanWithComputed;
      }
      state.isLoading = false;
      state.error = null;
      state.errors.update = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    updateLoanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.update = action.payload;
    },

    // ==========================================
    // DELETE LOAN
    // ==========================================
    deleteLoanRequest: (state, _action: PayloadAction<IDeleteLoanPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.delete = undefined;
    },

    deleteLoanSuccess: (state, action: PayloadAction<string>) => {
      state.loans = state.loans.filter((loan) => loan.id !== action.payload);
      if (state.currentLoan?.id === action.payload) {
        state.currentLoan = null;
      }
      state.isLoading = false;
      state.error = null;
      state.errors.delete = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    deleteLoanFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.delete = action.payload;
    },

    // ==========================================
    // GET AMORTIZATION SCHEDULE
    // ==========================================
    getAmortizationScheduleRequest: (state, _action: PayloadAction<string>) => {
      state.isFetchingSchedule = true;
      state.errors.schedule = undefined;
    },

    getAmortizationScheduleSuccess: (state, action: PayloadAction<IAmortizationScheduleItem[]>) => {
      state.amortizationSchedule = action.payload;
      state.isFetchingSchedule = false;
      state.errors.schedule = undefined;
    },

    getAmortizationScheduleFailure: (state, action: PayloadAction<string>) => {
      state.isFetchingSchedule = false;
      state.errors.schedule = action.payload;
    },

    // ==========================================
    // GET PAYMENT SCHEDULE WITH STATUS
    // ==========================================
    getPaymentScheduleWithStatusRequest: (state, _action: PayloadAction<string>) => {
      state.isFetchingPaymentSchedule = true;
      state.errors.paymentSchedule = undefined;
    },

    getPaymentScheduleWithStatusSuccess: (
      state,
      action: PayloadAction<IPaymentScheduleWithStatus[]>
    ) => {
      state.paymentScheduleWithStatus = action.payload;
      state.isFetchingPaymentSchedule = false;
      state.errors.paymentSchedule = undefined;
    },

    getPaymentScheduleWithStatusFailure: (state, action: PayloadAction<string>) => {
      state.isFetchingPaymentSchedule = false;
      state.errors.paymentSchedule = action.payload;
    },

    // ==========================================
    // RECORD LOAN PAYMENT
    // ==========================================
    recordLoanPaymentRequest: (state, _action: PayloadAction<IRecordLoanPaymentPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.payment = undefined;
    },

    recordLoanPaymentSuccess: (state, action: PayloadAction<ILoan>) => {
      // Update loan in list
      const index = state.loans.findIndex((loan) => loan.id === action.payload.id);
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
      // Update current loan
      if (state.currentLoan?.id === action.payload.id) {
        state.currentLoan = action.payload;
      }
      state.isLoading = false;
      state.error = null;
      state.errors.payment = undefined;
    },

    recordLoanPaymentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.payment = action.payload;
    },

    // ==========================================
    // DELETE LOAN PAYMENT
    // ==========================================
    deleteLoanPaymentRequest: (state, _action: PayloadAction<IDeleteLoanPaymentPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.payment = undefined;
    },

    deleteLoanPaymentSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
      state.errors.payment = undefined;
    },

    deleteLoanPaymentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.payment = action.payload;
    },

    // ==========================================
    // SIMULATE PREPAYMENT
    // ==========================================
    simulatePrepaymentRequest: (state, _action: PayloadAction<ISimulatePrepaymentPayload>) => {
      state.isSimulating = true;
      state.prepaymentSimulation = null;
      state.errors.simulate = undefined;
    },

    simulatePrepaymentSuccess: (state, action: PayloadAction<IPrepaymentSimulation>) => {
      state.prepaymentSimulation = action.payload;
      state.isSimulating = false;
      state.errors.simulate = undefined;
    },

    simulatePrepaymentFailure: (state, action: PayloadAction<string>) => {
      state.isSimulating = false;
      state.errors.simulate = action.payload;
    },

    // ==========================================
    // EXTRA PRINCIPAL PAYMENT
    // ==========================================
    extraPrincipalPaymentRequest: (
      state,
      _action: PayloadAction<IExtraPrincipalPaymentPayload>
    ) => {
      state.isLoading = true;
      state.errors.payment = undefined;
    },

    extraPrincipalPaymentSuccess: (state) => {
      state.isLoading = false;
      state.errors.payment = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    extraPrincipalPaymentFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.errors.payment = action.payload;
    },

    // ==========================================
    // GET EXTRA PRINCIPAL TRANSACTIONS
    // ==========================================
    getExtraPrincipalTransactionsRequest: (state, _action: PayloadAction<string>) => {
      state.isFetchingExtraPrincipal = true;
      state.errors.extraPrincipal = undefined;
    },

    getExtraPrincipalTransactionsSuccess: (
      state,
      action: PayloadAction<IExtraPrincipalTransaction[]>
    ) => {
      state.extraPrincipalTransactions = action.payload;
      state.isFetchingExtraPrincipal = false;
      state.errors.extraPrincipal = undefined;
    },

    getExtraPrincipalTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.isFetchingExtraPrincipal = false;
      state.errors.extraPrincipal = action.payload;
    },

    // ==========================================
    // DELETE EXTRA PRINCIPAL TRANSACTION
    // ==========================================
    deleteExtraPrincipalTransactionRequest: (
      state,
      _action: PayloadAction<IDeleteExtraPrincipalTransactionPayload>
    ) => {
      state.isLoading = true;
      state.errors.extraPrincipal = undefined;
    },

    deleteExtraPrincipalTransactionSuccess: (state) => {
      state.isLoading = false;
      state.errors.extraPrincipal = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    deleteExtraPrincipalTransactionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.errors.extraPrincipal = action.payload;
    },

    // ==========================================
    // CLEAR/RESET
    // ==========================================
    clearLoanFilters: (state) => {
      state.filters = {};
    },

    clearCurrentLoan: (state) => {
      state.currentLoan = null;
      state.amortizationSchedule = [];
      state.paymentScheduleWithStatus = [];
      state.loanPayments = [];
      state.extraPrincipalTransactions = [];
      state.prepaymentSimulation = null;
    },

    clearLoanErrors: (state) => {
      state.error = null;
      state.errors = {};
    },
  },
});

export const loanActions = loanSlice.actions;
export default loanSlice.reducer;
