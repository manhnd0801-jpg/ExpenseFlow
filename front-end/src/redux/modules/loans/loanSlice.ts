/**
 * Loan Redux Slice
 * Manages loan state with reducers for list, create, update, delete, payments, schedule operations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IAmortizationScheduleItem,
  ICreateLoanPayload,
  IDeleteLoanPayload,
  ILoan,
  ILoanListQuery,
  ILoanPayment,
  initialLoanState,
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
      state.loans = loans;
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
      state.currentLoan = action.payload;
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
      state.loans.unshift(action.payload); // Add to beginning
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
      const index = state.loans.findIndex((loan) => loan.id === action.payload.id);
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
      if (state.currentLoan?.id === action.payload.id) {
        state.currentLoan = action.payload;
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
    // GET LOAN PAYMENTS
    // ==========================================
    getLoanPaymentsRequest: (state, _action: PayloadAction<string>) => {
      state.isFetchingPayments = true;
      state.errors.payment = undefined;
    },

    getLoanPaymentsSuccess: (state, action: PayloadAction<ILoanPayment[]>) => {
      state.loanPayments = action.payload;
      state.isFetchingPayments = false;
      state.errors.payment = undefined;
    },

    getLoanPaymentsFailure: (state, action: PayloadAction<string>) => {
      state.isFetchingPayments = false;
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
    // CLEAR/RESET
    // ==========================================
    clearLoanFilters: (state) => {
      state.filters = {};
    },

    clearCurrentLoan: (state) => {
      state.currentLoan = null;
      state.amortizationSchedule = [];
      state.loanPayments = [];
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
