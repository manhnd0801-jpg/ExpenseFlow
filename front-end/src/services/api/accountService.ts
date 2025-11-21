/**
 * Account Service
 * Handles all account-related API calls
 */

import type {
  IAccount,
  IAccountListResponse,
  ICreateAccountPayload,
  IUpdateAccountPayload,
} from '@/redux/modules/accounts';
import apiClient from '../api';

const ACCOUNT_ENDPOINTS = {
  LIST: '/accounts',
  CREATE: '/accounts',
  GET: (id: string) => `/accounts/${id}`,
  UPDATE: (id: string) => `/accounts/${id}`,
  DELETE: (id: string) => `/accounts/${id}`,
};

class AccountService {
  /**
   * Get list of accounts with filters and pagination
   */
  async listAccounts(filters?: Record<string, any>): Promise<IAccountListResponse> {
    try {
      const response = await apiClient.get<IAccountListResponse>(ACCOUNT_ENDPOINTS.LIST, {
        params: filters,
      });
      return response as IAccountListResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<IAccount> {
    try {
      const response = await apiClient.get<IAccount>(ACCOUNT_ENDPOINTS.GET(id));
      return response as IAccount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new account
   */
  async createAccount(payload: ICreateAccountPayload): Promise<IAccount> {
    try {
      const response = await apiClient.post<IAccount>(ACCOUNT_ENDPOINTS.CREATE, payload, {
        showSuccessMessage: true,
        successMessage: 'Account created successfully',
      } as any);
      return response as IAccount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update account
   */
  async updateAccount(id: string, payload: IUpdateAccountPayload): Promise<IAccount> {
    try {
      const response = await apiClient.put<IAccount>(ACCOUNT_ENDPOINTS.UPDATE(id), payload, {
        showSuccessMessage: true,
        successMessage: 'Account updated successfully',
      } as any);
      return response as IAccount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete account
   */
  async deleteAccount(id: string): Promise<void> {
    try {
      await apiClient.delete(ACCOUNT_ENDPOINTS.DELETE(id), {
        showSuccessMessage: true,
        successMessage: 'Account deleted successfully',
      } as any);
    } catch (error) {
      throw error;
    }
  }
}

export default new AccountService();
