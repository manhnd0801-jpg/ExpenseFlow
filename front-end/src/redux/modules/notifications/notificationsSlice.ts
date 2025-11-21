/**
 * Notifications Redux Slice
 */

import type { INotification, IUnreadNotificationCount } from '@/types/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationsState {
  notifications: INotification[];
  unreadNotifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadNotifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Fetch notifications
    fetchNotificationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess: (state, action: PayloadAction<INotification[]>) => {
      state.notifications = action.payload;
      state.loading = false;
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch unread notifications
    fetchUnreadNotificationsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUnreadNotificationsSuccess: (state, action: PayloadAction<INotification[]>) => {
      state.unreadNotifications = action.payload;
      state.loading = false;
    },
    fetchUnreadNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch unread count
    fetchUnreadCountRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUnreadCountSuccess: (state, action: PayloadAction<IUnreadNotificationCount>) => {
      state.unreadCount = action.payload.count;
      state.loading = false;
    },
    fetchUnreadCountFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Mark as read
    markAsReadRequest: (state, _action: PayloadAction<string>) => {
      state.error = null;
    },
    markAsReadSuccess: (state, action: PayloadAction<INotification>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
      state.unreadNotifications = state.unreadNotifications.filter(
        (n) => n.id !== action.payload.id
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markAsReadFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Mark all as read
    markAllAsReadRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    markAllAsReadSuccess: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadNotifications = [];
      state.unreadCount = 0;
      state.loading = false;
    },
    markAllAsReadFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete notification
    deleteNotificationRequest: (state, _action: PayloadAction<string>) => {
      state.error = null;
    },
    deleteNotificationSuccess: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
      state.unreadNotifications = state.unreadNotifications.filter((n) => n.id !== action.payload);
    },
    deleteNotificationFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    // Delete all read
    deleteAllReadRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteAllReadSuccess: (state) => {
      state.notifications = state.notifications.filter((n) => !n.isRead);
      state.loading = false;
    },
    deleteAllReadFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  fetchUnreadNotificationsRequest,
  fetchUnreadNotificationsSuccess,
  fetchUnreadNotificationsFailure,
  fetchUnreadCountRequest,
  fetchUnreadCountSuccess,
  fetchUnreadCountFailure,
  markAsReadRequest,
  markAsReadSuccess,
  markAsReadFailure,
  markAllAsReadRequest,
  markAllAsReadSuccess,
  markAllAsReadFailure,
  deleteNotificationRequest,
  deleteNotificationSuccess,
  deleteNotificationFailure,
  deleteAllReadRequest,
  deleteAllReadSuccess,
  deleteAllReadFailure,
} = notificationsSlice.actions;

export const notificationReducer = notificationsSlice.reducer;
