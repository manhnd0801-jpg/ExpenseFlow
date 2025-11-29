/**
 * Account Redux Saga
 * Handles side effects for account operations (API calls, etc.)
 */

import { accountService } from '@/services/accountService';
import type { TPaginatedResponse } from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import { accountActions } from './accountSlice';
import {
  IAccount,
  IAccountListQuery,
  ICreateAccountPayload,
  IDeleteAccountPayload,
  ITransferPayload,
  IUpdateAccountPayload,
} from './accountTypes';

/**
 * List Accounts Saga
 */
function* listAccountsSaga(action: PayloadAction<IAccountListQuery>): Generator<any, void, any> {
  try {
    const response: IAccount[] | TPaginatedResponse<IAccount> = yield call(
      accountService.getAccounts
    );

    // Handle paginated response from backend
    // After Phase 1: Backend returns { items: [], total, page, limit, totalPages }
    let accounts: IAccount[] = [];
    let total = 0;
    let page = action.payload.page || 1;
    let limit = action.payload.limit || 10;

    if (Array.isArray(response)) {
      // Direct array response (fallback)
      accounts = response;
      total = response.length;
    } else {
      // ✅ Standardized paginated response: { items: [], total, page, limit, totalPages }
      accounts = response.items;
      total = response.total || 0;
      page = response.page || page;
      limit = response.limit || limit;
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

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(accountActions.createAccountSuccess(newAccount));
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

    const response: any = yield call(accountService.updateAccount, id, updateData); // Extract account data from response
    const updatedAccount: IAccount = response.data || response;

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(accountActions.updateAccountSuccess(updatedAccount));
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

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(accountActions.deleteAccountSuccess({ id }));
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
 * Transfer Between Accounts Saga
 */
function* transferSaga(action: PayloadAction<ITransferPayload>): Generator<any, void, any> {
  try {
    const { fromAccountId, toAccountId, amount, description } = action.payload;

    // Call API to transfer
    yield call(accountService.transfer, fromAccountId, {
      toAccountId,
      amount,
      description,
    });

    // Success - Reload accounts to get updated balances
    yield put(accountActions.transferSuccess({ fromAccountId, toAccountId }));
    yield put(accountActions.listAccountsRequest({}));
  } catch (error: any) {
    yield put(accountActions.transferFailure(error?.message || 'Failed to transfer funds'));
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
  yield takeEvery(accountActions.transferRequest.type, transferSaga);
}
