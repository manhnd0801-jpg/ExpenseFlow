/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { accountReducer } from './modules/accounts';
import { authReducer } from './modules/auth';
import { budgetReducer } from './modules/budgets';
import { categoryReducer } from './modules/categories';
import { debtReducer } from './modules/debts';
import { eventReducer } from './modules/events';
import { goalReducer } from './modules/goals';
import { notificationReducer } from './modules/notifications';
import { reminderReducer } from './modules/reminders';
import { reportReducer } from './modules/reports';
import { transactionReducer } from './modules/transactions';
import rootSaga from './rootSaga';

// Saga middleware
const sagaMiddleware = createSagaMiddleware();

/**
 * Configure Redux store
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    accounts: accountReducer,
    categories: categoryReducer,
    budgets: budgetReducer,
    goals: goalReducer,
    debts: debtReducer,
    events: eventReducer,
    reminders: reminderReducer,
    notifications: notificationReducer,
    reports: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['@@INIT'],
        ignoredPaths: [],
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

// Run root saga
sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
