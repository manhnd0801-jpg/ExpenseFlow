/**
 * Goal Service
 * Handles financial goal-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  IGoal,
  ICreateGoalRequest,
  IUpdateGoalRequest,
  IContributeGoalRequest,
} from '@/types/models';

export const goalService = {
  /**
   * Get all goals for current user
   */
  getGoals: async (): Promise<IGoal[]> => {
    return api.get<IGoal[]>(API_ENDPOINTS.GOALS.LIST);
  },

  /**
   * Get goal by ID
   */
  getGoalById: async (id: string): Promise<IGoal> => {
    return api.get<IGoal>(API_ENDPOINTS.GOALS.GET_BY_ID(id));
  },

  /**
   * Create new goal
   */
  createGoal: async (data: ICreateGoalRequest): Promise<IGoal> => {
    return api.post<IGoal>(API_ENDPOINTS.GOALS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo mục tiêu thành công',
    });
  },

  /**
   * Update existing goal
   */
  updateGoal: async (id: string, data: IUpdateGoalRequest): Promise<IGoal> => {
    return api.patch<IGoal>(API_ENDPOINTS.GOALS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật mục tiêu thành công',
    });
  },

  /**
   * Delete goal (soft delete)
   */
  deleteGoal: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.GOALS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa mục tiêu thành công',
    });
  },

  /**
   * Contribute amount to goal
   */
  contributeToGoal: async (id: string, data: IContributeGoalRequest): Promise<IGoal> => {
    return api.post<IGoal>(API_ENDPOINTS.GOALS.CONTRIBUTE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Đóng góp vào mục tiêu thành công',
    });
  },
};
