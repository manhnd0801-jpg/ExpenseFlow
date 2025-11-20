/**
 * Account Redux Slice
 * Manages account state with reducers for list, create, update, delete operations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IAccount,
  IAccountFilters,
  ICreateAccountPayload,
  IDeleteAccountPayload,
  initialAccountState,
  IUpdateAccountPayload,
} from './accountTypes';

const accountSlice = createSlice({
  name: 'accounts',
  initialState: initialAccountState,
  reducers: {
    // ==========================================
    // LIST ACCOUNTS
    // ==========================================
    listAccountsRequest: (state, _action: PayloadAction<IAccountFilters>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.list = undefined;
    },

    listAccountsSuccess: (
      state,
      action: PayloadAction<{
        accounts: IAccount[];
        total: number;
        page: number;
        pageSize: number;
      }>
    ) => {
      const { accounts, total, page, pageSize } = action.payload;
      state.accounts = accounts;
      state.pagination = {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      };
      state.isLoading = false;
      state.error = null;
      state.errors.list = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    listAccountsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.list = action.payload;
    },

    // ==========================================
    // CREATE ACCOUNT
    // ==========================================
    createAccountRequest: (state, _action: PayloadAction<ICreateAccountPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.create = undefined;
    },

    createAccountSuccess: (state, action: PayloadAction<IAccount>) => {
      state.accounts.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
      state.errors.create = undefined;
    },

    createAccountFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.create = action.payload;
    },

    // ==========================================
    // UPDATE ACCOUNT
    // ==========================================
    updateAccountRequest: (state, _action: PayloadAction<IUpdateAccountPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.update = undefined;
    },

    updateAccountSuccess: (state, action: PayloadAction<IAccount>) => {
      const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
      if (index > -1) {
        state.accounts[index] = action.payload;
      }
      state.isLoading = false;
      state.error = null;
      state.errors.update = undefined;
    },

    updateAccountFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.update = action.payload;
    },

    // ==========================================
    // DELETE ACCOUNT
    // ==========================================
    deleteAccountRequest: (state, _action: PayloadAction<IDeleteAccountPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.delete = undefined;
    },

    deleteAccountSuccess: (state, action: PayloadAction<{ id: string }>) => {
      state.accounts = state.accounts.filter((acc) => acc.id !== action.payload.id);
      state.isLoading = false;
      state.error = null;
      state.errors.delete = undefined;
    },

    deleteAccountFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.delete = action.payload;
    },

    // ==========================================
    // GET ACCOUNT DETAIL
    // ==========================================
    getAccountDetailRequest: (state, _action: PayloadAction<{ id: string }>) => {
      state.isLoading = true;
      state.error = null;
    },

    getAccountDetailSuccess: (state, action: PayloadAction<IAccount>) => {
      state.currentAccount = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    getAccountDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ==========================================
    // SET FILTERS
    // ==========================================
    setAccountFilters: (state, action: PayloadAction<IAccountFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },

    // ==========================================
    // SET PAGINATION
    // ==========================================
    setAccountPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    // ==========================================
    // CLEAR ERRORS
    // ==========================================
    clearAccountErrors: (state) => {
      state.error = null;
      state.errors = {};
    },

    // ==========================================
    // RESET STATE
    // ==========================================
    resetAccountState: () => {
      return initialAccountState;
    },
  },
});

export const accountActions = accountSlice.actions;
export const accountReducer = accountSlice.reducer;
export default accountSlice;
