/**
 * Loan Redux Saga
 * Handles async operations for loans including CRUD, payments, and amortization
 */

import api from '@/services/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { loanActions } from './loanSlice';
import {
  ICreateLoanPayload,
  IDeleteLoanPayload,
  ILoan,
  ILoanListQuery,
  IRecordLoanPaymentPayload,
  ISimulatePrepaymentPayload,
  IUpdateLoanPayload,
} from './loanTypes';

// ==========================================
// API CALLS
// ==========================================

const loanAPI = {
  list: (params: ILoanListQuery) => api.get('/loans', { params }),

  getDetail: (id: string) => api.get(`/loans/${id}`),

  create: (payload: ICreateLoanPayload) => api.post('/loans', payload),

  update: ({ id, ...payload }: IUpdateLoanPayload) => api.patch(`/loans/${id}`, payload),

  delete: ({ id }: IDeleteLoanPayload) => api.delete(`/loans/${id}`),

  getAmortizationSchedule: (loanId: string) => api.get(`/loans/${loanId}/amortization-schedule`),

  recordPayment: ({ loanId, ...payload }: IRecordLoanPaymentPayload) =>
    api.post(`/loans/${loanId}/payments`, payload),

  getPayments: (loanId: string) => api.get(`/loans/${loanId}/payments`),

  simulatePrepayment: ({ loanId, ...payload }: ISimulatePrepaymentPayload) =>
    api.post(`/loans/${loanId}/simulate-prepayment`, payload),
};

// ==========================================
// SAGA WORKERS
// ==========================================

function* listLoansSaga(action: PayloadAction<ILoanListQuery>): Generator<any, void, any> {
  try {
    // After Phase 1: Backend returns { items: [], total, page, limit, totalPages }
    const response: any = yield call(loanAPI.list, action.payload);

    yield put(
      loanActions.listLoansSuccess({
        loans: response.items || response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
      })
    );
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi tải danh sách khoản vay';
    yield put(loanActions.listLoansFailure(errorMessage));
  }
}

function* getLoanDetailSaga(action: PayloadAction<string>) {
  try {
    const response: ILoan = yield call(loanAPI.getDetail, action.payload);
    yield put(loanActions.getLoanDetailSuccess(response));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi tải chi tiết khoản vay';
    yield put(loanActions.getLoanDetailFailure(errorMessage));
  }
}

function* createLoanSaga(action: PayloadAction<ICreateLoanPayload>): Generator<any, void, any> {
  try {
    const response: any = yield call(loanAPI.create, action.payload);
    // Extract data from wrapped response {success, data, message}
    const loan: ILoan = response.data || response;
    yield put(loanActions.createLoanSuccess(loan));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi tạo khoản vay';
    yield put(loanActions.createLoanFailure(errorMessage));
  }
}

function* updateLoanSaga(action: PayloadAction<IUpdateLoanPayload>): Generator<any, void, any> {
  try {
    const response: any = yield call(loanAPI.update, action.payload);
    // Extract data from wrapped response {success, data, message}
    const loan: ILoan = response.data || response;
    yield put(loanActions.updateLoanSuccess(loan));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi cập nhật khoản vay';
    yield put(loanActions.updateLoanFailure(errorMessage));
  }
}

function* deleteLoanSaga(action: PayloadAction<IDeleteLoanPayload>) {
  try {
    yield call(loanAPI.delete, action.payload);
    yield put(loanActions.deleteLoanSuccess(action.payload.id));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi xóa khoản vay';
    yield put(loanActions.deleteLoanFailure(errorMessage));
  }
}

function* getAmortizationScheduleSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const response: any = yield call(loanAPI.getAmortizationSchedule, action.payload);
    yield put(loanActions.getAmortizationScheduleSuccess(response.schedule || []));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi tải lịch trả nợ';
    yield put(loanActions.getAmortizationScheduleFailure(errorMessage));
  }
}

function* recordLoanPaymentSaga(
  action: PayloadAction<IRecordLoanPaymentPayload>
): Generator<any, void, any> {
  try {
    const response: ILoan = yield call(loanAPI.recordPayment, action.payload);
    yield put(loanActions.recordLoanPaymentSuccess(response));

    // Reload payments list
    yield put(loanActions.getLoanPaymentsRequest(action.payload.loanId));

    // Reload amortization schedule
    yield put(loanActions.getAmortizationScheduleRequest(action.payload.loanId));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi ghi nhận thanh toán';
    yield put(loanActions.recordLoanPaymentFailure(errorMessage));
  }
}

function* getLoanPaymentsSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const response: any = yield call(loanAPI.getPayments, action.payload);
    yield put(loanActions.getLoanPaymentsSuccess(response.payments || []));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi tải lịch sử thanh toán';
    yield put(loanActions.getLoanPaymentsFailure(errorMessage));
  }
}

function* simulatePrepaymentSaga(
  action: PayloadAction<ISimulatePrepaymentPayload>
): Generator<any, void, any> {
  try {
    const response: any = yield call(loanAPI.simulatePrepayment, action.payload);
    yield put(loanActions.simulatePrepaymentSuccess(response.simulation || response));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Lỗi khi mô phỏng trả trước';
    yield put(loanActions.simulatePrepaymentFailure(errorMessage));
  }
}

// ==========================================
// ROOT SAGA
// ==========================================

export default function* loanSaga() {
  yield takeLatest(loanActions.listLoansRequest.type, listLoansSaga);
  yield takeLatest(loanActions.getLoanDetailRequest.type, getLoanDetailSaga);
  yield takeLatest(loanActions.createLoanRequest.type, createLoanSaga);
  yield takeLatest(loanActions.updateLoanRequest.type, updateLoanSaga);
  yield takeLatest(loanActions.deleteLoanRequest.type, deleteLoanSaga);
  yield takeLatest(loanActions.getAmortizationScheduleRequest.type, getAmortizationScheduleSaga);
  yield takeLatest(loanActions.recordLoanPaymentRequest.type, recordLoanPaymentSaga);
  yield takeLatest(loanActions.getLoanPaymentsRequest.type, getLoanPaymentsSaga);
  yield takeLatest(loanActions.simulatePrepaymentRequest.type, simulatePrepaymentSaga);
}
