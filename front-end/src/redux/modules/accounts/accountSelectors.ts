/**
 * Account Redux Selectors
 * Memoized selectors for efficient account state access
 */

import type { RootState } from '@/redux/store';
import { createSelector } from '@reduxjs/toolkit';

// ============================================
// BASE SELECTORS
// ============================================

const selectAccountState = (state: RootState) => state.accounts as any;

// ============================================
// MEMOIZED SELECTORS
// ============================================

export const selectAccounts = createSelector([selectAccountState], (state) => state.accounts);

export const selectCurrentAccount = createSelector(
  [selectAccountState],
  (state) => state.currentAccount
);

export const selectIsAccountLoading = createSelector(
  [selectAccountState],
  (state) => state.isLoading
);

export const selectAccountError = createSelector([selectAccountState], (state) => state.error);

export const selectAccountErrors = createSelector([selectAccountState], (state) => state.errors);

export const selectAccountPagination = createSelector(
  [selectAccountState],
  (state) => state.pagination
);

export const selectAccountFilters = createSelector([selectAccountState], (state) => state.filters);

export const selectAccountLastUpdated = createSelector(
  [selectAccountState],
  (state) => state.lastUpdated
);

// ============================================
// DERIVED SELECTORS
// ============================================

/**
 * Select account by ID
 */
export const selectAccountById = (id: string) =>
  createSelector([selectAccounts], (accounts: any[]) => accounts.find((acc: any) => acc.id === id));

/**
 * Select total account balance (sum of all accounts)
 */
export const selectTotalBalance = createSelector([selectAccounts], (accounts: any[]) =>
  accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0)
);

/**
 * Select active accounts only
 */
export const selectActiveAccounts = createSelector([selectAccounts], (accounts: any[]) =>
  accounts.filter((acc: any) => acc.isActive)
);

/**
 * Select accounts grouped by type
 */
export const selectAccountsByType = createSelector([selectAccounts], (accounts: any[]) => {
  const grouped: Record<number, any[]> = {};
  accounts.forEach((account: any) => {
    if (!grouped[account.type]) {
      grouped[account.type] = [];
    }
    grouped[account.type].push(account);
  });
  return grouped;
});

/**
 * Select empty state status (no accounts exist)
 */
export const selectIsAccountsEmpty = createSelector(
  [selectAccounts],
  (accounts: any[]) => accounts.length === 0
);
