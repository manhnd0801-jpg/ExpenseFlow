/**
 * Reminders Saga
 */

import type { ReminderType } from '@/constants/enums';
import type { IReminder } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { reminderService } from '@services/index';
import { translate } from '@utils/i18nService';
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
function* fetchRemindersSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(reminderService.getReminders);
    // After Phase 1 & 2: Backend returns { items: [], total, page, limit, totalPages }
    // Handle both array and paginated response
    const reminders: IReminder[] = Array.isArray(response)
      ? response
      : response.items || response.data || [];
    yield put(fetchRemindersSuccess(reminders));
  } catch (error: any) {
    yield put(
      fetchRemindersFailure(error.message || translate('notifications.error.fetchReminders'))
    );
  }
}

// Fetch upcoming reminders
function* fetchUpcomingRemindersSaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(reminderService.getUpcomingReminders);
    // Handle both array and paginated response
    const reminders: IReminder[] = Array.isArray(response)
      ? response
      : response.items || response.data || [];
    yield put(fetchUpcomingRemindersSuccess(reminders));
  } catch (error: any) {
    yield put(
      fetchUpcomingRemindersFailure(
        error.message || translate('notifications.error.fetchUpcomingReminders')
      )
    );
  }
}

// Fetch reminders by type
function* fetchRemindersByTypeSaga(action: PayloadAction<ReminderType>): Generator<any, void, any> {
  try {
    const response: any = yield call(reminderService.getRemindersByType, action.payload);
    // Handle both array and paginated response
    const reminders: IReminder[] = Array.isArray(response)
      ? response
      : response.items || response.data || [];
    yield put(fetchRemindersByTypeSuccess(reminders));
  } catch (error: any) {
    yield put(
      fetchRemindersByTypeFailure(
        error.message || translate('notifications.error.fetchRemindersByType')
      )
    );
  }
}

// Create reminder
function* createReminderSaga(action: PayloadAction<any>) {
  try {
    const reminder: IReminder = yield call(reminderService.createReminder, action.payload);
    yield put(createReminderSuccess(reminder));
  } catch (error: any) {
    yield put(
      createReminderFailure(error.message || translate('notifications.error.createReminder'))
    );
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
    yield put(
      updateReminderFailure(error.message || translate('notifications.error.updateReminder'))
    );
  }
}

// Mark reminder complete
function* markReminderCompleteSaga(action: PayloadAction<string>) {
  try {
    const reminder: IReminder = yield call(reminderService.markReminderComplete, action.payload);
    yield put(markReminderCompleteSuccess(reminder));
  } catch (error: any) {
    yield put(
      markReminderCompleteFailure(
        error.message || translate('notifications.error.markReminderComplete')
      )
    );
  }
}

// Delete reminder
function* deleteReminderSaga(action: PayloadAction<string>) {
  try {
    yield call(reminderService.deleteReminder, action.payload);
    yield put(deleteReminderSuccess(action.payload));
  } catch (error: any) {
    yield put(
      deleteReminderFailure(error.message || translate('notifications.error.deleteReminder'))
    );
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
