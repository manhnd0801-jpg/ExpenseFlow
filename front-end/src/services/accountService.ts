/**
 * Account Service
 * Handles account-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  IAccount,
  ICreateAccountRequest,
  IUpdateAccountRequest,
  IAccountBalance,
} from '@/types/models';

export const accountService = {
  /**
   * Get all accounts for current user
   */
  getAccounts: async (): Promise<IAccount[]> => {
    return api.get<IAccount[]>(API_ENDPOINTS.ACCOUNTS.LIST);
  },

  /**
   * Get account by ID
   */
  getAccountById: async (id: string): Promise<IAccount> => {
    return api.get<IAccount>(API_ENDPOINTS.ACCOUNTS.GET_BY_ID(id));
  },

  /**
   * Get total balance across all accounts
   */
  getTotalBalance: async (): Promise<IAccountBalance> => {
    return api.get<IAccountBalance>(API_ENDPOINTS.ACCOUNTS.TOTAL_BALANCE);
  },

  /**
   * Create new account
   */
  createAccount: async (data: ICreateAccountRequest): Promise<IAccount> => {
    return api.post<IAccount>(API_ENDPOINTS.ACCOUNTS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo tài khoản thành công',
    });
  },

  /**
   * Update existing account
   */
  updateAccount: async (id: string, data: IUpdateAccountRequest): Promise<IAccount> => {
    return api.patch<IAccount>(API_ENDPOINTS.ACCOUNTS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật tài khoản thành công',
    });
  },

  /**
   * Delete account (soft delete)
   */
  deleteAccount: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.ACCOUNTS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa tài khoản thành công',
    });
  },
};
