/**
 * Notification Service
 * Handles notification management API calls
 */

import type { INotification, IUnreadNotificationCount } from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

export const notificationService = {
  /**
   * Get all notifications for current user
   */
  getNotifications: async (): Promise<INotification[]> => {
    return api.get<INotification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST);
  },

  /**
   * Get unread notifications
   */
  getUnreadNotifications: async (): Promise<INotification[]> => {
    return api.get<INotification[]>(API_ENDPOINTS.NOTIFICATIONS.UNREAD);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<IUnreadNotificationCount> => {
    return api.get<IUnreadNotificationCount>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string): Promise<INotification> => {
    return api.patch<INotification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {});
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    return api.patch<void>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
      {},
      {
        showSuccessMessage: true,
        successMessage: 'Đã đánh dấu tất cả là đã đọc',
      }
    );
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.deleted,
    });
  },

  /**
   * Delete all read notifications
   */
  deleteAllReadNotifications: async (): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL_READ, {
      showSuccessMessage: true,
      successMessage: messages.deletedAllReadNotifications,
    });
  },
};
