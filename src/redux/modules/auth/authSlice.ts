/**
 * Auth Module Slice
 * Redux Toolkit slice for authentication state management
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IUser } from '../../../types/models/index';
import type { IAuthState, ILoginPayload, ISignupPayload } from './authTypes';

/**
 * Initial auth state
 */
const initialState: IAuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

/**
 * Auth slice with reducers
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Login request started
     */
    loginRequest: (state, _action: PayloadAction<ILoginPayload>) => {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Login success
     */
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },

    /**
     * Login failure
     */
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },

    /**
     * Signup request started
     */
    signupRequest: (state, _action: PayloadAction<ISignupPayload>) => {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Signup success
     */
    signupSuccess: (
      state,
      action: PayloadAction<{
        user: IUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },

    /**
     * Signup failure
     */
    signupFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    /**
     * Logout
     */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Refresh token request started
     */
    refreshTokenRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    /**
     * Refresh token success
     */
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },

    /**
     * Refresh token failure
     */
    refreshTokenFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },

    /**
     * Clear error message
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Initialize auth from stored tokens (hydrate)
     */
    hydrateAuth: (
      state,
      action: PayloadAction<{
        user: IUser | null;
        accessToken: string | null;
        refreshToken: string | null;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = !!action.payload.accessToken;
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

export default authSlice;
