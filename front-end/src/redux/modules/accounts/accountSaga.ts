/**
 * Account Redux Saga
 * Handles side effects for account operations (API calls, etc.)
 */

import { accountService } from '@/services/accountService';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import { accountActions } from './accountSlice';
import {
  IAccount,
  IAccountListQuery,
  ICreateAccountPayload,
  IDeleteAccountPayload,
  IUpdateAccountPayload,
} from './accountTypes';

/**
 * List Accounts Saga
 */
function* listAccountsSaga(action: PayloadAction<IAccountListQuery>): Generator<any, void, any> {
  try {
    const response: any = yield call(accountService.getAccounts);

    // Handle both array response and paginated response from backend
    let accounts: IAccount[] = [];
    let total = 0;
    let page = action.payload.page || 1;
    let limit = action.payload.limit || 10;

    if (Array.isArray(response)) {
      // Direct array response
      accounts = response;
      total = response.length;
    } else if (response && typeof response === 'object') {
      // Paginated response: { data: [], pagination: {...} }
      accounts = response.data || response;
      total = response.pagination?.total || response.total || accounts.length;
      page = response.pagination?.page || response.page || page;
      limit = response.pagination?.limit || response.limit || limit;
    }

    yield put(
      accountActions.listAccountsSuccess({
        accounts,
        total,
        page,
        limit,
      })
    );
  } catch (error: any) {
    yield put(accountActions.listAccountsFailure(error?.message || 'Failed to fetch accounts'));
  }
}

/**
 * Create Account Saga
 */
function* createAccountSaga(
  action: PayloadAction<ICreateAccountPayload>
): Generator<any, void, any> {
  try {
    // Map payload to API request format
    const { initialBalance, ...restPayload } = action.payload;
    const requestData = {
      ...restPayload,
      balance: initialBalance, // Map initialBalance to balance for API
    };

    // @ts-ignore - Redux Saga call effect type inference issue
    const newAccount: IAccount = yield call(accountService.createAccount, requestData);

    yield put(accountActions.createAccountSuccess(newAccount));

    // Refresh account list
    yield put(accountActions.listAccountsRequest({ page: 1, limit: 10 }));
  } catch (error: any) {
    yield put(accountActions.createAccountFailure(error?.message || 'Failed to create account'));
  }
}

/**
 * Update Account Saga
 */
function* updateAccountSaga(
  action: PayloadAction<IUpdateAccountPayload>
): Generator<any, void, any> {
  try {
    const { id, ...updateData } = action.payload;
    const updatedAccount: IAccount = yield call(accountService.updateAccount, id, updateData);

    yield put(accountActions.updateAccountSuccess(updatedAccount));

    // Refresh account list
    yield put(accountActions.listAccountsRequest({ page: 1, limit: 10 }));
  } catch (error: any) {
    yield put(accountActions.updateAccountFailure(error?.message || 'Failed to update account'));
  }
}

/**
 * Delete Account Saga
 */
function* deleteAccountSaga(
  action: PayloadAction<IDeleteAccountPayload>
): Generator<any, void, any> {
  try {
    const { id } = action.payload;
    yield call(accountService.deleteAccount, id);

    yield put(accountActions.deleteAccountSuccess({ id }));

    // Refresh account list
    yield put(accountActions.listAccountsRequest({ page: 1, limit: 10 }));
  } catch (error: any) {
    yield put(accountActions.deleteAccountFailure(error?.message || 'Failed to delete account'));
  }
}

/**
 * Get Account Detail Saga
 */
function* getAccountDetailSaga(action: PayloadAction<{ id: string }>): Generator<any, void, any> {
  try {
    const { id } = action.payload;
    const account: IAccount = yield call(accountService.getAccountById, id);

    yield put(accountActions.getAccountDetailSuccess(account));
  } catch (error: any) {
    yield put(accountActions.getAccountDetailFailure(error?.message || 'Failed to fetch account'));
  }
}

/**
 * Root Account Saga
 */
export default function* accountSaga() {
  yield takeEvery(accountActions.listAccountsRequest.type, listAccountsSaga);
  yield takeEvery(accountActions.createAccountRequest.type, createAccountSaga);
  yield takeEvery(accountActions.updateAccountRequest.type, updateAccountSaga);
  yield takeEvery(accountActions.deleteAccountRequest.type, deleteAccountSaga);
  yield takeEvery(accountActions.getAccountDetailRequest.type, getAccountDetailSaga);
}
