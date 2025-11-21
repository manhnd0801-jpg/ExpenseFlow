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
function* fetchNotificationsSaga() {
  try {
    const notifications: INotification[] = yield call(notificationService.getNotifications);
    yield put(fetchNotificationsSuccess(notifications));
  } catch (error: any) {
    yield put(fetchNotificationsFailure(error.message || 'Lỗi khi tải thông báo'));
  }
}

// Fetch unread notifications
function* fetchUnreadNotificationsSaga() {
  try {
    const notifications: INotification[] = yield call(notificationService.getUnreadNotifications);
    yield put(fetchUnreadNotificationsSuccess(notifications));
  } catch (error: any) {
    yield put(fetchUnreadNotificationsFailure(error.message || 'Lỗi khi tải thông báo chưa đọc'));
  }
}

// Fetch unread count
function* fetchUnreadCountSaga() {
  try {
    const count: IUnreadNotificationCount = yield call(notificationService.getUnreadCount);
    yield put(fetchUnreadCountSuccess(count));
  } catch (error: any) {
    yield put(fetchUnreadCountFailure(error.message || 'Lỗi khi tải số lượng thông báo'));
  }
}

// Mark as read
function* markAsReadSaga(action: PayloadAction<string>) {
  try {
    const notification: INotification = yield call(notificationService.markAsRead, action.payload);
    yield put(markAsReadSuccess(notification));
  } catch (error: any) {
    yield put(markAsReadFailure(error.message || 'Lỗi khi đánh dấu đã đọc'));
  }
}

// Mark all as read
function* markAllAsReadSaga() {
  try {
    yield call(notificationService.markAllAsRead);
    yield put(markAllAsReadSuccess());
  } catch (error: any) {
    yield put(markAllAsReadFailure(error.message || 'Lỗi khi đánh dấu tất cả đã đọc'));
  }
}

// Delete notification
function* deleteNotificationSaga(action: PayloadAction<string>) {
  try {
    yield call(notificationService.deleteNotification, action.payload);
    yield put(deleteNotificationSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteNotificationFailure(error.message || 'Lỗi khi xóa thông báo'));
  }
}

// Delete all read
function* deleteAllReadSaga() {
  try {
    yield call(notificationService.deleteAllReadNotifications);
    yield put(deleteAllReadSuccess());
  } catch (error: any) {
    yield put(deleteAllReadFailure(error.message || 'Lỗi khi xóa tất cả thông báo đã đọc'));
  }
}

// Root saga
export default function* notificationsSaga() {
  yield takeLatest(fetchNotificationsRequest.type, fetchNotificationsSaga);
  yield takeLatest(fetchUnreadNotificationsRequest.type, fetchUnreadNotificationsSaga);
  yield takeLatest(fetchUnreadCountRequest.type, fetchUnreadCountSaga);
  yield takeLatest(markAsReadRequest.type, markAsReadSaga);
  yield takeLatest(markAllAsReadRequest.type, markAllAsReadSaga);
  yield takeLatest(deleteNotificationRequest.type, deleteNotificationSaga);
  yield takeLatest(deleteAllReadRequest.type, deleteAllReadSaga);
}
