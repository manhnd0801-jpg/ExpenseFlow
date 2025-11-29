/**
 * Account Service
 * Handles account-related API calls
 */

import type {
  IAccount,
  IAccountBalance,
  ICreateAccountRequest,
  IUpdateAccountRequest,
} from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

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
    const messages = getServiceMessages();
    return api.post<IAccount>(API_ENDPOINTS.ACCOUNTS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.accounts.created,
    });
  },

  /**
   * Update existing account
   */
  updateAccount: async (id: string, data: IUpdateAccountRequest): Promise<IAccount> => {
    const messages = getServiceMessages();
    return api.patch<IAccount>(API_ENDPOINTS.ACCOUNTS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.accounts.updated,
    });
  },

  /**
   * Delete account (soft delete)
   */
  deleteAccount: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.ACCOUNTS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.accounts.deleted,
    });
  },
};
