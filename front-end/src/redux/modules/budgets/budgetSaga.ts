/**
 * Budget Redux Saga
 */
import { PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import { call, put, takeLatest } from 'redux-saga/effects';
import { budgetService } from '../../../services/budgetService';
import {
  createBudgetFailure,
  createBudgetStart,
  createBudgetSuccess,
  deleteBudgetFailure,
  deleteBudgetStart,
  deleteBudgetSuccess,
  fetchBudgetProgressFailure,
  fetchBudgetProgressStart,
  fetchBudgetProgressSuccess,
  fetchBudgetsFailure,
  fetchBudgetsStart,
  fetchBudgetsSuccess,
  updateBudgetFailure,
  updateBudgetStart,
  updateBudgetSuccess,
} from './budgetSlice';
import type {
  ICreateBudgetPayload,
  IDeleteBudgetPayload,
  IFetchBudgetProgressPayload,
  IFetchBudgetsPayload,
  IUpdateBudgetPayload,
} from './budgetTypes';

/**
 * Fetch budgets saga
 */
function* fetchBudgetsSaga(action: PayloadAction<IFetchBudgetsPayload>): Generator<any, void, any> {
  try {
    const { page = 1, pageSize = 20 } = action.payload;

    const response: any = yield call(budgetService.getBudgets, { page, limit: pageSize });
    // After Phase 1 & 2: Backend returns { items: [], total, page, limit, totalPages }
    // Handle both array and paginated response
    const budgets = Array.isArray(response) ? response : response.items || response.data || [];
    yield put(fetchBudgetsSuccess(budgets));
  } catch (error: any) {
    const errorMessage = error.message || 'Không thể tải danh sách ngân sách';
    yield put(fetchBudgetsFailure(errorMessage));
    message.error(errorMessage);
  }
}

/**
 * Create budget saga
 */
function* createBudgetSaga(action: PayloadAction<ICreateBudgetPayload>): Generator<any, void, any> {
  try {
    const response: any = yield call(budgetService.createBudget, action.payload as any);
    // Extract data from wrapped response {success, data, message}
    const budget = response.data || response;
    yield put(createBudgetSuccess(budget));
    message.success('Tạo ngân sách thành công');
  } catch (error: any) {
    const errorMessage = error.message || 'Không thể tạo ngân sách';
    yield put(createBudgetFailure(errorMessage));
    message.error(errorMessage);
  }
}

/**
 * Update budget saga
 */
function* updateBudgetSaga(action: PayloadAction<IUpdateBudgetPayload>): Generator<any, void, any> {
  try {
    const { id, updates } = action.payload;
    const response: any = yield call(budgetService.updateBudget, id, updates);
    // Extract data from wrapped response {success, data, message}
    const budget = response.data || response;
    yield put(updateBudgetSuccess(budget));
    message.success('Cập nhật ngân sách thành công');
  } catch (error: any) {
    const errorMessage = error.message || 'Không thể cập nhật ngân sách';
    yield put(updateBudgetFailure(errorMessage));
    message.error(errorMessage);
  }
}

/**
 * Delete budget saga
 */
function* deleteBudgetSaga(action: PayloadAction<IDeleteBudgetPayload>) {
  try {
    const { id } = action.payload;
    yield call(budgetService.deleteBudget, id);
    yield put(deleteBudgetSuccess({ id }));
    message.success('Xóa ngân sách thành công');
  } catch (error: any) {
    const errorMessage = error.message || 'Không thể xóa ngân sách';
    yield put(deleteBudgetFailure(errorMessage));
    message.error(errorMessage);
  }
}

/**
 * Fetch budget progress saga
 */
function* fetchBudgetProgressSaga(
  action: PayloadAction<IFetchBudgetProgressPayload>
): Generator<any, void, any> {
  try {
    const { budgetId } = action.payload;
    const response: any = yield call(budgetService.getBudgetProgress, budgetId);
    // Extract data from wrapped response {success, data, message}
    const progress = response.data || response;
    yield put(fetchBudgetProgressSuccess(progress));
  } catch (error: any) {
    const errorMessage = error.message || 'Không thể tải tiến độ ngân sách';
    yield put(fetchBudgetProgressFailure(errorMessage));
    message.error(errorMessage);
  }
}

/**
 * Budget saga watcher
 */
export default function* budgetSaga() {
  yield takeLatest(fetchBudgetsStart.type, fetchBudgetsSaga);
  yield takeLatest(createBudgetStart.type, createBudgetSaga);
  yield takeLatest(updateBudgetStart.type, updateBudgetSaga);
  yield takeLatest(deleteBudgetStart.type, deleteBudgetSaga);
  yield takeLatest(fetchBudgetProgressStart.type, fetchBudgetProgressSaga);
}
