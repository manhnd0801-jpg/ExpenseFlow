/**
 * Reminders Saga
 */

import type { ReminderType } from '@/constants/enums';
import type { IReminder } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { reminderService } from '@services/index';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  createReminderFailure,
  createReminderRequest,
  createReminderSuccess,
  deleteReminderFailure,
  deleteReminderRequest,
  deleteReminderSuccess,
  fetchRemindersByTypeFailure,
  fetchRemindersByTypeRequest,
  fetchRemindersByTypeSuccess,
  fetchRemindersFailure,
  fetchRemindersRequest,
  fetchRemindersSuccess,
  fetchUpcomingRemindersFailure,
  fetchUpcomingRemindersRequest,
  fetchUpcomingRemindersSuccess,
  markReminderCompleteFailure,
  markReminderCompleteRequest,
  markReminderCompleteSuccess,
  updateReminderFailure,
  updateReminderRequest,
  updateReminderSuccess,
} from './remindersSlice';

// Fetch reminders
function* fetchRemindersSaga() {
  try {
    const reminders: IReminder[] = yield call(reminderService.getReminders);
    yield put(fetchRemindersSuccess(reminders));
  } catch (error: any) {
    yield put(fetchRemindersFailure(error.message || 'Lỗi khi tải danh sách nhắc nhở'));
  }
}

// Fetch upcoming reminders
function* fetchUpcomingRemindersSaga() {
  try {
    const reminders: IReminder[] = yield call(reminderService.getUpcomingReminders);
    yield put(fetchUpcomingRemindersSuccess(reminders));
  } catch (error: any) {
    yield put(fetchUpcomingRemindersFailure(error.message || 'Lỗi khi tải nhắc nhở sắp tới'));
  }
}

// Fetch reminders by type
function* fetchRemindersByTypeSaga(action: PayloadAction<ReminderType>) {
  try {
    const reminders: IReminder[] = yield call(reminderService.getRemindersByType, action.payload);
    yield put(fetchRemindersByTypeSuccess(reminders));
  } catch (error: any) {
    yield put(fetchRemindersByTypeFailure(error.message || 'Lỗi khi tải nhắc nhở theo loại'));
  }
}

// Create reminder
function* createReminderSaga(action: PayloadAction<any>) {
  try {
    const reminder: IReminder = yield call(reminderService.createReminder, action.payload);
    yield put(createReminderSuccess(reminder));
  } catch (error: any) {
    yield put(createReminderFailure(error.message || 'Lỗi khi tạo nhắc nhở'));
  }
}

// Update reminder
function* updateReminderSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const reminder: IReminder = yield call(
      reminderService.updateReminder,
      action.payload.id,
      action.payload.data
    );
    yield put(updateReminderSuccess(reminder));
  } catch (error: any) {
    yield put(updateReminderFailure(error.message || 'Lỗi khi cập nhật nhắc nhở'));
  }
}

// Mark reminder complete
function* markReminderCompleteSaga(action: PayloadAction<string>) {
  try {
    const reminder: IReminder = yield call(reminderService.markReminderComplete, action.payload);
    yield put(markReminderCompleteSuccess(reminder));
  } catch (error: any) {
    yield put(markReminderCompleteFailure(error.message || 'Lỗi khi đánh dấu hoàn thành'));
  }
}

// Delete reminder
function* deleteReminderSaga(action: PayloadAction<string>) {
  try {
    yield call(reminderService.deleteReminder, action.payload);
    yield put(deleteReminderSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteReminderFailure(error.message || 'Lỗi khi xóa nhắc nhở'));
  }
}

// Root saga
export default function* remindersSaga() {
  yield takeLatest(fetchRemindersRequest.type, fetchRemindersSaga);
  yield takeLatest(fetchUpcomingRemindersRequest.type, fetchUpcomingRemindersSaga);
  yield takeLatest(fetchRemindersByTypeRequest.type, fetchRemindersByTypeSaga);
  yield takeLatest(createReminderRequest.type, createReminderSaga);
  yield takeLatest(updateReminderRequest.type, updateReminderSaga);
  yield takeLatest(markReminderCompleteRequest.type, markReminderCompleteSaga);
  yield takeLatest(deleteReminderRequest.type, deleteReminderSaga);
}
