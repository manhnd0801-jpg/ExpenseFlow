/**
 * Budget Redux Slice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IBudget, IBudgetProgressResponse } from '../../../types';
import type {
  IBudgetState,
  ICreateBudgetPayload,
  IDeleteBudgetPayload,
  IFetchBudgetProgressPayload,
  IFetchBudgetsPayload,
  IUpdateBudgetPayload,
} from './budgetTypes';

const initialState: IBudgetState = {
  budgets: [],
  budgetProgress: {},
  selectedBudget: null,
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    // Fetch budgets
    fetchBudgetsStart: (state, _action: PayloadAction<IFetchBudgetsPayload>) => {
      state.loading = true;
      state.error = null;
    },
    fetchBudgetsSuccess: (state, action: PayloadAction<IBudget[]>) => {
      state.loading = false;
      state.budgets = action.payload;
      state.error = null;
    },
    fetchBudgetsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create budget
    createBudgetStart: (state, _action: PayloadAction<ICreateBudgetPayload>) => {
      state.loading = true;
      state.error = null;
    },
    createBudgetSuccess: (state, action: PayloadAction<IBudget>) => {
      state.loading = false;
      state.budgets.push(action.payload);
      state.error = null;
    },
    createBudgetFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update budget
    updateBudgetStart: (state, _action: PayloadAction<IUpdateBudgetPayload>) => {
      state.loading = true;
      state.error = null;
    },
    updateBudgetSuccess: (state, action: PayloadAction<IBudget>) => {
      state.loading = false;
      const index = state.budgets.findIndex((budget) => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
      }
      if (state.selectedBudget?.id === action.payload.id) {
        state.selectedBudget = action.payload;
      }
      state.error = null;
    },
    updateBudgetFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete budget
    deleteBudgetStart: (state, _action: PayloadAction<IDeleteBudgetPayload>) => {
      state.loading = true;
      state.error = null;
    },
    deleteBudgetSuccess: (state, action: PayloadAction<{ id: string }>) => {
      state.loading = false;
      state.budgets = state.budgets.filter((budget) => budget.id !== action.payload.id);
      if (state.selectedBudget?.id === action.payload.id) {
        state.selectedBudget = null;
      }
      // Remove progress data for deleted budget
      delete state.budgetProgress[action.payload.id];
      state.error = null;
    },
    deleteBudgetFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch budget progress
    fetchBudgetProgressStart: (state, _action: PayloadAction<IFetchBudgetProgressPayload>) => {
      state.loading = true;
      state.error = null;
    },
    fetchBudgetProgressSuccess: (state, action: PayloadAction<IBudgetProgressResponse>) => {
      state.loading = false;
      state.budgetProgress[action.payload.budgetId] = action.payload;
      state.error = null;
    },
    fetchBudgetProgressFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set selected budget
    setSelectedBudget: (state, action: PayloadAction<IBudget | null>) => {
      state.selectedBudget = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetBudgetState: () => initialState,
  },
});

export const {
  fetchBudgetsStart,
  fetchBudgetsSuccess,
  fetchBudgetsFailure,
  createBudgetStart,
  createBudgetSuccess,
  createBudgetFailure,
  updateBudgetStart,
  updateBudgetSuccess,
  updateBudgetFailure,
  deleteBudgetStart,
  deleteBudgetSuccess,
  deleteBudgetFailure,
  fetchBudgetProgressStart,
  fetchBudgetProgressSuccess,
  fetchBudgetProgressFailure,
  setSelectedBudget,
  clearError,
  resetBudgetState,
} = budgetSlice.actions;

// Named exports for consistency with other modules
export const budgetActions = budgetSlice.actions;
export const budgetReducer = budgetSlice.reducer;

export default budgetSlice.reducer;
