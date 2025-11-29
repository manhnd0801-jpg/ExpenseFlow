/**
 * Notifications Saga
 */

import type { INotification, IUnreadNotificationCount } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '@services/index';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  deleteAllReadFailure,
  deleteAllReadRequest,
  deleteAllReadSuccess,
  deleteNotificationFailure,
  deleteNotificationRequest,
  deleteNotificationSuccess,
  fetchNotificationsFailure,
  fetchNotificationsRequest,
  fetchNotificationsSuccess,
  fetchUnreadCountFailure,
  fetchUnreadCountRequest,
  fetchUnreadCountSuccess,
  fetchUnreadNotificationsFailure,
  fetchUnreadNotificationsRequest,
  fetchUnreadNotificationsSuccess,
  markAllAsReadFailure,
  markAllAsReadRequest,
  markAllAsReadSuccess,
  markAsReadFailure,
  markAsReadRequest,
  markAsReadSuccess,
} from './notificationsSlice';

// Fetch notifications
function* fetchNotificationsSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(notificationService.getNotifications);
    // After Phase 1 & 2: Backend returns { items: [], total, page, limit, totalPages }
    // Handle both array and paginated response
    const notifications: INotification[] = Array.isArray(response)
      ? response
      : response.items || response.data || [];
    yield put(fetchNotificationsSuccess(notifications));
  } catch (error: any) {
    yield put(fetchNotificationsFailure(error.message || 'Lỗi khi tải thông báo'));
  }
}

// Fetch unread notifications
function* fetchUnreadNotificationsSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(notificationService.getUnreadNotifications);
    // Handle both array and paginated response
    const notifications: INotification[] = Array.isArray(response)
      ? response
      : response.items || response.data || [];
    yield put(fetchUnreadNotificationsSuccess(notifications));
  } catch (error: any) {
    yield put(fetchUnreadNotificationsFailure(error.message || 'Lỗi khi tải thông báo chưa đọc'));
  }
}

// Fetch unread count
function* fetchUnreadCountSaga(): Generator<any, void, any> {
  try {
    const count: IUnreadNotificationCount = yield call(notificationService.getUnreadCount);
    yield put(fetchUnreadCountSuccess(count));
  } catch (error: any) {
    yield put(fetchUnreadCountFailure(error.message || 'Lỗi khi tải số lượng thông báo'));
  }
}

// Mark as read
function* markAsReadSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const response: any = yield call(notificationService.markAsRead, action.payload);
    // Extract data from wrapped response {success, data, message}
    const notification: INotification = response.data || response;
    yield put(markAsReadSuccess(notification));
  } catch (error: any) {
    yield put(markAsReadFailure(error.message || 'Lỗi khi đánh dấu đã đọc'));
  }
}

// Mark all as read
function* markAllAsReadSaga(): Generator<any, void, any> {
  try {
    yield call(notificationService.markAllAsRead);
    yield put(markAllAsReadSuccess());
  } catch (error: any) {
    yield put(markAllAsReadFailure(error.message || 'Lỗi khi đánh dấu tất cả đã đọc'));
  }
}

// Delete notification
function* deleteNotificationSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(notificationService.deleteNotification, action.payload);
    yield put(deleteNotificationSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteNotificationFailure(error.message || 'Lỗi khi xóa thông báo'));
  }
}

// Delete all read
function* deleteAllReadSaga(): Generator<any, void, any> {
  try {
    yield call(notificationService.deleteAllReadNotifications);
    yield put(deleteAllReadSuccess());
  } catch (error: any) {
    yield put(deleteAllReadFailure(error.message || 'Lỗi khi xóa tất cả thông báo đã đọc'));
  }
}

// Root saga
export default function* notificationsSaga(): Generator<any, void, any> {
  yield takeLatest(fetchNotificationsRequest.type, fetchNotificationsSaga);
  yield takeLatest(fetchUnreadNotificationsRequest.type, fetchUnreadNotificationsSaga);
  yield takeLatest(fetchUnreadCountRequest.type, fetchUnreadCountSaga);
  yield takeLatest(markAsReadRequest.type, markAsReadSaga);
  yield takeLatest(markAllAsReadRequest.type, markAllAsReadSaga);
  yield takeLatest(deleteNotificationRequest.type, deleteNotificationSaga);
  yield takeLatest(deleteAllReadRequest.type, deleteAllReadSaga);
}
