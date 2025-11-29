/**
 * Goal Saga
 */

import type { IGoal } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { goalService } from '@services/index';
import { translate } from '@utils/i18nService';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  contributeGoalFailure,
  contributeGoalStart,
  contributeGoalSuccess,
  createGoalFailure,
  createGoalStart,
  createGoalSuccess,
  deleteGoalFailure,
  deleteGoalStart,
  deleteGoalSuccess,
  fetchGoalsFailure,
  fetchGoalsStart,
  fetchGoalsSuccess,
  updateGoalFailure,
  updateGoalStart,
  updateGoalSuccess,
} from './goalSlice';
import type { IContributeGoalPayload, IUpdateGoalPayload } from './goalTypes';

// Fetch goals
function* fetchGoalsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(goalService.getGoals);
    // API response is already extracted by interceptor, check if it's array or object
    const goals = Array.isArray(response) ? response : (response as any)?.data || [];
    yield put(fetchGoalsSuccess(goals));
  } catch (error: any) {
    yield put(fetchGoalsFailure(error.message || translate('notifications.error.fetchGoals')));
  }
}

// Create goal
function* createGoalSaga(action: PayloadAction<any>) {
  try {
    const goal: IGoal = yield call(goalService.createGoal, action.payload);
    yield put(createGoalSuccess(goal));
  } catch (error: any) {
    yield put(createGoalFailure(error.message || translate('notifications.error.createGoal')));
  }
}

// Update goal
function* updateGoalSaga(action: PayloadAction<IUpdateGoalPayload>) {
  try {
    const goal: IGoal = yield call(
      goalService.updateGoal,
      action.payload.id,
      action.payload.updates
    );
    yield put(updateGoalSuccess(goal));
  } catch (error: any) {
    yield put(updateGoalFailure(error.message || translate('notifications.error.updateGoal')));
  }
}

// Delete goal
function* deleteGoalSaga(action: PayloadAction<{ id: string }>) {
  try {
    yield call(goalService.deleteGoal, action.payload.id);
    yield put(deleteGoalSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteGoalFailure(error.message || translate('notifications.error.deleteGoal')));
  }
}

// Contribute to goal
function* contributeGoalSaga(action: PayloadAction<IContributeGoalPayload>) {
  try {
    const goal: IGoal = yield call(
      goalService.contributeToGoal,
      action.payload.goalId,
      action.payload
    );
    yield put(contributeGoalSuccess(goal));
  } catch (error: any) {
    yield put(
      contributeGoalFailure(error.message || translate('notifications.error.contributeGoal'))
    );
  }
}

// Root saga
export default function* goalSaga() {
  yield takeLatest(fetchGoalsStart.type, fetchGoalsSaga);
  yield takeLatest(createGoalStart.type, createGoalSaga);
  yield takeLatest(updateGoalStart.type, updateGoalSaga);
  yield takeLatest(deleteGoalStart.type, deleteGoalSaga);
  yield takeLatest(contributeGoalStart.type, contributeGoalSaga);
}
