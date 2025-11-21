/**
 * Budget Service
 * Handles budget-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  IBudget,
  ICreateBudgetRequest,
  IUpdateBudgetRequest,
} from '@/types/models';

export const budgetService = {
  /**
   * Get all budgets for current user
   */
  getBudgets: async (): Promise<IBudget[]> => {
    return api.get<IBudget[]>(API_ENDPOINTS.BUDGETS.LIST);
  },

  /**
   * Get budget by ID
   */
  getBudgetById: async (id: string): Promise<IBudget> => {
    return api.get<IBudget>(API_ENDPOINTS.BUDGETS.GET_BY_ID(id));
  },

  /**
   * Create new budget
   */
  createBudget: async (data: ICreateBudgetRequest): Promise<IBudget> => {
    return api.post<IBudget>(API_ENDPOINTS.BUDGETS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo ngân sách thành công',
    });
  },

  /**
   * Update existing budget
   */
  updateBudget: async (id: string, data: IUpdateBudgetRequest): Promise<IBudget> => {
    return api.patch<IBudget>(API_ENDPOINTS.BUDGETS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật ngân sách thành công',
    });
  },

  /**
   * Delete budget (soft delete)
   */
  deleteBudget: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.BUDGETS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa ngân sách thành công',
    });
  },
};
