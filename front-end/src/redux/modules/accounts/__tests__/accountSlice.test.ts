/**
 * Account Slice Tests - C2 Coverage (Condition Coverage)
 * Tests all branches and conditions in account Redux slice reducers
 */

import { AccountType, Currency } from '@/constants/enums';
import { describe, expect, it } from 'vitest';
import { accountActions, accountReducer } from '../accountSlice';
import { IAccount, IAccountState, initialAccountState } from '../accountTypes';

// Destructure actions for cleaner test code
const {
  listAccountsRequest,
  listAccountsSuccess,
  listAccountsFailure,
  createAccountRequest,
  createAccountSuccess,
  createAccountFailure,
  updateAccountRequest,
  updateAccountSuccess,
  updateAccountFailure,
  deleteAccountRequest,
  deleteAccountSuccess,
  deleteAccountFailure,
  getAccountDetailRequest,
  getAccountDetailSuccess,
  getAccountDetailFailure,
  setAccountFilters,
  setAccountPage,
  clearAccountErrors,
  resetAccountState,
} = accountActions;

describe('accountSlice - C2 Coverage', () => {
  // Mock account data
  const mockAccount: IAccount = {
    id: 'acc-1',
    userId: 'user-1',
    name: 'Test Account',
    type: AccountType.CASH,
    balance: 1000000,
    initialBalance: 1000000,
    currency: Currency.VND,
    isActive: true,
    color: '#4CAF50',
    icon: 'wallet',
    description: 'Test account',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockAccount2: IAccount = {
    ...mockAccount,
    id: 'acc-2',
    name: 'Bank Account',
    type: AccountType.BANK,
    balance: 5000000,
  };

  // ============================================
  // LIST ACCOUNTS - C2 Coverage
  // ============================================
  describe('List Accounts Actions', () => {
    it('should handle listAccountsRequest - set loading true and clear errors', () => {
      const state = accountReducer(
        initialAccountState,
        listAccountsRequest({ page: 1, limit: 10 })
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.errors.list).toBeUndefined();
    });

    it('should handle listAccountsSuccess - populate accounts from empty state', () => {
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        listAccountsSuccess({
          accounts: [mockAccount, mockAccount2],
          total: 2,
          page: 1,
          limit: 10,
        })
      );

      expect(state.accounts).toHaveLength(2);
      expect(state.accounts[0]).toEqual(mockAccount);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.errors.list).toBeUndefined();
      expect(state.pagination.total).toBe(2);
      expect(state.pagination.totalPages).toBe(1); // Math.ceil(2 / 10) = 1
      expect(state.lastUpdated).toBeDefined();
    });

    it('should handle listAccountsSuccess - calculate totalPages correctly (C2: division branch)', () => {
      const state = accountReducer(
        initialAccountState,
        listAccountsSuccess({
          accounts: [mockAccount],
          total: 25,
          page: 1,
          limit: 10,
        })
      );

      expect(state.pagination.totalPages).toBe(3); // Math.ceil(25 / 10) = 3
    });

    it('should handle listAccountsFailure - set error message', () => {
      const errorMsg = 'Failed to load accounts';
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        listAccountsFailure(errorMsg)
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMsg);
      expect(state.errors.list).toBe(errorMsg);
    });
  });

  // ============================================
  // CREATE ACCOUNT - C2 Coverage
  // ============================================
  describe('Create Account Actions', () => {
    it('should handle createAccountRequest - set loading and clear errors', () => {
      const state = accountReducer(
        initialAccountState,
        createAccountRequest({
          name: 'New Account',
          type: AccountType.BANK,
          initialBalance: 1000000,
        })
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.errors.create).toBeUndefined();
    });

    it('should handle createAccountSuccess - add to empty accounts array (C2: unshift to empty)', () => {
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        createAccountSuccess(mockAccount)
      );

      expect(state.accounts).toHaveLength(1);
      expect(state.accounts[0]).toEqual(mockAccount);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.errors.create).toBeUndefined();
    });

    it('should handle createAccountSuccess - prepend to existing accounts (C2: unshift to non-empty)', () => {
      const existingState: IAccountState = {
        ...initialAccountState,
        accounts: [mockAccount2],
        isLoading: true,
      };

      const state = accountReducer(existingState, createAccountSuccess(mockAccount));

      expect(state.accounts).toHaveLength(2);
      expect(state.accounts[0]).toEqual(mockAccount); // New account at start
      expect(state.accounts[1]).toEqual(mockAccount2); // Old account after
    });

    it('should handle createAccountFailure - set error message', () => {
      const errorMsg = 'Failed to create account';
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        createAccountFailure(errorMsg)
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMsg);
      expect(state.errors.create).toBe(errorMsg);
    });
  });

  // ============================================
  // UPDATE ACCOUNT - C2 Coverage
  // ============================================
  describe('Update Account Actions', () => {
    it('should handle updateAccountRequest - set loading and clear errors', () => {
      const state = accountReducer(
        initialAccountState,
        updateAccountRequest({
          id: 'acc-1',
          name: 'Updated Name',
        })
      );

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.errors.update).toBeUndefined();
    });

    it('should handle updateAccountSuccess - update existing account (C2: index > -1)', () => {
      const existingState: IAccountState = {
        ...initialAccountState,
        accounts: [mockAccount, mockAccount2],
        isLoading: true,
      };

      const updatedAccount = { ...mockAccount, name: 'Updated Account' };
      const state = accountReducer(existingState, updateAccountSuccess(updatedAccount));

      expect(state.accounts[0].name).toBe('Updated Account');
      expect(state.accounts).toHaveLength(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.errors.update).toBeUndefined();
    });

    it('should handle updateAccountSuccess - account not found (C2: index === -1)', () => {
      const existingState: IAccountState = {
        ...initialAccountState,
        accounts: [mockAccount],
        isLoading: true,
      };

      const nonExistentAccount = { ...mockAccount2, id: 'acc-999' };
      const state = accountReducer(existingState, updateAccountSuccess(nonExistentAccount));

      // Should not modify accounts array if account not found
      expect(state.accounts).toHaveLength(1);
      expect(state.accounts[0]).toEqual(mockAccount);
      expect(state.isLoading).toBe(false);
    });

    it('should handle updateAccountFailure - set error message', () => {
      const errorMsg = 'Failed to update account';
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        updateAccountFailure(errorMsg)
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMsg);
      expect(state.errors.update).toBe(errorMsg);
    });
  });

  // ============================================
  // DELETE ACCOUNT - C2 Coverage
  // ============================================
  describe('Delete Account Actions', () => {
    it('should handle deleteAccountRequest - set loading and clear errors', () => {
      const state = accountReducer(initialAccountState, deleteAccountRequest({ id: 'acc-1' }));

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.errors.delete).toBeUndefined();
    });

    it('should handle deleteAccountSuccess - remove account from array (C2: filter found)', () => {
      const existingState: IAccountState = {
        ...initialAccountState,
        accounts: [mockAccount, mockAccount2],
        isLoading: true,
      };

      const state = accountReducer(existingState, deleteAccountSuccess({ id: 'acc-1' }));

      expect(state.accounts).toHaveLength(1);
      expect(state.accounts[0].id).toBe('acc-2');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.errors.delete).toBeUndefined();
    });

    it('should handle deleteAccountSuccess - account not found (C2: filter not found)', () => {
      const existingState: IAccountState = {
        ...initialAccountState,
        accounts: [mockAccount],
        isLoading: true,
      };

      const state = accountReducer(existingState, deleteAccountSuccess({ id: 'acc-999' }));

      // Should keep all accounts if id not found
      expect(state.accounts).toHaveLength(1);
      expect(state.accounts[0]).toEqual(mockAccount);
    });

    it('should handle deleteAccountFailure - set error message', () => {
      const errorMsg = 'Failed to delete account';
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        deleteAccountFailure(errorMsg)
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMsg);
      expect(state.errors.delete).toBe(errorMsg);
    });
  });

  // ============================================
  // GET ACCOUNT DETAIL - C2 Coverage
  // ============================================
  describe('Get Account Detail Actions', () => {
    it('should handle getAccountDetailRequest - set loading and clear error', () => {
      const state = accountReducer(initialAccountState, getAccountDetailRequest({ id: 'acc-1' }));

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle getAccountDetailSuccess - set currentAccount', () => {
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        getAccountDetailSuccess(mockAccount)
      );

      expect(state.currentAccount).toEqual(mockAccount);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle getAccountDetailFailure - set error message', () => {
      const errorMsg = 'Account not found';
      const state = accountReducer(
        { ...initialAccountState, isLoading: true },
        getAccountDetailFailure(errorMsg)
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMsg);
    });
  });

  // ============================================
  // FILTERS & PAGINATION - C2 Coverage
  // ============================================
  describe('Filters and Pagination Actions', () => {
    it('should handle setAccountFilters - update filters and reset to page 1', () => {
      const existingState: IAccountState = {
        ...initialAccountState,
        pagination: { ...initialAccountState.pagination, page: 3 },
      };

      const filters = {
        isActive: true,
        type: AccountType.BANK,
        searchText: 'test',
      };
      const state = accountReducer(existingState, setAccountFilters(filters));

      expect(state.filters).toEqual(filters);
      expect(state.pagination.page).toBe(1); // Should reset to page 1
    });

    it('should handle setAccountPage - update page number', () => {
      const state = accountReducer(initialAccountState, setAccountPage(5));

      expect(state.pagination.page).toBe(5);
    });
  });

  // ============================================
  // CLEAR ERRORS & RESET - C2 Coverage
  // ============================================
  describe('Clear Errors and Reset Actions', () => {
    it('should handle clearAccountErrors - clear all error states', () => {
      const errorState: IAccountState = {
        ...initialAccountState,
        error: 'Some error',
        errors: {
          list: 'List error',
          create: 'Create error',
          update: 'Update error',
          delete: 'Delete error',
        },
      };

      const state = accountReducer(errorState, clearAccountErrors());

      expect(state.error).toBeNull();
      expect(state.errors).toEqual({});
    });

    it('should handle resetAccountState - return to initial state', () => {
      const modifiedState: IAccountState = {
        ...initialAccountState,
        accounts: [mockAccount, mockAccount2],
        currentAccount: mockAccount,
        isLoading: true,
        error: 'Some error',
        pagination: { page: 3, limit: 20, total: 50, totalPages: 3 },
      };

      const state = accountReducer(modifiedState, resetAccountState());

      expect(state).toEqual(initialAccountState);
      expect(state.accounts).toHaveLength(0);
      expect(state.currentAccount).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should handle multiple operations maintaining state consistency', () => {
      let state = initialAccountState;

      // Create account
      state = accountReducer(state, createAccountSuccess(mockAccount));
      expect(state.accounts).toHaveLength(1);

      // Update account
      const updated = { ...mockAccount, name: 'Updated' };
      state = accountReducer(state, updateAccountSuccess(updated));
      expect(state.accounts[0].name).toBe('Updated');

      // Create another account
      state = accountReducer(state, createAccountSuccess(mockAccount2));
      expect(state.accounts).toHaveLength(2);

      // Delete first account
      state = accountReducer(state, deleteAccountSuccess({ id: 'acc-1' }));
      expect(state.accounts).toHaveLength(1);
      expect(state.accounts[0].id).toBe('acc-2');
    });

    it('should handle empty accounts array operations (C2: empty array branches)', () => {
      // Update on empty array
      let state = accountReducer(initialAccountState, updateAccountSuccess(mockAccount));
      expect(state.accounts).toHaveLength(0); // Should not add

      // Delete on empty array
      state = accountReducer(initialAccountState, deleteAccountSuccess({ id: 'acc-1' }));
      expect(state.accounts).toHaveLength(0);
    });

    it('should handle pagination with zero total (C2: Math.ceil edge case)', () => {
      const state = accountReducer(
        initialAccountState,
        listAccountsSuccess({
          accounts: [],
          total: 0,
          page: 1,
          limit: 10,
        })
      );

      expect(state.pagination.totalPages).toBe(0); // Math.ceil(0 / 10) = 0
      expect(state.accounts).toHaveLength(0);
    });
  });
});
