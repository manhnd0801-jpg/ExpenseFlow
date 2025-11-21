/**
 * Debt Service
 * Handles debt management API calls (lending & borrowing)
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  IDebt,
  IDebtPayment,
  ICreateDebtRequest,
  IUpdateDebtRequest,
  ICreateDebtPaymentRequest,
} from '@/types/models';

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
    return api.post<IDebt>(API_ENDPOINTS.DEBTS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo khoản nợ thành công',
    });
  },

  /**
   * Update existing debt
   */
  updateDebt: async (id: string, data: IUpdateDebtRequest): Promise<IDebt> => {
    return api.patch<IDebt>(API_ENDPOINTS.DEBTS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật khoản nợ thành công',
    });
  },

  /**
   * Delete debt (soft delete)
   */
  deleteDebt: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.DEBTS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa khoản nợ thành công',
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
    return api.post<IDebtPayment>(API_ENDPOINTS.DEBTS.CREATE_PAYMENT(debtId), data, {
      showSuccessMessage: true,
      successMessage: 'Ghi nhận thanh toán thành công',
    });
  },
};
