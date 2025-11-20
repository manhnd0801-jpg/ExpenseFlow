/**
 * Goal API Service
 */
import type {
  IContributeGoalRequest,
  ICreateGoalRequest,
  IGoal,
  IUpdateGoalRequest,
  TPaginatedResponse,
} from '../../types';
import { API_ENDPOINTS } from '../../utils/constants';
import api from '../api';

export const goalService = {
  /**
   * Get paginated goals
   */
  getGoals: async (params: {
    page?: number;
    pageSize?: number;
  }): Promise<TPaginatedResponse<IGoal>> => {
    return await api.get(API_ENDPOINTS.GOALS.LIST, { params });
  },

  /**
   * Get goal by ID
   */
  getGoalById: async (id: string): Promise<IGoal> => {
    const url = API_ENDPOINTS.GOALS.GET_BY_ID.replace(':id', id);
    return await api.get(url);
  },

  /**
   * Create new goal
   */
  createGoal: async (data: ICreateGoalRequest): Promise<IGoal> => {
    return await api.post(API_ENDPOINTS.GOALS.CREATE, data, {
      showSuccessMessage: false,
    });
  },

  /**
   * Update goal
   */
  updateGoal: async (id: string, data: IUpdateGoalRequest): Promise<IGoal> => {
    const url = API_ENDPOINTS.GOALS.UPDATE.replace(':id', id);
    return await api.put(url, data, {
      showSuccessMessage: false,
    });
  },

  /**
   * Delete goal
   */
  deleteGoal: async (id: string): Promise<void> => {
    const url = API_ENDPOINTS.GOALS.DELETE.replace(':id', id);
    return await api.delete(url, {
      showSuccessMessage: false,
    });
  },

  /**
   * Contribute to goal
   */
  contributeToGoal: async (goalId: string, data: IContributeGoalRequest): Promise<IGoal> => {
    const url = API_ENDPOINTS.GOALS.CONTRIBUTE.replace(':id', goalId);
    return await api.post(url, data, {
      showSuccessMessage: false,
    });
  },
};
