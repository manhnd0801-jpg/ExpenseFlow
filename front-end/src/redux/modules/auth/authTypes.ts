/**
 * Auth Module Types
 * Redux state and action types for authentication
 */

import type { IUser } from '../../../types/models/index';

/**
 * Auth response from server
 */
export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Auth State Interface
 */
export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Login Request Payload
 */
export interface ILoginPayload {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface ILoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Signup Request Payload
 */
export interface ISignupPayload {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Signup Response
 */
export interface ISignupResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh Token Request
 */
export interface IRefreshTokenPayload {
  refreshToken: string;
}

/**
 * Refresh Token Response
 */
export interface IRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Forgot Password Request
 */
export interface IForgotPasswordPayload {
  email: string;
}

/**
 * Reset Password Request
 */
export interface IResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Auth Saga Actions
 */
export interface ILoginAction {
  type: 'auth/login/request';
  payload: ILoginPayload;
}

export interface ISignupAction {
  type: 'auth/signup/request';
  payload: ISignupPayload;
}

export interface ILogoutAction {
  type: 'auth/logout/request';
}

export interface IRefreshTokenAction {
  type: 'auth/refreshToken/request';
  payload: IRefreshTokenPayload;
}
