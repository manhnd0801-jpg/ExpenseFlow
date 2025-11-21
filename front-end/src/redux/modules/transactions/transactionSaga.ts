/**
 * Transaction Redux-Saga
 * Handles async side effects for transaction operations (API calls)
 */

import { transactionService } from '@/services/api/transactionService';
import { PayloadAction } from '@reduxjs/toolkit';
import { put, select, takeEvery } from 'redux-saga/effects';
import { selectTransactionFilters, selectTransactionPagination } from './transactionSelectors';
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

    const response: ITransaction[] = yield transactionService.listTransactions({
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });

    yield put(
      transactionActions.listTransactionsSuccess({
        transactions: response,
        total: response.length,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
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

    const newTransaction: ITransaction = yield transactionService.createTransaction(payload);

    yield put(transactionActions.createTransactionSuccess(newTransaction));

    // Refresh transaction list
    const filters = yield select(selectTransactionFilters);
    yield put(transactionActions.listTransactionsRequest(filters));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
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
    const payload = action.payload;

    const updatedTransaction: ITransaction = yield transactionService.updateTransaction(payload);

    yield put(transactionActions.updateTransactionSuccess(updatedTransaction));

    // Refresh transaction list
    const filters = yield select(selectTransactionFilters);
    yield put(transactionActions.listTransactionsRequest(filters));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update transaction';
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

    yield transactionService.deleteTransaction(id);

    yield put(transactionActions.deleteTransactionSuccess(id));

    // Refresh transaction list
    const filters = yield select(selectTransactionFilters);
    yield put(transactionActions.listTransactionsRequest(filters));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete transaction';
    yield put(transactionActions.deleteTransactionFailure(errorMessage));
  }
}

// ============================================
// SAGA: GET SINGLE TRANSACTION
// ============================================
function* getTransactionSaga(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const id = action.payload;

    const transaction: ITransaction = yield transactionService.getTransaction(id);

    yield put(transactionActions.getTransactionSuccess(transaction));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transaction';
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
