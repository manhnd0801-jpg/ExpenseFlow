/**
 * Custom Hooks - useAuth
 * Authentication state and methods
 */

import { authActions, selectError, selectIsAuthenticated, selectIsLoading, selectUser } from '@redux/modules/auth';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';

/**
 * useAuth hook - Get auth state and methods
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(
        authActions.loginRequest({
          email,
          password,
        })
      );
    },
    [dispatch]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    dispatch(authActions.logout());
  }, [dispatch]);

  /**
   * Signup new user
   */
  const signup = useCallback(
    async (email: string, password: string, fullName: string) => {
      dispatch(
        authActions.signupRequest({
          email,
          password,
          fullName,
        })
      );
    },
    [dispatch]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    dispatch(authActions.clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    signup,
    clearError,
  };
}
