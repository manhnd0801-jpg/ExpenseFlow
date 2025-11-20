/**
 * Transaction Redux Selectors
 * Memoized selectors for accessing transaction state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';

// ============================================
// BASE SELECTORS
// ============================================

const selectTransactionState = (state: RootState) => state.transactions;

// ============================================
// TRANSACTIONS DATA SELECTORS
// ============================================

export const selectTransactions = createSelector(
  [selectTransactionState],
  (state) => state.transactions
);

export const selectCurrentTransaction = createSelector(
  [selectTransactionState],
  (state) => state.currentTransaction
);

// ============================================
// FILTERS & PAGINATION SELECTORS
// ============================================

export const selectTransactionFilters = createSelector(
  [selectTransactionState],
  (state) => state.filters
);

export const selectTransactionPagination = createSelector(
  [selectTransactionState],
  (state) => state.pagination
);

export const selectTransactionPage = createSelector(
  [selectTransactionState],
  (state) => state.pagination.page
);

export const selectTransactionPageSize = createSelector(
  [selectTransactionState],
  (state) => state.pagination.pageSize
);

export const selectTransactionTotal = createSelector(
  [selectTransactionState],
  (state) => state.pagination.total
);

export const selectTransactionTotalPages = createSelector(
  [selectTransactionState],
  (state) => state.pagination.totalPages
);

// ============================================
// LOADING STATE SELECTORS
// ============================================

export const selectIsTransactionLoading = createSelector(
  [selectTransactionState],
  (state) => state.isLoading
);

export const selectIsTransactionFetching = createSelector(
  [selectTransactionState],
  (state) => state.isFetching
);

export const selectIsTransactionCreating = createSelector(
  [selectTransactionState],
  (state) => state.isCreating
);

export const selectIsTransactionUpdating = createSelector(
  [selectTransactionState],
  (state) => state.isUpdating
);

export const selectIsTransactionDeleting = createSelector(
  [selectTransactionState],
  (state) => state.isDeleting
);

// ============================================
// ERROR SELECTORS
// ============================================

export const selectTransactionError = createSelector(
  [selectTransactionState],
  (state) => state.error
);

export const selectTransactionErrors = createSelector(
  [selectTransactionState],
  (state) => state.errors
);

export const selectTransactionListError = createSelector(
  [selectTransactionState],
  (state) => state.errors.list
);

export const selectTransactionCreateError = createSelector(
  [selectTransactionState],
  (state) => state.errors.create
);

export const selectTransactionUpdateError = createSelector(
  [selectTransactionState],
  (state) => state.errors.update
);

export const selectTransactionDeleteError = createSelector(
  [selectTransactionState],
  (state) => state.errors.delete
);

// ============================================
// SUCCESS MESSAGE SELECTORS
// ============================================

export const selectTransactionSuccessMessage = createSelector(
  [selectTransactionState],
  (state) => state.successMessage
);

// ============================================
// COMPUTED SELECTORS
// ============================================

/**
 * Get total income from all transactions
 */
export const selectTotalIncome = createSelector([selectTransactions], (transactions) => {
  return transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
});

/**
 * Get total expense from all transactions
 */
export const selectTotalExpense = createSelector([selectTransactions], (transactions) => {
  return transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
});

/**
 * Get balance (income - expense)
 */
export const selectBalance = createSelector(
  [selectTotalIncome, selectTotalExpense],
  (income, expense) => income - expense
);

/**
 * Get expense ratio percentage
 */
export const selectExpenseRatio = createSelector(
  [selectTotalIncome, selectTotalExpense],
  (income, expense) => {
    if (income === 0) return 0;
    return (expense / income) * 100;
  }
);

/**
 * Get transactions grouped by category
 */
export const selectTransactionsByCategory = createSelector([selectTransactions], (transactions) => {
  const grouped: Record<string, any[]> = {};
  transactions.forEach((transaction: any) => {
    if (!grouped[transaction.categoryId]) {
      grouped[transaction.categoryId] = [];
    }
    grouped[transaction.categoryId].push(transaction);
  });
  return grouped;
});

/**
 * Get transactions grouped by account
 */
export const selectTransactionsByAccount = createSelector([selectTransactions], (transactions) => {
  const grouped: Record<string, any[]> = {};
  transactions.forEach((transaction: any) => {
    if (!grouped[transaction.accountId]) {
      grouped[transaction.accountId] = [];
    }
    grouped[transaction.accountId].push(transaction);
  });
  return grouped;
});
