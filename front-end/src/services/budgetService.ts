/**
 * Budget Service
 * Handles budget-related API calls
 */

import type { IBudget, ICreateBudgetRequest, IUpdateBudgetRequest } from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

export const budgetService = {
  /**
   * Get all budgets for current user
   */
  getBudgets: async (params?: { page?: number; limit?: number }): Promise<IBudget[]> => {
    return api.get<IBudget[]>(API_ENDPOINTS.BUDGETS.LIST, { params });
  },

  /**
   * Get budget by ID
   */
  getBudgetById: async (id: string): Promise<IBudget> => {
    return api.get<IBudget>(API_ENDPOINTS.BUDGETS.GET_BY_ID(id));
  },

  /**
   * Get budget progress/statistics
   */
  getBudgetProgress: async (id: string): Promise<any> => {
    return api.get<any>(`${API_ENDPOINTS.BUDGETS.GET_BY_ID(id)}/progress`);
  },

  /**
   * Create new budget
   */
  createBudget: async (data: ICreateBudgetRequest): Promise<IBudget> => {
    const messages = getServiceMessages();
    return api.post<IBudget>(API_ENDPOINTS.BUDGETS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.budgets.created,
    });
  },

  /**
   * Update existing budget
   */
  updateBudget: async (id: string, data: IUpdateBudgetRequest): Promise<IBudget> => {
    const messages = getServiceMessages();
    return api.patch<IBudget>(API_ENDPOINTS.BUDGETS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.budgets.updated,
    });
  },

  /**
   * Delete budget (soft delete)
   */
  deleteBudget: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.BUDGETS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.budgets.deleted,
    });
  },
};
