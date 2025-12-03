/**
 * Loan Redux Saga
 * Handles async operations for loans including CRUD, payments, and amortization
 */

import { loanService } from '@/services';
import { PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import type { CallEffect, PutEffect } from 'redux-saga/effects';
import { call, put, takeLatest } from 'redux-saga/effects';
import { loanActions } from './loanSlice';
import type {
  ICreateLoanPayload,
  IDeleteExtraPrincipalTransactionPayload,
  IDeleteLoanPayload,
  IDeleteLoanPaymentPayload,
  IExtraPrincipalPaymentPayload,
  ILoan,
  ILoanListQuery,
  IRecordLoanPaymentPayload,
  ISimulatePrepaymentPayload,
  IUpdateLoanPayload,
} from './loanTypes';

// ==========================================
// SAGA WORKERS
// ==========================================

function* listLoansSaga(
  action: PayloadAction<ILoanListQuery>
): Generator<CallEffect | PutEffect, void, any> {
  try {
    const response: any = yield call(loanService.getLoans, action.payload);

    yield put(
      loanActions.listLoansSuccess({
        loans: response.items || [],
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
      })
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải danh sách khoản vay';
    yield put(loanActions.listLoansFailure(errorMessage));
  }
}

function* getLoanDetailSaga(
  action: PayloadAction<string>
): Generator<CallEffect | PutEffect, void, ILoan> {
  try {
    const response: ILoan = yield call(loanService.getLoanById, action.payload);
    yield put(loanActions.getLoanDetailSuccess(response));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải chi tiết khoản vay';
    yield put(loanActions.getLoanDetailFailure(errorMessage));
  }
}

function* createLoanSaga(
  action: PayloadAction<ICreateLoanPayload>
): Generator<CallEffect | PutEffect, void, ILoan> {
  try {
    const loan: ILoan = yield call(loanService.createLoan, action.payload);
    yield put(loanActions.createLoanSuccess(loan));
    message.success('Tạo khoản vay thành công');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tạo khoản vay';
    yield put(loanActions.createLoanFailure(errorMessage));
    message.error(errorMessage);
  }
}

function* updateLoanSaga(
  action: PayloadAction<IUpdateLoanPayload>
): Generator<CallEffect | PutEffect, void, ILoan> {
  try {
    const { id, ...payload } = action.payload;
    const loan: ILoan = yield call(loanService.updateLoan, id, payload);
    yield put(loanActions.updateLoanSuccess(loan));
    message.success('Cập nhật khoản vay thành công');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật khoản vay';
    yield put(loanActions.updateLoanFailure(errorMessage));
    message.error(errorMessage);
  }
}

function* deleteLoanSaga(
  action: PayloadAction<IDeleteLoanPayload>
): Generator<CallEffect | PutEffect, void, void> {
  try {
    yield call(loanService.deleteLoan, action.payload.id);
    yield put(loanActions.deleteLoanSuccess(action.payload.id));
    message.success('Xóa khoản vay thành công');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa khoản vay';
    yield put(loanActions.deleteLoanFailure(errorMessage));
    message.error(errorMessage);
  }
}

function* getAmortizationScheduleSaga(
  action: PayloadAction<string>
): Generator<CallEffect | PutEffect, void, any> {
  try {
    const response: any = yield call(loanService.getAmortizationSchedule, action.payload);
    // Map backend fields to frontend interface
    const schedule = Array.isArray(response)
      ? response.map((item: any) => ({
          month: item.paymentNumber,
          payment: item.payment,
          principal: item.principal,
          interest: item.interest,
          balance: item.remainingPrincipal,
          date: item.paymentDate,
        }))
      : [];
    yield put(loanActions.getAmortizationScheduleSuccess(schedule));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải lịch trả nợ';
    yield put(loanActions.getAmortizationScheduleFailure(errorMessage));
  }
}

function* getPaymentScheduleWithStatusSaga(
  action: PayloadAction<string>
): Generator<CallEffect | PutEffect, void, any> {
  try {
    const response: any = yield call(loanService.getPaymentScheduleWithStatus, action.payload);
    yield put(loanActions.getPaymentScheduleWithStatusSuccess(response));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải lịch sử thanh toán';
    yield put(loanActions.getPaymentScheduleWithStatusFailure(errorMessage));
  }
}

function* recordLoanPaymentSaga(
  action: PayloadAction<IRecordLoanPaymentPayload>
): Generator<CallEffect | PutEffect, void, any> {
  try {
    yield call(loanService.recordPayment, action.payload);
    yield put(loanActions.recordLoanPaymentSuccess(action.payload as any));

    // Reload loan detail (includes payments array)
    yield put(loanActions.getLoanDetailRequest(action.payload.loanId));

    // Reload amortization schedule
    yield put(loanActions.getAmortizationScheduleRequest(action.payload.loanId));

    // Reload payment schedule with status
    yield put(loanActions.getPaymentScheduleWithStatusRequest(action.payload.loanId));

    message.success('Ghi nhận thanh toán thành công');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi ghi nhận thanh toán';
    yield put(loanActions.recordLoanPaymentFailure(errorMessage));
    message.error(errorMessage);
  }
}

function* deleteLoanPaymentSaga(
  action: PayloadAction<IDeleteLoanPaymentPayload>
): Generator<CallEffect | PutEffect, void, void> {
  try {
    const { loanId, paymentId } = action.payload;
    yield call(loanService.deletePayment, loanId, paymentId);
    yield put(loanActions.deleteLoanPaymentSuccess());

    // Reload loan detail (includes updated payments array)
    yield put(loanActions.getLoanDetailRequest(loanId));

    // Reload amortization schedule
    yield put(loanActions.getAmortizationScheduleRequest(loanId));

    // Reload payment schedule with status
    yield put(loanActions.getPaymentScheduleWithStatusRequest(loanId));

    // Optionally reload loans list
    yield put(loanActions.listLoansRequest({}));

    message.success('Xóa thanh toán thành công');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa thanh toán';
    yield put(loanActions.deleteLoanPaymentFailure(errorMessage));
    message.error(errorMessage);
  }
}

function* simulatePrepaymentSaga(
  action: PayloadAction<ISimulatePrepaymentPayload>
): Generator<CallEffect | PutEffect, void, any> {
  try {
    const response: any = yield call(loanService.simulatePrepayment, action.payload);
    // Map backend response (newSchedule array items) to frontend format
    const simulation = {
      ...response,
      newSchedule:
        response.newSchedule?.map((item: any) => ({
          month: item.paymentNumber,
          payment: item.payment,
          principal: item.principal,
          interest: item.interest,
          balance: item.remainingPrincipal,
          date: item.paymentDate,
        })) || [],
    };
    yield put(loanActions.simulatePrepaymentSuccess(simulation));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi mô phỏng trả trước';
    yield put(loanActions.simulatePrepaymentFailure(errorMessage));
  }
}

function* extraPrincipalPaymentSaga(
  action: PayloadAction<IExtraPrincipalPaymentPayload>
): Generator<CallEffect | PutEffect, void, { newRemainingPrincipal: number }> {
  try {
    const response: { newRemainingPrincipal: number } = yield call(
      loanService.makeExtraPrincipalPayment,
      action.payload
    );

    yield put(loanActions.extraPrincipalPaymentSuccess());

    message.success(
      `Trả gốc tự do thành công! Số dư còn lại: ${new Intl.NumberFormat('vi-VN').format(
        response.newRemainingPrincipal
      )}₫`
    );

    // Refresh loan detail and extra principal transactions after payment
    yield put(loanActions.getLoanDetailRequest(action.payload.loanId));
    yield put(loanActions.getExtraPrincipalTransactionsRequest(action.payload.loanId));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi trả gốc tự do';
    yield put(loanActions.extraPrincipalPaymentFailure(errorMessage));
    message.error(errorMessage);
  }
}

function* getExtraPrincipalTransactionsSaga(
  action: PayloadAction<string>
): Generator<CallEffect | PutEffect, void, { data: any[] }> {
  try {
    const response: { data: any[] } = yield call(
      loanService.getExtraPrincipalTransactions,
      action.payload
    );

    yield put(loanActions.getExtraPrincipalTransactionsSuccess(response.data || []));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Lỗi khi tải danh sách trả gốc tự do';
    yield put(loanActions.getExtraPrincipalTransactionsFailure(errorMessage));
  }
}

function* deleteExtraPrincipalTransactionSaga(
  action: PayloadAction<IDeleteExtraPrincipalTransactionPayload>
): Generator<CallEffect | PutEffect, void, void> {
  try {
    yield call(loanService.deleteExtraPrincipalTransaction, action.payload);

    yield put(loanActions.deleteExtraPrincipalTransactionSuccess());
    message.success('Đã xóa giao dịch trả gốc tự do');

    // Refresh loan detail and extra principal transactions
    yield put(loanActions.getLoanDetailRequest(action.payload.loanId));
    yield put(loanActions.getExtraPrincipalTransactionsRequest(action.payload.loanId));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Lỗi khi xóa giao dịch trả gốc tự do';
    yield put(loanActions.deleteExtraPrincipalTransactionFailure(errorMessage));
    message.error(errorMessage);
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
  yield takeLatest(
    loanActions.getPaymentScheduleWithStatusRequest.type,
    getPaymentScheduleWithStatusSaga
  );
  yield takeLatest(loanActions.recordLoanPaymentRequest.type, recordLoanPaymentSaga);
  yield takeLatest(loanActions.deleteLoanPaymentRequest.type, deleteLoanPaymentSaga);
  yield takeLatest(loanActions.simulatePrepaymentRequest.type, simulatePrepaymentSaga);
  yield takeLatest(loanActions.extraPrincipalPaymentRequest.type, extraPrincipalPaymentSaga);
  yield takeLatest(
    loanActions.getExtraPrincipalTransactionsRequest.type,
    getExtraPrincipalTransactionsSaga
  );
  yield takeLatest(
    loanActions.deleteExtraPrincipalTransactionRequest.type,
    deleteExtraPrincipalTransactionSaga
  );
}
