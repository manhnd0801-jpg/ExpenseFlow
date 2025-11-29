/**
 * Transaction Redux-Saga
 * Handles async side effects for transaction operations (API calls)
 */

import { transactionService } from '@/services/transactionService';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, select, takeEvery } from 'redux-saga/effects';
import { selectTransactionPagination } from './transactionSelectors';
import { transactionActions } from './transactionSlice';
import {
  ICreateTransactionPayload,
  IDeleteTransactionPayload,
  ITransaction,
  ITransactionFilters,
  IUpdateTransactionPayload,
} from './transactionTypes';

// ============================================
// SAGA: LIST TRANSACTIONS
// ============================================
function* listTransactionsSaga(
  action: PayloadAction<ITransactionFilters>
): Generator<any, void, any> {
  try {
    const filters = action.payload;
    const pagination = yield select(selectTransactionPagination);

    const response: any = yield call(transactionService.getTransactions, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });

    // Handle paginated response from backend
    // After Phase 1: Backend returns { items: [], total, page, limit, totalPages }
    let transactions: ITransaction[] = [];
    let total = 0;
    let page = pagination.page;
    let limit = pagination.limit;

    if (Array.isArray(response)) {
      // Direct array response (fallback)
      transactions = response;
      total = response.length;
    } else if (response && typeof response === 'object') {
      // ✅ Standardized paginated response: { items: [], total, page, limit, totalPages }
      transactions = response.items || response.data || response;
      total = response.total || transactions.length;
      page = response.page || page;
      limit = response.limit || limit;
    }

    yield put(
      transactionActions.listTransactionsSuccess({
        transactions,
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message ? error.message : 'Failed to fetch transactions';
    yield put(transactionActions.listTransactionsFailure(errorMessage));
  }
}

// ============================================
// SAGA: CREATE TRANSACTION
// ============================================
function* createTransactionSaga(
  action: PayloadAction<ICreateTransactionPayload>
): Generator<any, void, any> {
  try {
    const payload = action.payload;

    const response: any = yield call(transactionService.createTransaction, payload);
    // Extract data from wrapped response {success, data, message}
    const newTransaction: ITransaction = response.data || response;

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(transactionActions.createTransactionSuccess(newTransaction));
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message ? error.message : 'Failed to create transaction';
    yield put(transactionActions.createTransactionFailure(errorMessage));
  }
}

// ============================================
// SAGA: UPDATE TRANSACTION
// ============================================
function* updateTransactionSaga(
  action: PayloadAction<IUpdateTransactionPayload>
): Generator<any, void, any> {
  try {
    const { id, ...data } = action.payload;

    const response: any = yield call(transactionService.updateTransaction, id, data);
    // Extract data from wrapped response {success, data, message}
    const updatedTransaction: ITransaction = response.data || response;

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(transactionActions.updateTransactionSuccess(updatedTransaction));
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message ? error.message : 'Failed to update transaction';
    yield put(transactionActions.updateTransactionFailure(errorMessage));
  }
}

// ============================================
// SAGA: DELETE TRANSACTION
// ============================================
function* deleteTransactionSaga(
  action: PayloadAction<IDeleteTransactionPayload>
): Generator<any, void, any> {
  try {
    const { id } = action.payload;

    yield call(transactionService.deleteTransaction, id);

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(transactionActions.deleteTransactionSuccess(id));
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message ? error.message : 'Failed to delete transaction';
    yield put(transactionActions.deleteTransactionFailure(errorMessage));
  }
}

// ============================================
// SAGA: GET SINGLE TRANSACTION
// ============================================
function* getTransactionSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const id = action.payload;

    const response: any = yield call(transactionService.getTransactionById, id);
    // Extract data from wrapped response {success, data, message}
    const transaction: ITransaction = response.data || response;

    yield put(transactionActions.getTransactionSuccess(transaction));
  } catch (error) {
    const errorMessage =
      error instanceof Error && error.message ? error.message : 'Failed to fetch transaction';
    yield put(transactionActions.getTransactionFailure(errorMessage));
  }
}

// ============================================
// ROOT SAGA - WATCHERS
// ============================================
export function* transactionSaga(): Generator<any, void, any> {
  yield takeEvery(transactionActions.listTransactionsRequest.type, listTransactionsSaga);
  yield takeEvery(transactionActions.createTransactionRequest.type, createTransactionSaga);
  yield takeEvery(transactionActions.updateTransactionRequest.type, updateTransactionSaga);
  yield takeEvery(transactionActions.deleteTransactionRequest.type, deleteTransactionSaga);
  yield takeEvery(transactionActions.getTransactionRequest.type, getTransactionSaga);
}
