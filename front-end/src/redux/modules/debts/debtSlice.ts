/**
 * Debt Redux Slice
 */

import type { IDebt, IDebtPayment } from '@/types/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DebtsState {
  debts: IDebt[];
  currentDebt: IDebt | null;
  debtPayments: IDebtPayment[];
  loading: boolean;
  error: string | null;
}

const initialState: DebtsState = {
  debts: [],
  currentDebt: null,
  debtPayments: [],
  loading: false,
  error: null,
};

const debtsSlice = createSlice({
  name: 'debts',
  initialState,
  reducers: {
    // Fetch debts
    fetchDebtsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDebtsSuccess: (state, action: PayloadAction<IDebt[]>) => {
      state.debts = action.payload;
      state.loading = false;
    },
    fetchDebtsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create debt
    createDebtRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createDebtSuccess: (state, action: PayloadAction<IDebt>) => {
      state.debts.push(action.payload);
      state.loading = false;
    },
    createDebtFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update debt
    updateDebtRequest: (state, _action: PayloadAction<{ id: string; data: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateDebtSuccess: (state, action: PayloadAction<IDebt>) => {
      const index = state.debts.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) {
        state.debts[index] = action.payload;
      }
      state.loading = false;
    },
    updateDebtFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete debt
    deleteDebtRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteDebtSuccess: (state, action: PayloadAction<string>) => {
      state.debts = state.debts.filter((d) => d.id !== action.payload);
      state.loading = false;
    },
    deleteDebtFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch debt payments
    fetchDebtPaymentsRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchDebtPaymentsSuccess: (state, action: PayloadAction<IDebtPayment[]>) => {
      state.debtPayments = action.payload;
      state.loading = false;
    },
    fetchDebtPaymentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create debt payment
    createDebtPaymentRequest: (state, _action: PayloadAction<{ debtId: string; data: any }>) => {
      state.loading = true;
      state.error = null;
    },
    createDebtPaymentSuccess: (state, action: PayloadAction<IDebtPayment>) => {
      state.debtPayments.push(action.payload);
      state.loading = false;
    },
    createDebtPaymentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set current debt
    setCurrentDebt: (state, action: PayloadAction<IDebt | null>) => {
      state.currentDebt = action.payload;
    },
  },
});

export const {
  fetchDebtsRequest,
  fetchDebtsSuccess,
  fetchDebtsFailure,
  createDebtRequest,
  createDebtSuccess,
  createDebtFailure,
  updateDebtRequest,
  updateDebtSuccess,
  updateDebtFailure,
  deleteDebtRequest,
  deleteDebtSuccess,
  deleteDebtFailure,
  fetchDebtPaymentsRequest,
  fetchDebtPaymentsSuccess,
  fetchDebtPaymentsFailure,
  createDebtPaymentRequest,
  createDebtPaymentSuccess,
  createDebtPaymentFailure,
  setCurrentDebt,
} = debtsSlice.actions;

export default debtsSlice.reducer;
