/**
 * Transaction Service
 * Handles transaction-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  ITransaction,
  ICreateTransactionRequest,
  IUpdateTransactionRequest,
  ITransactionSummary,
  TPaginatedResponse,
  ITransactionFilters,
} from '@/types/models';

export const transactionService = {
  /**
   * Get paginated transactions with filters
   */
  getTransactions: async (
    params: ITransactionFilters
  ): Promise<TPaginatedResponse<ITransaction>> => {
    return api.get<TPaginatedResponse<ITransaction>>(API_ENDPOINTS.TRANSACTIONS.LIST, {
      params,
    });
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: string): Promise<ITransaction> => {
    return api.get<ITransaction>(API_ENDPOINTS.TRANSACTIONS.GET_BY_ID(id));
  },

  /**
   * Get transaction summary (total income/expense)
   */
  getTransactionSummary: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ITransactionSummary> => {
    return api.get<ITransactionSummary>(API_ENDPOINTS.TRANSACTIONS.SUMMARY, { params });
  },

  /**
   * Create new transaction
   */
  createTransaction: async (data: ICreateTransactionRequest): Promise<ITransaction> => {
    return api.post<ITransaction>(API_ENDPOINTS.TRANSACTIONS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo giao dịch thành công',
    });
  },

  /**
   * Update existing transaction
   */
  updateTransaction: async (
    id: string,
    data: IUpdateTransactionRequest
  ): Promise<ITransaction> => {
    return api.patch<ITransaction>(API_ENDPOINTS.TRANSACTIONS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật giao dịch thành công',
    });
  },

  /**
   * Delete transaction
   */
  deleteTransaction: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.TRANSACTIONS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa giao dịch thành công',
    });
  },

  /**
   * Upload transaction receipt image
   */
  uploadReceipt: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload<{ url: string }>('/transactions/upload-receipt', formData);
  },
};
