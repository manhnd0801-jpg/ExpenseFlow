/**
 * Account Redux Saga
 * Handles side effects for account operations (API calls, etc.)
 */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeEvery } from 'redux-saga/effects';
import { accountActions } from './accountSlice';
import {
  IAccount,
  ICreateAccountPayload,
  IDeleteAccountPayload,
  IUpdateAccountPayload,
} from './accountTypes';

// Placeholder for account service (will be implemented)
// import accountService from '@/services/accountService';

/**
 * Watch List Accounts
 */
function* watchListAccounts() {
  try {
    // TODO: Implement API call
    // const response = yield call(accountService.listAccounts, action.payload);

    // Placeholder: Mock data
    const mockAccounts: IAccount[] = [];
    yield put(
      accountActions.listAccountsSuccess({
        accounts: mockAccounts,
        total: 0,
        page: 1,
        pageSize: 10,
      })
    );
  } catch (error: any) {
    yield put(accountActions.listAccountsFailure(error?.message || 'Failed to fetch accounts'));
  }
}

/**
 * Watch Create Account
 */
function* watchCreateAccount(action: PayloadAction<ICreateAccountPayload>) {
  try {
    // TODO: Implement API call
    // const response = yield call(accountService.createAccount, action.payload);

    // Placeholder: Mock data
    const mockAccount: IAccount = {
      id: Math.random().toString(36).substr(2, 9),
      userId: '',
      name: action.payload.name,
      type: action.payload.type,
      balance: action.payload.initialBalance,
      initialBalance: action.payload.initialBalance,
      currency: action.payload.currency || 'VND',
      isActive: true,
      color: action.payload.color,
      icon: action.payload.icon,
      description: action.payload.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    yield put(accountActions.createAccountSuccess(mockAccount));
  } catch (error: any) {
    yield put(accountActions.createAccountFailure(error?.message || 'Failed to create account'));
  }
}

/**
 * Watch Update Account
 */
function* watchUpdateAccount(action: PayloadAction<IUpdateAccountPayload>) {
  try {
    // TODO: Implement API call
    // const response = yield call(accountService.updateAccount, action.payload.id, action.payload);

    // Placeholder: Mock data
    const mockAccount: IAccount = {
      id: action.payload.id,
      userId: '',
      name: action.payload.name || '',
      type: action.payload.type || 1,
      balance: action.payload.balance || 0,
      initialBalance: 0,
      currency: 'VND',
      isActive: action.payload.isActive !== undefined ? action.payload.isActive : true,
      color: action.payload.color,
      icon: action.payload.icon,
      description: action.payload.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    yield put(accountActions.updateAccountSuccess(mockAccount));
  } catch (error: any) {
    yield put(accountActions.updateAccountFailure(error?.message || 'Failed to update account'));
  }
}

/**
 * Watch Delete Account
 */
function* watchDeleteAccount(action: PayloadAction<IDeleteAccountPayload>) {
  try {
    // TODO: Implement API call
    // yield call(accountService.deleteAccount, action.payload.id);

    yield put(accountActions.deleteAccountSuccess({ id: action.payload.id }));
  } catch (error: any) {
    yield put(accountActions.deleteAccountFailure(error?.message || 'Failed to delete account'));
  }
}

/**
 * Watch Get Account Detail
 */
function* watchGetAccountDetail(action: PayloadAction<{ id: string }>) {
  try {
    // TODO: Implement API call
    // const response = yield call(accountService.getAccountDetail, action.payload.id);

    // Placeholder: Mock data
    const mockAccount: IAccount = {
      id: action.payload.id,
      userId: '',
      name: 'My Account',
      type: 1,
      balance: 0,
      initialBalance: 0,
      currency: 'VND',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    yield put(accountActions.getAccountDetailSuccess(mockAccount));
  } catch (error: any) {
    yield put(accountActions.getAccountDetailFailure(error?.message || 'Failed to fetch account'));
  }
}

/**
 * Root Account Saga
 */
export default function* accountSaga() {
  yield takeEvery(accountActions.listAccountsRequest.type, watchListAccounts);
  yield takeEvery(accountActions.createAccountRequest.type, watchCreateAccount);
  yield takeEvery(accountActions.updateAccountRequest.type, watchUpdateAccount);
  yield takeEvery(accountActions.deleteAccountRequest.type, watchDeleteAccount);
  yield takeEvery(accountActions.getAccountDetailRequest.type, watchGetAccountDetail);
}
