/**
 * Goal Service
 * Handles financial goal-related API calls
 */

import type {
  IContributeGoalRequest,
  ICreateGoalRequest,
  IDeleteGoalRequest,
  IGoal,
  IGoalTransaction,
  IUpdateGoalRequest,
  IWithdrawGoalRequest,
} from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

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
   * Get goal transaction history
   */
  getGoalTransactions: async (id: string): Promise<IGoalTransaction[]> => {
    return api.get<IGoalTransaction[]>(`${API_ENDPOINTS.GOALS.GET_BY_ID(id)}/transactions`);
  },

  /**
   * Create new goal
   */
  createGoal: async (data: ICreateGoalRequest): Promise<IGoal> => {
    const messages = getServiceMessages();
    return api.post<IGoal>(API_ENDPOINTS.GOALS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.goals.created,
    });
  },

  /**
   * Update existing goal
   */
  updateGoal: async (id: string, data: IUpdateGoalRequest): Promise<IGoal> => {
    const messages = getServiceMessages();
    return api.patch<IGoal>(API_ENDPOINTS.GOALS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.goals.updated,
    });
  },

  /**
   * Delete goal with refund options
   */
  deleteGoal: async (id: string, data?: IDeleteGoalRequest): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.GOALS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.goals.deleted,
      data, // Pass delete options in request body
    });
  },

  /**
   * Contribute amount to goal (deduct from account)
   */
  contributeToGoal: async (id: string, data: IContributeGoalRequest): Promise<IGoal> => {
    return api.post<IGoal>(API_ENDPOINTS.GOALS.CONTRIBUTE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Đóng góp vào mục tiêu thành công',
    });
  },

  /**
   * Withdraw amount from goal (refund to account)
   */
  withdrawFromGoal: async (id: string, data: IWithdrawGoalRequest): Promise<IGoal> => {
    return api.post<IGoal>(`${API_ENDPOINTS.GOALS.GET_BY_ID(id)}/withdraw`, data, {
      showSuccessMessage: true,
      successMessage: 'Rút tiền từ mục tiêu thành công',
    });
  },
};
