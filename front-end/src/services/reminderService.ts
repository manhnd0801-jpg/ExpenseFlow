/**
 * Reminder Service
 * Handles reminder and notification scheduling API calls
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  IReminder,
  ICreateReminderRequest,
  IUpdateReminderRequest,
} from '@/types/models';
import type { ReminderType } from '@/constants/enums';

export const reminderService = {
  /**
   * Get all reminders for current user
   */
  getReminders: async (): Promise<IReminder[]> => {
    return api.get<IReminder[]>(API_ENDPOINTS.REMINDERS.LIST);
  },

  /**
   * Get reminder by ID
   */
  getReminderById: async (id: string): Promise<IReminder> => {
    return api.get<IReminder>(API_ENDPOINTS.REMINDERS.GET_BY_ID(id));
  },

  /**
   * Get upcoming reminders (within next 7 days)
   */
  getUpcomingReminders: async (): Promise<IReminder[]> => {
    return api.get<IReminder[]>(API_ENDPOINTS.REMINDERS.UPCOMING);
  },

  /**
   * Get reminders by type
   */
  getRemindersByType: async (type: ReminderType): Promise<IReminder[]> => {
    return api.get<IReminder[]>(API_ENDPOINTS.REMINDERS.BY_TYPE, {
      params: { type },
    });
  },

  /**
   * Create new reminder
   */
  createReminder: async (data: ICreateReminderRequest): Promise<IReminder> => {
    return api.post<IReminder>(API_ENDPOINTS.REMINDERS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo nhắc nhở thành công',
    });
  },

  /**
   * Update existing reminder
   */
  updateReminder: async (id: string, data: IUpdateReminderRequest): Promise<IReminder> => {
    return api.patch<IReminder>(API_ENDPOINTS.REMINDERS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật nhắc nhở thành công',
    });
  },

  /**
   * Mark reminder as completed
   */
  markReminderComplete: async (id: string): Promise<IReminder> => {
    return api.patch<IReminder>(API_ENDPOINTS.REMINDERS.COMPLETE(id), {}, {
      showSuccessMessage: true,
      successMessage: 'Đánh dấu hoàn thành thành công',
    });
  },

  /**
   * Delete reminder (soft delete)
   */
  deleteReminder: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.REMINDERS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa nhắc nhở thành công',
    });
  },
};
