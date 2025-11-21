/**
 * Budget API Service
 */
import type {
  IBudget,
  IBudgetProgressResponse,
  ICreateBudgetRequest,
  IUpdateBudgetRequest,
  TPaginatedResponse,
} from '../../types';
import { API_ENDPOINTS } from '../../utils/constants';
import api from '../api';

export const budgetService = {
  /**
   * Get paginated budgets
   */
  getBudgets: async (params: {
    page?: number;
    limit?: number;
  }): Promise<TPaginatedResponse<IBudget>> => {
    return await api.get(API_ENDPOINTS.BUDGETS.LIST, { params });
  },

  /**
   * Get budget by ID
   */
  getBudgetById: async (id: string): Promise<IBudget> => {
    return await api.get(API_ENDPOINTS.BUDGETS.GET_BY_ID(id));
  },

  /**
   * Create new budget
   */
  createBudget: async (data: ICreateBudgetRequest): Promise<IBudget> => {
    return await api.post(API_ENDPOINTS.BUDGETS.CREATE, data, {
      showSuccessMessage: false, // Handled by saga
    });
  },

  /**
   * Update budget
   */
  updateBudget: async (id: string, data: IUpdateBudgetRequest): Promise<IBudget> => {
    return await api.put(API_ENDPOINTS.BUDGETS.UPDATE(id), data, {
      showSuccessMessage: false, // Handled by saga
    });
  },

  /**
   * Delete budget
   */
  deleteBudget: async (id: string): Promise<void> => {
    return await api.delete(API_ENDPOINTS.BUDGETS.DELETE(id), {
      showSuccessMessage: false, // Handled by saga
    });
  },

  /**
   * Get budget progress
   */
  getBudgetProgress: async (budgetId: string): Promise<IBudgetProgressResponse> => {
    return await api.get(API_ENDPOINTS.BUDGETS.GET_PROGRESS(budgetId));
  },
};
