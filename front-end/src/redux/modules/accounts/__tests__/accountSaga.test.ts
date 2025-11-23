/**
 * Account Saga Integration Tests - C2 Coverage
 * Tests saga flows with API mocking for all conditional branches
 */

import { AccountType, Currency } from '@/constants/enums';
import { accountService } from '@/services/accountService';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { describe, it } from 'vitest';
import accountSaga from '../accountSaga';
import { accountActions } from '../accountSlice';
import { IAccount } from '../accountTypes';

// Mock account data
const mockAccount: IAccount = {
  id: 'acc-1',
  userId: 'user-1',
  name: 'Cash Wallet',
  type: AccountType.CASH,
  balance: 1000000,
  initialBalance: 1000000,
  currency: Currency.VND,
  isActive: true,
  color: '#4CAF50',
  icon: 'wallet',
  description: 'Main cash wallet',
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

describe('accountSaga - C2 Coverage', () => {
  // ============================================
  // LIST ACCOUNTS - C2 Coverage
  // ============================================
  describe('List Accounts Flow', () => {
    it('should handle array response successfully (C2: Array.isArray branch)', async () => {
      const accounts = [mockAccount, mockAccount2];

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), accounts]])
        .put(
          accountActions.listAccountsSuccess({
            accounts,
            total: 2,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle paginated response successfully (C2: object with pagination)', async () => {
      const paginatedResponse = {
        data: [mockAccount, mockAccount2],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), paginatedResponse]])
        .put(
          accountActions.listAccountsSuccess({
            accounts: [mockAccount, mockAccount2],
            total: 2,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle response without pagination (C2: fallback to array length)', async () => {
      const response = {
        data: [mockAccount],
      };

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), response]])
        .put(
          accountActions.listAccountsSuccess({
            accounts: [mockAccount],
            total: 1,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle empty array response (C2: empty array branch)', async () => {
      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), []]])
        .put(
          accountActions.listAccountsSuccess({
            accounts: [],
            total: 0,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle API error with message (C2: error.message exists)', async () => {
      const error = new Error('Network error');

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), throwError(error)]])
        .put(accountActions.listAccountsFailure('Network error'))
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle API error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), throwError(error)]])
        .put(accountActions.listAccountsFailure('Failed to fetch accounts'))
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should use custom page/limit from action (C2: custom pagination)', async () => {
      const accounts = [mockAccount];

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), accounts]])
        .put(
          accountActions.listAccountsSuccess({
            accounts,
            total: 1,
            page: 3,
            limit: 20,
          })
        )
        .dispatch(accountActions.listAccountsRequest({ page: 3, limit: 20 }))
        .silentRun();
    });

    it('should use default page/limit when not provided (C2: undefined pagination)', async () => {
      const accounts = [mockAccount];

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), accounts]])
        .put(
          accountActions.listAccountsSuccess({
            accounts,
            total: 1,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(accountActions.listAccountsRequest({}))
        .silentRun();
    });
  });

  // ============================================
  // CREATE ACCOUNT - C2 Coverage
  // ============================================
  describe('Create Account Flow', () => {
    const createPayload = {
      name: 'New Account',
      type: AccountType.BANK,
      initialBalance: 1000000,
      currency: Currency.VND,
      color: '#FF5722',
      icon: 'bank',
    };

    it('should create account and refresh list (C2: success path)', async () => {
      await expectSaga(accountSaga)
        .provide([
          [matchers.call.fn(accountService.createAccount), mockAccount],
          [matchers.call.fn(accountService.getAccounts), [mockAccount]],
        ])
        .put(accountActions.createAccountSuccess(mockAccount))
        .put(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .dispatch(accountActions.createAccountRequest(createPayload))
        .silentRun();
    });

    it('should map initialBalance to balance in API request (C2: payload transformation)', async () => {
      const createPayload = {
        name: 'Test Account',
        type: AccountType.CASH,
        initialBalance: 500000,
        currency: Currency.VND,
      };

      await expectSaga(accountSaga)
        .provide([
          [
            matchers.call(accountService.createAccount, {
              name: 'Test Account',
              type: AccountType.CASH,
              balance: 500000, // initialBalance mapped to balance
              currency: Currency.VND,
            }),
            mockAccount,
          ],
          [matchers.call.fn(accountService.getAccounts), [mockAccount]],
        ])
        .put(accountActions.createAccountSuccess(mockAccount))
        .dispatch(accountActions.createAccountRequest(createPayload))
        .silentRun();
    });

    it('should handle create error with message (C2: error.message exists)', async () => {
      const error = new Error('Validation failed');

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.createAccount), throwError(error)]])
        .put(accountActions.createAccountFailure('Validation failed'))
        .not.put(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .dispatch(accountActions.createAccountRequest(createPayload))
        .silentRun();
    });

    it('should handle create error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.createAccount), throwError(error)]])
        .put(accountActions.createAccountFailure('Failed to create account'))
        .dispatch(accountActions.createAccountRequest(createPayload))
        .silentRun();
    });
  });

  // ============================================
  // UPDATE ACCOUNT - C2 Coverage
  // ============================================
  describe('Update Account Flow', () => {
    const updatePayload = {
      id: 'acc-1',
      name: 'Updated Account',
      color: '#2196F3',
      description: 'Updated description',
    };

    it('should update account and refresh list (C2: success path)', async () => {
      const updatedAccount = { ...mockAccount, name: 'Updated Account' };

      await expectSaga(accountSaga)
        .provide([
          [matchers.call.fn(accountService.updateAccount), updatedAccount],
          [matchers.call.fn(accountService.getAccounts), [updatedAccount]],
        ])
        .put(accountActions.updateAccountSuccess(updatedAccount))
        .put(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .dispatch(accountActions.updateAccountRequest(updatePayload))
        .silentRun();
    });

    it('should destructure id from payload correctly (C2: payload extraction)', async () => {
      const updatePayload = {
        id: 'acc-1',
        name: 'Test',
        color: '#000',
      };
      const updatedAccount = { ...mockAccount, name: 'Test' };

      await expectSaga(accountSaga)
        .provide([
          [
            matchers.call(accountService.updateAccount, 'acc-1', {
              name: 'Test',
              color: '#000',
            }),
            updatedAccount,
          ],
          [matchers.call.fn(accountService.getAccounts), [updatedAccount]],
        ])
        .put(accountActions.updateAccountSuccess(updatedAccount))
        .dispatch(accountActions.updateAccountRequest(updatePayload))
        .silentRun();
    });

    it('should handle update error with message (C2: error.message exists)', async () => {
      const error = new Error('Account not found');

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.updateAccount), throwError(error)]])
        .put(accountActions.updateAccountFailure('Account not found'))
        .not.put(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .dispatch(accountActions.updateAccountRequest(updatePayload))
        .silentRun();
    });

    it('should handle update error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.updateAccount), throwError(error)]])
        .put(accountActions.updateAccountFailure('Failed to update account'))
        .dispatch(accountActions.updateAccountRequest(updatePayload))
        .silentRun();
    });
  });

  // ============================================
  // DELETE ACCOUNT - C2 Coverage
  // ============================================
  describe('Delete Account Flow', () => {
    const deletePayload = { id: 'acc-1' };

    it('should delete account and refresh list (C2: success path)', async () => {
      await expectSaga(accountSaga)
        .provide([
          [matchers.call.fn(accountService.deleteAccount), undefined],
          [matchers.call.fn(accountService.getAccounts), []],
        ])
        .put(accountActions.deleteAccountSuccess({ id: 'acc-1' }))
        .put(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .dispatch(accountActions.deleteAccountRequest(deletePayload))
        .silentRun();
    });

    it('should extract id from payload correctly (C2: payload extraction)', async () => {
      await expectSaga(accountSaga)
        .provide([
          [matchers.call(accountService.deleteAccount, 'acc-to-delete'), undefined],
          [matchers.call.fn(accountService.getAccounts), []],
        ])
        .put(accountActions.deleteAccountSuccess({ id: 'acc-to-delete' }))
        .dispatch(accountActions.deleteAccountRequest({ id: 'acc-to-delete' }))
        .silentRun();
    });

    it('should handle delete error with message (C2: error.message exists)', async () => {
      const error = new Error('Cannot delete account with transactions');

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.deleteAccount), throwError(error)]])
        .put(accountActions.deleteAccountFailure('Cannot delete account with transactions'))
        .not.put(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .dispatch(accountActions.deleteAccountRequest(deletePayload))
        .silentRun();
    });

    it('should handle delete error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.deleteAccount), throwError(error)]])
        .put(accountActions.deleteAccountFailure('Failed to delete account'))
        .dispatch(accountActions.deleteAccountRequest(deletePayload))
        .silentRun();
    });
  });

  // ============================================
  // GET ACCOUNT DETAIL - C2 Coverage
  // ============================================
  describe('Get Account Detail Flow', () => {
    const detailPayload = { id: 'acc-1' };

    it('should get account detail successfully (C2: success path)', async () => {
      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccountById), mockAccount]])
        .put(accountActions.getAccountDetailSuccess(mockAccount))
        .dispatch(accountActions.getAccountDetailRequest(detailPayload))
        .silentRun();
    });

    it('should extract id from payload correctly (C2: payload extraction)', async () => {
      await expectSaga(accountSaga)
        .provide([[matchers.call(accountService.getAccountById, 'acc-detail'), mockAccount]])
        .put(accountActions.getAccountDetailSuccess(mockAccount))
        .dispatch(accountActions.getAccountDetailRequest({ id: 'acc-detail' }))
        .silentRun();
    });

    it('should handle get detail error with message (C2: error.message exists)', async () => {
      const error = new Error('Account not found');

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccountById), throwError(error)]])
        .put(accountActions.getAccountDetailFailure('Account not found'))
        .dispatch(accountActions.getAccountDetailRequest(detailPayload))
        .silentRun();
    });

    it('should handle get detail error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccountById), throwError(error)]])
        .put(accountActions.getAccountDetailFailure('Failed to fetch account'))
        .dispatch(accountActions.getAccountDetailRequest(detailPayload))
        .silentRun();
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should handle response with top-level total/page (C2: alternate structure)', async () => {
      const response = {
        data: [mockAccount, mockAccount2],
        total: 5,
        page: 2,
        limit: 10,
      };

      await expectSaga(accountSaga)
        .provide([[matchers.call.fn(accountService.getAccounts), response]])
        .put(
          accountActions.listAccountsSuccess({
            accounts: [mockAccount, mockAccount2],
            total: 5,
            page: 2,
            limit: 10,
          })
        )
        .dispatch(accountActions.listAccountsRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle create with all optional fields (C2: full payload)', async () => {
      const fullPayload = {
        name: 'Complete Account',
        type: AccountType.CREDIT_CARD,
        initialBalance: 0,
        currency: Currency.USD,
        color: '#9C27B0',
        icon: 'credit-card',
        description: 'Full description',
      };

      await expectSaga(accountSaga)
        .provide([
          [matchers.call.fn(accountService.createAccount), mockAccount],
          [matchers.call.fn(accountService.getAccounts), [mockAccount]],
        ])
        .put(accountActions.createAccountSuccess(mockAccount))
        .dispatch(accountActions.createAccountRequest(fullPayload))
        .silentRun();
    });

    it('should handle update with minimal fields (C2: partial payload)', async () => {
      const minimalPayload = {
        id: 'acc-1',
        name: 'New Name',
      };
      const updatedAccount = { ...mockAccount, name: 'New Name' };

      await expectSaga(accountSaga)
        .provide([
          [matchers.call.fn(accountService.updateAccount), updatedAccount],
          [matchers.call.fn(accountService.getAccounts), [updatedAccount]],
        ])
        .put(accountActions.updateAccountSuccess(updatedAccount))
        .dispatch(accountActions.updateAccountRequest(minimalPayload))
        .silentRun();
    });
  });
});
