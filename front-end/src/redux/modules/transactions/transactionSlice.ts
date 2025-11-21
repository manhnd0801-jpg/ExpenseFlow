/**
 * Transaction Redux Slice
 * Manages transaction state with reducers for list, create, update, delete operations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ICreateTransactionPayload,
  IDeleteTransactionPayload,
  initialTransactionState,
  ITransaction,
  ITransactionFilters,
  IUpdateTransactionPayload,
} from './transactionTypes';

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: initialTransactionState,
  reducers: {
    // ==========================================
    // LIST TRANSACTIONS
    // ==========================================
    listTransactionsRequest: (state, _action: PayloadAction<ITransactionFilters>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.list = undefined;
    },

    listTransactionsSuccess: (
      state,
      action: PayloadAction<{
        transactions: ITransaction[];
        total: number;
        page: number;
        limit: number;
      }>
    ) => {
      const { transactions, total, page, limit } = action.payload;
      state.transactions = transactions;
      state.pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
      state.isLoading = false;
      state.error = null;
      state.errors.list = undefined;
    },

    listTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.list = action.payload;
    },

    // ==========================================
    // CREATE TRANSACTION
    // ==========================================
    createTransactionRequest: (state, _action: PayloadAction<ICreateTransactionPayload>) => {
      state.isCreating = true;
      state.error = null;
      state.errors.create = undefined;
      state.successMessage = null;
    },

    createTransactionSuccess: (state, action: PayloadAction<ITransaction>) => {
      state.transactions.unshift(action.payload);
      state.pagination.total += 1;
      state.isCreating = false;
      state.error = null;
      state.errors.create = undefined;
      state.successMessage = 'Transaction created successfully';
    },

    createTransactionFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false;
      state.error = action.payload;
      state.errors.create = action.payload;
    },

    // ==========================================
    // UPDATE TRANSACTION
    // ==========================================
    updateTransactionRequest: (state, _action: PayloadAction<IUpdateTransactionPayload>) => {
      state.isUpdating = true;
      state.error = null;
      state.errors.update = undefined;
      state.successMessage = null;
    },

    updateTransactionSuccess: (state, action: PayloadAction<ITransaction>) => {
      const index = state.transactions.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
      if (state.currentTransaction?.id === action.payload.id) {
        state.currentTransaction = action.payload;
      }
      state.isUpdating = false;
      state.error = null;
      state.errors.update = undefined;
      state.successMessage = 'Transaction updated successfully';
    },

    updateTransactionFailure: (state, action: PayloadAction<string>) => {
      state.isUpdating = false;
      state.error = action.payload;
      state.errors.update = action.payload;
    },

    // ==========================================
    // DELETE TRANSACTION
    // ==========================================
    deleteTransactionRequest: (state, _action: PayloadAction<IDeleteTransactionPayload>) => {
      state.isDeleting = true;
      state.error = null;
      state.errors.delete = undefined;
      state.successMessage = null;
    },

    deleteTransactionSuccess: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter((t) => t.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.currentTransaction?.id === action.payload) {
        state.currentTransaction = null;
      }
      state.isDeleting = false;
      state.error = null;
      state.errors.delete = undefined;
      state.successMessage = 'Transaction deleted successfully';
    },

    deleteTransactionFailure: (state, action: PayloadAction<string>) => {
      state.isDeleting = false;
      state.error = action.payload;
      state.errors.delete = action.payload;
    },

    // ==========================================
    // GET SINGLE TRANSACTION
    // ==========================================
    getTransactionRequest: (state, _action: PayloadAction<string>) => {
      state.isFetching = true;
      state.error = null;
    },

    getTransactionSuccess: (state, action: PayloadAction<ITransaction>) => {
      state.currentTransaction = action.payload;
      state.isFetching = false;
      state.error = null;
    },

    getTransactionFailure: (state, action: PayloadAction<string>) => {
      state.isFetching = false;
      state.error = action.payload;
    },

    // ==========================================
    // SET FILTERS
    // ==========================================
    setTransactionFilters: (state, action: PayloadAction<ITransactionFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1; // Reset to first page when filters change
    },

    clearTransactionFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },

    // ==========================================
    // PAGINATION
    // ==========================================
    setTransactionPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    setTransactionPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1;
    },

    // ==========================================
    // CLEAR STATE
    // ==========================================
    clearTransactionError: (state) => {
      state.error = null;
      state.errors = {};
    },

    clearTransactionSuccess: (state) => {
      state.successMessage = null;
    },

    clearTransactionState: () => {
      return initialTransactionState;
    },
  },
});

export const transactionActions = transactionSlice.actions;
export default transactionSlice.reducer;
