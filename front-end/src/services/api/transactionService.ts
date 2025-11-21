/**
 * Transaction API Service
 * Handles all transaction-related API calls
 */

import {
  ICreateTransactionPayload,
  ITransaction,
  ITransactionListQuery,
  IUpdateTransactionPayload,
} from '@/redux/modules/transactions';
import api from '../api';

const TRANSACTION_API_URL = '/transactions';

/**
 * Transaction Service Class
 */
class TransactionService {
  /**
   * Fetch all transactions with optional filters and pagination
   */
  async listTransactions(query: ITransactionListQuery): Promise<ITransaction[]> {
    try {
      const response = await api.get<ITransaction[]>(TRANSACTION_API_URL, {
        params: query,
      });
      return response as ITransaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get single transaction by ID
   */
  async getTransaction(id: string): Promise<ITransaction> {
    try {
      const response = await api.get<ITransaction>(`${TRANSACTION_API_URL}/${id}`);
      return response as ITransaction;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Create new transaction
   */
  async createTransaction(payload: ICreateTransactionPayload): Promise<ITransaction> {
    try {
      const response = await api.post<ITransaction>(TRANSACTION_API_URL, payload);
      return response as ITransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update existing transaction
   */
  async updateTransaction(payload: IUpdateTransactionPayload): Promise<ITransaction> {
    try {
      const { id, ...data } = payload;
      const response = await api.put<ITransaction>(`${TRANSACTION_API_URL}/${id}`, data);
      return response as ITransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Delete transaction by ID
   */
  async deleteTransaction(id: string): Promise<void> {
    try {
      await api.delete(`${TRANSACTION_API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
  }> {
    try {
      const response = await api.get<{
        totalIncome: number;
        totalExpense: number;
        balance: number;
      }>(`${TRANSACTION_API_URL}/stats`);
      return response as { totalIncome: number; totalExpense: number; balance: number };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(query: ITransactionListQuery): Promise<Blob> {
    try {
      const response = await api.get(`${TRANSACTION_API_URL}/export`, {
        params: query,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
