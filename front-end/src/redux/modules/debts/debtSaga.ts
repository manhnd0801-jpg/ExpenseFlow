/**
 * Debt Saga
 */

import type { IDebt, IDebtPayment } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { debtService } from '@services/index';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  createDebtFailure,
  createDebtPaymentFailure,
  createDebtPaymentRequest,
  createDebtPaymentSuccess,
  createDebtRequest,
  createDebtSuccess,
  deleteDebtFailure,
  deleteDebtPaymentFailure,
  deleteDebtPaymentRequest,
  deleteDebtPaymentSuccess,
  deleteDebtRequest,
  deleteDebtSuccess,
  fetchDebtPaymentsFailure,
  fetchDebtPaymentsRequest,
  fetchDebtPaymentsSuccess,
  fetchDebtSummaryFailure,
  fetchDebtSummaryRequest,
  fetchDebtSummarySuccess,
  fetchDebtsFailure,
  fetchDebtsRequest,
  fetchDebtsSuccess,
  updateDebtFailure,
  updateDebtRequest,
  updateDebtSuccess,
} from './debtSlice';

// Fetch debts
function* fetchDebtsSaga(): Generator<any, void, any> {
  try {
    const response = yield call(debtService.getDebts);
    // After Phase 1 & 2: Backend returns { items: [], total, page, limit, totalPages }
    // Handle both array and paginated response
    const debts = Array.isArray(response) ? response : response.items || response.data || [];

    yield put(fetchDebtsSuccess(debts));
  } catch (error: any) {
    yield put(fetchDebtsFailure(error.message || 'Lỗi khi tải danh sách nợ'));
  }
}

// Create debt
function* createDebtSaga(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const response: any = yield call(debtService.createDebt, action.payload);
    // Extract data from wrapped response {success, data, message}
    const debt: IDebt = response.data || response;
    yield put(createDebtSuccess(debt));
  } catch (error: any) {
    yield put(createDebtFailure(error.message || 'Lỗi khi tạo khoản nợ'));
  }
}

// Update debt
function* updateDebtSaga(
  action: PayloadAction<{ id: string; data: any }>
): Generator<any, void, any> {
  try {
    const response: any = yield call(
      debtService.updateDebt,
      action.payload.id,
      action.payload.data
    );
    // Extract data from wrapped response {success, data, message}
    const debt: IDebt = response.data || response;
    yield put(updateDebtSuccess(debt));
  } catch (error: any) {
    yield put(updateDebtFailure(error.message || 'Lỗi khi cập nhật khoản nợ'));
  }
}

// Delete debt
function* deleteDebtSaga(action: PayloadAction<string>) {
  try {
    yield call(debtService.deleteDebt, action.payload);
    yield put(deleteDebtSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteDebtFailure(error.message || 'Lỗi khi xóa khoản nợ'));
  }
}

// Fetch debt payments
function* fetchDebtPaymentsSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const response: any = yield call(debtService.getDebtPayments, action.payload);
    // Handle both array and paginated response
    const payments: IDebtPayment[] = Array.isArray(response)
      ? response
      : response.items || response.data || [];
    yield put(fetchDebtPaymentsSuccess(payments));
  } catch (error: any) {
    yield put(fetchDebtPaymentsFailure(error.message || 'Lỗi khi tải lịch sử thanh toán'));
  }
}

// Create debt payment
function* createDebtPaymentSaga(
  action: PayloadAction<{ debtId: string; data: any }>
): Generator<any, void, any> {
  try {
    const response: any = yield call(
      debtService.createDebtPayment,
      action.payload.debtId,
      action.payload.data
    );
    // Extract data from wrapped response {success, data, message}
    const payment: IDebtPayment = response.data || response;
    yield put(createDebtPaymentSuccess(payment));
  } catch (error: any) {
    yield put(createDebtPaymentFailure(error.message || 'Lỗi khi ghi nhận thanh toán'));
  }
}

// Delete debt payment
function* deleteDebtPaymentSaga(
  action: PayloadAction<{ debtId: string; paymentId: string }>
): Generator<any, void, any> {
  try {
    yield call(debtService.deleteDebtPayment, action.payload.debtId, action.payload.paymentId);
    yield put(deleteDebtPaymentSuccess(action.payload.paymentId));
  } catch (error: any) {
    yield put(deleteDebtPaymentFailure(error.message || 'Lỗi khi xóa thanh toán'));
  }
}

// Fetch debt summary
function* fetchDebtSummarySaga(): Generator<any, void, any> {
  try {
    const response: any = yield call(debtService.getDebtSummary);
    // Extract data from wrapped response {success, data, message}
    const summary = response.data || response;
    yield put(fetchDebtSummarySuccess(summary));
  } catch (error: any) {
    yield put(fetchDebtSummaryFailure(error.message || 'Lỗi khi tải thống kê nợ'));
  }
}

// Root saga
export default function* debtSaga() {
  yield takeLatest(fetchDebtsRequest.type, fetchDebtsSaga);
  yield takeLatest(createDebtRequest.type, createDebtSaga);
  yield takeLatest(updateDebtRequest.type, updateDebtSaga);
  yield takeLatest(deleteDebtRequest.type, deleteDebtSaga);
  yield takeLatest(fetchDebtPaymentsRequest.type, fetchDebtPaymentsSaga);
  yield takeLatest(createDebtPaymentRequest.type, createDebtPaymentSaga);
  yield takeLatest(deleteDebtPaymentRequest.type, deleteDebtPaymentSaga);
  yield takeLatest(fetchDebtSummaryRequest.type, fetchDebtSummarySaga);
}
