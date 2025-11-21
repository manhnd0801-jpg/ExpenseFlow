/**
 * Goal Saga
 */

import type { IGoal } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { goalService } from '@services/index';
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

// Fetch goals
function* fetchGoalsSaga() {
  try {
    const goals: IGoal[] = yield call(goalService.getGoals);
    yield put(fetchGoalsSuccess(goals));
  } catch (error: any) {
    yield put(fetchGoalsFailure(error.message || 'Lỗi khi tải danh sách mục tiêu'));
  }
}

// Create goal
function* createGoalSaga(action: PayloadAction<any>) {
  try {
    const goal: IGoal = yield call(goalService.createGoal, action.payload);
    yield put(createGoalSuccess(goal));
  } catch (error: any) {
    yield put(createGoalFailure(error.message || 'Lỗi khi tạo mục tiêu'));
  }
}

// Update goal
function* updateGoalSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const goal: IGoal = yield call(goalService.updateGoal, action.payload.id, action.payload.data);
    yield put(updateGoalSuccess(goal));
  } catch (error: any) {
    yield put(updateGoalFailure(error.message || 'Lỗi khi cập nhật mục tiêu'));
  }
}

// Delete goal
function* deleteGoalSaga(action: PayloadAction<{ id: string }>) {
  try {
    yield call(goalService.deleteGoal, action.payload.id);
    yield put(deleteGoalSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteGoalFailure(error.message || 'Lỗi khi xóa mục tiêu'));
  }
}

// Contribute to goal
function* contributeGoalSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const goal: IGoal = yield call(
      goalService.contributeToGoal,
      action.payload.id,
      action.payload.data
    );
    yield put(contributeGoalSuccess(goal));
  } catch (error: any) {
    yield put(contributeGoalFailure(error.message || 'Lỗi khi đóng góp vào mục tiêu'));
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
