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
    pageSize?: number;
  }): Promise<TPaginatedResponse<IBudget>> => {
    return await api.get(API_ENDPOINTS.BUDGETS.LIST, { params });
  },

  /**
   * Get budget by ID
   */
  getBudgetById: async (id: string): Promise<IBudget> => {
    const url = API_ENDPOINTS.BUDGETS.GET_BY_ID.replace(':id', id);
    return await api.get(url);
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
    const url = API_ENDPOINTS.BUDGETS.UPDATE.replace(':id', id);
    return await api.put(url, data, {
      showSuccessMessage: false, // Handled by saga
    });
  },

  /**
   * Delete budget
   */
  deleteBudget: async (id: string): Promise<void> => {
    const url = API_ENDPOINTS.BUDGETS.DELETE.replace(':id', id);
    return await api.delete(url, {
      showSuccessMessage: false, // Handled by saga
    });
  },

  /**
   * Get budget progress
   */
  getBudgetProgress: async (budgetId: string): Promise<IBudgetProgressResponse> => {
    const url = API_ENDPOINTS.BUDGETS.GET_PROGRESS.replace(':id', budgetId);
    return await api.get(url);
  },
};
