/**
 * Authentication Service
 */

import { API_ENDPOINTS } from '@utils/constants';
import type { IUser } from '../types/models/index';
import api from './api';

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ISignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Auth Service
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: ILoginRequest): Promise<IAuthResponse> => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, data);
  },

  /**
   * Sign up with email and password
   */
  signup: async (data: ISignupRequest): Promise<IAuthResponse> => {
    return api.post(API_ENDPOINTS.AUTH.SIGNUP, data);
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<IAuthResponse> => {
    return api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  },

  /**
   * Forgot password
   */
  forgotPassword: async (data: IForgotPasswordRequest): Promise<{ message: string }> => {
    return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  },

  /**
   * Reset password
   */
  resetPassword: async (data: IResetPasswordRequest): Promise<{ message: string }> => {
    return api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },
};
