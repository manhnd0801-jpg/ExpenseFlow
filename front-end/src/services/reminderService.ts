/**
 * Reminder Service
 * Handles reminder and notification scheduling API calls
 */

import type { ReminderType } from '@/constants/enums';
import type { ICreateReminderRequest, IReminder, IUpdateReminderRequest } from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

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
    const messages = getServiceMessages();
    return api.post<IReminder>(API_ENDPOINTS.REMINDERS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.reminders.created,
    });
  },

  /**
   * Update existing reminder
   */
  updateReminder: async (id: string, data: IUpdateReminderRequest): Promise<IReminder> => {
    const messages = getServiceMessages();
    return api.patch<IReminder>(API_ENDPOINTS.REMINDERS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.reminders.updated,
    });
  },

  /**
   * Mark reminder as completed
   */
  markReminderComplete: async (id: string): Promise<IReminder> => {
    const messages = getServiceMessages();
    return api.patch<IReminder>(
      API_ENDPOINTS.REMINDERS.COMPLETE(id),
      {},
      {
        showSuccessMessage: true,
        successMessage: messages.markedCompleted,
      }
    );
  },

  /**
   * Delete reminder (soft delete)
   */
  deleteReminder: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.REMINDERS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.reminders.deleted,
    });
  },
};
