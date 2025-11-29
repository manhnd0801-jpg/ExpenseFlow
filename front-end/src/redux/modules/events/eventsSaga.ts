/**
 * Events Saga
 */

import type { IEvent, IEventSummary } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { eventService } from '@services/index';
import { translate } from '@utils/i18nService';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  createEventFailure,
  createEventRequest,
  createEventSuccess,
  deleteEventFailure,
  deleteEventRequest,
  deleteEventSuccess,
  fetchEventByIdFailure,
  fetchEventByIdRequest,
  fetchEventByIdSuccess,
  fetchEventsFailure,
  fetchEventsRequest,
  fetchEventsSuccess,
  fetchEventSummaryFailure,
  fetchEventSummaryRequest,
  fetchEventSummarySuccess,
  updateEventFailure,
  updateEventRequest,
  updateEventSuccess,
} from './eventsSlice';

// Fetch events
function* fetchEventsSaga() {
  try {
    const events: IEvent[] = yield call(eventService.getEvents);
    yield put(fetchEventsSuccess(events));
  } catch (error: any) {
    yield put(fetchEventsFailure(error.message || translate('notifications.error.fetchEvents')));
  }
}

// Fetch event by ID
function* fetchEventByIdSaga(action: PayloadAction<string>) {
  try {
    const event: IEvent = yield call(eventService.getEventById, action.payload);
    yield put(fetchEventByIdSuccess(event));
  } catch (error: any) {
    yield put(fetchEventByIdFailure(error.message || translate('notifications.error.fetchEvents')));
  }
}

// Fetch event summary
function* fetchEventSummarySaga(action: PayloadAction<string>) {
  try {
    const summary: IEventSummary = yield call(eventService.getEventSummary, action.payload);
    yield put(fetchEventSummarySuccess(summary));
  } catch (error: any) {
    yield put(
      fetchEventSummaryFailure(error.message || translate('notifications.error.fetchEvents'))
    );
  }
}

// Create event
function* createEventSaga(action: PayloadAction<any>) {
  try {
    const event: IEvent = yield call(eventService.createEvent, action.payload);
    yield put(createEventSuccess(event));
  } catch (error: any) {
    yield put(createEventFailure(error.message || translate('notifications.error.createEvent')));
  }
}

// Update event
function* updateEventSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const event: IEvent = yield call(
      eventService.updateEvent,
      action.payload.id,
      action.payload.data
    );
    yield put(updateEventSuccess(event));
  } catch (error: any) {
    yield put(updateEventFailure(error.message || translate('notifications.error.updateEvent')));
  }
}

// Delete event
function* deleteEventSaga(action: PayloadAction<string>) {
  try {
    yield call(eventService.deleteEvent, action.payload);
    yield put(deleteEventSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteEventFailure(error.message || translate('notifications.error.deleteEvent')));
  }
}

// Root saga
export default function* eventsSaga() {
  yield takeLatest(fetchEventsRequest.type, fetchEventsSaga);
  yield takeLatest(fetchEventByIdRequest.type, fetchEventByIdSaga);
  yield takeLatest(fetchEventSummaryRequest.type, fetchEventSummarySaga);
  yield takeLatest(createEventRequest.type, createEventSaga);
  yield takeLatest(updateEventRequest.type, updateEventSaga);
  yield takeLatest(deleteEventRequest.type, deleteEventSaga);
}
