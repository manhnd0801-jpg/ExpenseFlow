/**
 * Auth Module Saga
 * Redux-Saga for authentication side effects
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@services/authService';
import { STORAGE_KEYS } from '@utils/constants';
import { put, takeLatest } from 'redux-saga/effects';
import { authActions } from './authSlice';
import type {
  IAuthResponse,
  ILoginPayload,
  IRefreshTokenPayload,
  ISignupPayload,
} from './authTypes';

/**
 * Login saga
 * Handle user login with email and password
 */
function* loginSaga(action: PayloadAction<ILoginPayload>): Generator<any, void, any> {
  try {
    // Call login service
    const response: IAuthResponse = yield authService.login({
      email: action.payload.email,
      password: action.payload.password,
    });

    // Store tokens in localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

    // Dispatch success action
    yield put(
      authActions.loginSuccess({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
    );

    if (import.meta.env.DEV) {
      console.log('✅ Login successful:', response.user.email);
    }
  } catch (error) {
    // Handle login error
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    yield put(authActions.loginFailure(errorMessage));

    if (import.meta.env.DEV) {
      console.error('❌ Login error:', error);
    }
  }
}

/**
 * Signup saga
 * Handle user registration with email, password, and fullName
 */
function* signupSaga(action: PayloadAction<ISignupPayload>): Generator<any, void, any> {
  try {
    // Call signup service
    const response: IAuthResponse = yield authService.signup({
      email: action.payload.email,
      password: action.payload.password,
      fullName: action.payload.fullName,
    });

    // Store tokens in localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

    // Dispatch success action
    yield put(
      authActions.signupSuccess({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
    );

    if (import.meta.env.DEV) {
      console.log('✅ Signup successful:', response.user.email);
    }
  } catch (error) {
    // Handle signup error
    const errorMessage = error instanceof Error ? error.message : 'Signup failed';
    yield put(authActions.signupFailure(errorMessage));

    if (import.meta.env.DEV) {
      console.error('❌ Signup error:', error);
    }
  }
}

/**
 * Logout saga
 * Handle user logout by clearing tokens
 */
function* logoutSaga(): Generator<any, void, any> {
  try {
    // Call logout service (optional backend call)
    yield authService.logout();

    // Clear stored tokens
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    // Dispatch logout action
    yield put(authActions.logout());

    if (import.meta.env.DEV) {
      console.log('✅ Logout successful');
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('❌ Logout error:', error);
    }
    // Still dispatch logout even if service call fails
    yield put(authActions.logout());
  }
}

/**
 * Refresh token saga
 * Handle token refresh for expired access tokens
 */
function* refreshTokenSaga(action: PayloadAction<IRefreshTokenPayload>): Generator<any, void, any> {
  try {
    // Call refresh token service
    const response: IAuthResponse = yield authService.refreshToken(action.payload.refreshToken);

    // Update tokens in localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

    // Dispatch success action
    yield put(
      authActions.refreshTokenSuccess({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      })
    );

    if (import.meta.env.DEV) {
      console.log('✅ Token refreshed successfully');
    }
  } catch (error) {
    // Handle refresh error
    const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
    yield put(authActions.refreshTokenFailure(errorMessage));

    if (import.meta.env.DEV) {
      console.error('❌ Token refresh error:', error);
    }
  }
}

/**
 * Root auth saga
 * Watches for auth actions and triggers side effects
 */
export function* authSaga(): Generator<any, void, any> {
  yield takeLatest('auth/loginRequest', loginSaga);
  yield takeLatest('auth/signupRequest', signupSaga);
  yield takeLatest('auth/logout', logoutSaga);
  yield takeLatest('auth/refreshTokenRequest', refreshTokenSaga);
}
