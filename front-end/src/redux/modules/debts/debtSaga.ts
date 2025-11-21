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
  deleteDebtRequest,
  deleteDebtSuccess,
  fetchDebtPaymentsFailure,
  fetchDebtPaymentsRequest,
  fetchDebtPaymentsSuccess,
  fetchDebtsFailure,
  fetchDebtsRequest,
  fetchDebtsSuccess,
  updateDebtFailure,
  updateDebtRequest,
  updateDebtSuccess,
} from './debtSlice';

// Fetch debts
function* fetchDebtsSaga() {
  try {
    const debts: IDebt[] = yield call(debtService.getDebts);
    yield put(fetchDebtsSuccess(debts));
  } catch (error: any) {
    yield put(fetchDebtsFailure(error.message || 'Lỗi khi tải danh sách nợ'));
  }
}

// Create debt
function* createDebtSaga(action: PayloadAction<any>) {
  try {
    const debt: IDebt = yield call(debtService.createDebt, action.payload);
    yield put(createDebtSuccess(debt));
  } catch (error: any) {
    yield put(createDebtFailure(error.message || 'Lỗi khi tạo khoản nợ'));
  }
}

// Update debt
function* updateDebtSaga(action: PayloadAction<{ id: string; data: any }>) {
  try {
    const debt: IDebt = yield call(debtService.updateDebt, action.payload.id, action.payload.data);
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
function* fetchDebtPaymentsSaga(action: PayloadAction<string>) {
  try {
    const payments: IDebtPayment[] = yield call(debtService.getDebtPayments, action.payload);
    yield put(fetchDebtPaymentsSuccess(payments));
  } catch (error: any) {
    yield put(fetchDebtPaymentsFailure(error.message || 'Lỗi khi tải lịch sử thanh toán'));
  }
}

// Create debt payment
function* createDebtPaymentSaga(action: PayloadAction<{ debtId: string; data: any }>) {
  try {
    const payment: IDebtPayment = yield call(
      debtService.createDebtPayment,
      action.payload.debtId,
      action.payload.data
    );
    yield put(createDebtPaymentSuccess(payment));
  } catch (error: any) {
    yield put(createDebtPaymentFailure(error.message || 'Lỗi khi ghi nhận thanh toán'));
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
}
