/**
 * Root Saga
 */

import { fork } from 'redux-saga/effects';
import { accountSaga } from './modules/accounts';
import { authSaga } from './modules/auth';
import { budgetSaga } from './modules/budgets';
import { categorySaga } from './modules/categories';
import { debtSaga } from './modules/debts';
import { eventsSaga } from './modules/events';
import { goalSaga } from './modules/goals';
import { notificationsSaga } from './modules/notifications';
import { remindersSaga } from './modules/reminders';
import { reportsSaga } from './modules/reports';
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
  yield fork(eventsSaga);
  yield fork(remindersSaga);
  yield fork(notificationsSaga);
  yield fork(reportsSaga);
}

export default rootSaga;
