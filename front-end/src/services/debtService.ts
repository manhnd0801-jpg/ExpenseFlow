/**
 * Debt Service
 * Handles debt management API calls (lending & borrowing)
 */

import type {
  ICreateDebtPaymentRequest,
  ICreateDebtRequest,
  IDebt,
  IDebtPayment,
  IUpdateDebtRequest,
} from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

export const debtService = {
  /**
   * Get all debts for current user
   */
  getDebts: async (): Promise<IDebt[]> => {
    return api.get<IDebt[]>(API_ENDPOINTS.DEBTS.LIST);
  },

  /**
   * Get debt by ID
   */
  getDebtById: async (id: string): Promise<IDebt> => {
    return api.get<IDebt>(API_ENDPOINTS.DEBTS.GET_BY_ID(id));
  },

  /**
   * Create new debt (lending or borrowing)
   */
  createDebt: async (data: ICreateDebtRequest): Promise<IDebt> => {
    const messages = getServiceMessages();
    return api.post<IDebt>(API_ENDPOINTS.DEBTS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.debts.created,
    });
  },

  /**
   * Update existing debt
   */
  updateDebt: async (id: string, data: IUpdateDebtRequest): Promise<IDebt> => {
    const messages = getServiceMessages();
    return api.patch<IDebt>(API_ENDPOINTS.DEBTS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.debts.updated,
    });
  },

  /**
   * Delete debt (soft delete)
   */
  deleteDebt: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.DEBTS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.debts.deleted,
    });
  },

  /**
   * Get all payments for a debt
   */
  getDebtPayments: async (debtId: string): Promise<IDebtPayment[]> => {
    return api.get<IDebtPayment[]>(API_ENDPOINTS.DEBTS.PAYMENTS(debtId));
  },

  /**
   * Create payment for a debt
   */
  createDebtPayment: async (
    debtId: string,
    data: ICreateDebtPaymentRequest
  ): Promise<IDebtPayment> => {
    const messages = getServiceMessages();
    return api.post<IDebtPayment>(API_ENDPOINTS.DEBTS.CREATE_PAYMENT(debtId), data, {
      showSuccessMessage: true,
      successMessage: messages.paymentRecorded,
    });
  },

  /**
   * Delete payment for a debt (within 7 days)
   */
  deleteDebtPayment: async (debtId: string, paymentId: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.DEBTS.DELETE_PAYMENT(debtId, paymentId), {
      showSuccessMessage: true,
      successMessage: messages.debts.deleted,
    });
  },

  /**
   * Get debt summary statistics
   */
  getDebtSummary: async (): Promise<any> => {
    return api.get<any>(API_ENDPOINTS.DEBTS.SUMMARY);
  },
};
