/**
 * Root Saga
 */

import { fork } from 'redux-saga/effects';
import { accountSaga } from './modules/accounts';
import { authSaga } from './modules/auth';
import { budgetSaga } from './modules/budgets';
import { categorySaga } from './modules/categories';
import { debtSaga } from './modules/debts';
import { goalSaga } from './modules/goals';
import { transactionSaga } from './modules/transactions';

/**
 * Root saga that forks all feature sagas
 */
export function* rootSaga() {
  yield fork(authSaga);
  yield fork(transactionSaga);
  yield fork(accountSaga);
  yield fork(categorySaga);
  yield fork(budgetSaga);
  yield fork(goalSaga);
  yield fork(debtSaga);
}

export default rootSaga;
