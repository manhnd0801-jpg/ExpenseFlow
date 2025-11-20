/**
 * Auth Module Selectors
 * Memoized selectors for auth state
 */

import type { RootState } from '@redux/store';
import { createSelector } from '@reduxjs/toolkit';

/**
 * Root auth state selector
 */
const selectAuthState = (state: RootState) => state.auth;

/**
 * Select current user
 */
export const selectUser = createSelector([selectAuthState], (auth) => auth.user);

/**
 * Select access token
 */
export const selectAccessToken = createSelector([selectAuthState], (auth) => auth.accessToken);

/**
 * Select refresh token
 */
export const selectRefreshToken = createSelector([selectAuthState], (auth) => auth.refreshToken);

/**
 * Select authentication status
 */
export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

/**
 * Select loading state
 */
export const selectIsLoading = createSelector([selectAuthState], (auth) => auth.isLoading);

/**
 * Select error message
 */
export const selectError = createSelector([selectAuthState], (auth) => auth.error);

/**
 * Select auth state for debugging (dev only)
 */
export const selectAuthDebug = createSelector([selectAuthState], (auth) => ({
  user: auth.user,
  isAuthenticated: auth.isAuthenticated,
  isLoading: auth.isLoading,
  error: auth.error,
}));
