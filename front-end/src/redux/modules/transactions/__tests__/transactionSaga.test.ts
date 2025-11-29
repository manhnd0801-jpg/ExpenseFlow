/**
 * transactionSaga Tests - C2 Coverage
 * Tests all async transaction operations with various response formats
 */

import { transactionService } from '@/services/transactionService';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { beforeEach, describe, it, vi } from 'vitest';
import { transactionSaga } from '../transactionSaga';
import { transactionActions } from '../transactionSlice';
import type {
  ICreateTransactionPayload,
  ITransaction,
  IUpdateTransactionPayload,
} from '../transactionTypes';

describe('transactionSaga - C2 Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // LIST TRANSACTIONS FLOW - C2 Coverage
  // ============================================
  describe('List Transactions Flow', () => {
    const mockFilters = { type: 1, startDate: '2025-01-01', endDate: '2025-12-31' };
    const mockPagination = { page: 1, limit: 10, total: 0 };

    it('should handle array response (C2: Array.isArray branch)', async () => {
      const mockTransactions: ITransaction[] = [
        {
          id: '1',
          amount: 100000,
          type: 1,
          date: '2025-01-15',
          description: 'Lunch',
          categoryId: 'cat1',
          accountId: 'acc1',
          userId: 'user1',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
        },
        {
          id: '2',
          amount: 200000,
          type: 2,
          date: '2025-01-16',
          description: 'Salary',
          categoryId: 'cat2',
          accountId: 'acc2',
          userId: 'user1',
          createdAt: '2025-01-16T10:00:00Z',
          updatedAt: '2025-01-16T10:00:00Z',
        },
      ];

      // C2: Tests Array.isArray(response) === true branch
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), mockTransactions]])
        .put(
          transactionActions.listTransactionsSuccess({
            transactions: mockTransactions,
            total: 2,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should handle paginated response (C2: object with pagination)', async () => {
      const mockTransactions: ITransaction[] = [
        {
          id: '1',
          amount: 100000,
          type: 1,
          date: '2025-01-15',
          description: 'Lunch',
          categoryId: 'cat1',
          accountId: 'acc1',
          userId: 'user1',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
        },
      ];

      const paginatedResponse = {
        data: mockTransactions,
        pagination: { page: 2, limit: 20, total: 50 },
      };

      // C2: Tests typeof response === 'object' && response.pagination branch
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), paginatedResponse]])
        .put(
          transactionActions.listTransactionsSuccess({
            transactions: mockTransactions,
            total: 50,
            page: 2,
            limit: 20,
          })
        )
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should handle response without pagination object (C2: fallback to array length)', async () => {
      const mockTransactions: ITransaction[] = [
        {
          id: '1',
          amount: 100000,
          type: 1,
          date: '2025-01-15',
          description: 'Lunch',
          categoryId: 'cat1',
          accountId: 'acc1',
          userId: 'user1',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
        },
      ];

      const responseWithoutPagination = {
        data: mockTransactions,
        total: 10,
      };

      // C2: Tests response.pagination fallback to response.total
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([
          [matchers.call.fn(transactionService.listTransactions), responseWithoutPagination],
        ])
        .put(
          transactionActions.listTransactionsSuccess({
            transactions: mockTransactions,
            total: 10,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should handle empty array response (C2: empty array branch)', async () => {
      // C2: Tests Array.isArray with empty array
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), []]])
        .put(
          transactionActions.listTransactionsSuccess({
            transactions: [],
            total: 0,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should handle error with message (C2: error.message exists)', async () => {
      const error = new Error('Network error');

      // C2: Tests error instanceof Error && error.message branch
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), throwError(error)]])
        .put(transactionActions.listTransactionsFailure('Network error'))
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should handle error without message (C2: fallback error message)', async () => {
      const error = new Error();
      error.name = 'NetworkError';

      // C2: Tests error not instanceof Error → fallback message
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), throwError(error)]])
        .put(transactionActions.listTransactionsFailure('Failed to fetch transactions'))
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should use custom page and limit from state (C2: custom pagination)', async () => {
      const customPagination = { page: 3, limit: 50, total: 100 };

      // C2: Tests custom pagination values from state
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: customPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), []]])
        .call(transactionService.listTransactions, {
          ...mockFilters,
          page: 3,
          limit: 50,
        })
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });

    it('should handle response with top-level pagination fields (C2: alternate structure)', async () => {
      const mockTransactions: ITransaction[] = [
        {
          id: '1',
          amount: 100000,
          type: 1,
          date: '2025-01-15',
          description: 'Lunch',
          categoryId: 'cat1',
          accountId: 'acc1',
          userId: 'user1',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
        },
      ];

      const alternateResponse = {
        data: mockTransactions,
        page: 2,
        limit: 15,
        total: 30,
      };

      // C2: Tests response.page || response.pagination.page fallback
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: mockPagination },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), alternateResponse]])
        .put(
          transactionActions.listTransactionsSuccess({
            transactions: mockTransactions,
            total: 30,
            page: 2,
            limit: 15,
          })
        )
        .dispatch(transactionActions.listTransactionsRequest(mockFilters))
        .silentRun();
    });
  });

  // ============================================
  // CREATE TRANSACTION FLOW - C2 Coverage
  // ============================================
  describe('Create Transaction Flow', () => {
    const mockFilters = {};
    const mockPayload: ICreateTransactionPayload = {
      amount: 150000,
      type: 1,
      date: '2025-01-20',
      description: 'Dinner',
      categoryId: 'cat1',
      accountId: 'acc1',
    };

    const mockCreatedTransaction: ITransaction = {
      id: 'new-1',
      ...mockPayload,
      userId: 'user1',
      createdAt: '2025-01-20T10:00:00Z',
      updatedAt: '2025-01-20T10:00:00Z',
    };

    it('should create transaction and refresh list (C2: success path)', async () => {
      // C2: Tests successful create + refresh flow
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([
          [matchers.call.fn(transactionService.createTransaction), mockCreatedTransaction],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .put(transactionActions.createTransactionSuccess(mockCreatedTransaction))
        .put(transactionActions.listTransactionsRequest(mockFilters))
        .dispatch(transactionActions.createTransactionRequest(mockPayload))
        .silentRun();
    });

    it('should handle full payload with all optional fields (C2: complete payload)', async () => {
      const fullPayload: ICreateTransactionPayload = {
        amount: 150000,
        type: 1,
        date: '2025-01-20',
        description: 'Dinner with notes',
        categoryId: 'cat1',
        accountId: 'acc1',
        tags: ['food', 'dinner'],
        note: 'Business dinner',
        eventId: 'event1',
      };

      const mockCreated: ITransaction = {
        id: 'new-1',
        ...fullPayload,
        userId: 'user1',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      // C2: Tests create with all optional fields present
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([
          [matchers.call.fn(transactionService.createTransaction), mockCreated],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .call(transactionService.createTransaction, fullPayload)
        .put(transactionActions.createTransactionSuccess(mockCreated))
        .dispatch(transactionActions.createTransactionRequest(fullPayload))
        .silentRun();
    });

    it('should handle error with message (C2: error.message exists)', async () => {
      const error = new Error('Validation failed');

      // C2: Tests error instanceof Error && error.message branch
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([[matchers.call.fn(transactionService.createTransaction), throwError(error)]])
        .put(transactionActions.createTransactionFailure('Validation failed'))
        .dispatch(transactionActions.createTransactionRequest(mockPayload))
        .silentRun();
    });

    it('should handle error without message (C2: fallback error message)', async () => {
      const error = new Error();
      error.name = 'ValidationError';

      // C2: Tests error without message → fallback message
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([[matchers.call.fn(transactionService.createTransaction), throwError(error)]])
        .put(transactionActions.createTransactionFailure('Failed to create transaction'))
        .dispatch(transactionActions.createTransactionRequest(mockPayload))
        .silentRun();
    });
  });

  // ============================================
  // UPDATE TRANSACTION FLOW - C2 Coverage
  // ============================================
  describe('Update Transaction Flow', () => {
    const mockFilters = {};
    const mockPayload: IUpdateTransactionPayload = {
      id: 'tx1',
      amount: 200000,
      description: 'Updated description',
    };

    const mockUpdatedTransaction: ITransaction = {
      id: 'tx1',
      amount: 200000,
      type: 1,
      date: '2025-01-20',
      description: 'Updated description',
      categoryId: 'cat1',
      accountId: 'acc1',
      userId: 'user1',
      createdAt: '2025-01-20T10:00:00Z',
      updatedAt: '2025-01-20T11:00:00Z',
    };

    it('should update transaction and refresh list (C2: success path)', async () => {
      // C2: Tests successful update + refresh flow
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([
          [matchers.call.fn(transactionService.updateTransaction), mockUpdatedTransaction],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .put(transactionActions.updateTransactionSuccess(mockUpdatedTransaction))
        .put(transactionActions.listTransactionsRequest(mockFilters))
        .dispatch(transactionActions.updateTransactionRequest(mockPayload))
        .silentRun();
    });

    it('should handle minimal update payload (C2: minimal payload)', async () => {
      const minimalPayload: IUpdateTransactionPayload = {
        id: 'tx1',
        amount: 150000,
      };

      const mockUpdated: ITransaction = {
        id: 'tx1',
        amount: 150000,
        type: 1,
        date: '2025-01-20',
        description: 'Original',
        categoryId: 'cat1',
        accountId: 'acc1',
        userId: 'user1',
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T11:00:00Z',
      };

      // C2: Tests update with only required fields
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([
          [matchers.call.fn(transactionService.updateTransaction), mockUpdated],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .call(transactionService.updateTransaction, minimalPayload)
        .put(transactionActions.updateTransactionSuccess(mockUpdated))
        .dispatch(transactionActions.updateTransactionRequest(minimalPayload))
        .silentRun();
    });

    it('should handle error with message (C2: error.message exists)', async () => {
      const error = new Error('Transaction not found');

      // C2: Tests error instanceof Error && error.message branch
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([[matchers.call.fn(transactionService.updateTransaction), throwError(error)]])
        .put(transactionActions.updateTransactionFailure('Transaction not found'))
        .dispatch(transactionActions.updateTransactionRequest(mockPayload))
        .silentRun();
    });

    it('should handle error without message (C2: fallback error message)', async () => {
      const error = new Error();
      error.name = 'NotFoundError';

      // C2: Tests error without message → fallback message
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([[matchers.call.fn(transactionService.updateTransaction), throwError(error)]])
        .put(transactionActions.updateTransactionFailure('Failed to update transaction'))
        .dispatch(transactionActions.updateTransactionRequest(mockPayload))
        .silentRun();
    });
  });

  // ============================================
  // DELETE TRANSACTION FLOW - C2 Coverage
  // ============================================
  describe('Delete Transaction Flow', () => {
    const mockFilters = {};
    const deletePayload = { id: 'tx1' };

    it('should delete transaction and refresh list (C2: success path)', async () => {
      // C2: Tests successful delete + refresh flow
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([
          [matchers.call.fn(transactionService.deleteTransaction), undefined],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .put(transactionActions.deleteTransactionSuccess('tx1'))
        .put(transactionActions.listTransactionsRequest(mockFilters))
        .dispatch(transactionActions.deleteTransactionRequest(deletePayload))
        .silentRun();
    });

    it('should extract id from payload (C2: destructuring)', async () => {
      // C2: Tests const { id } = action.payload destructuring
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([
          [matchers.call.fn(transactionService.deleteTransaction), undefined],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .call(transactionService.deleteTransaction, 'tx1')
        .dispatch(transactionActions.deleteTransactionRequest(deletePayload))
        .silentRun();
    });

    it('should handle error with message (C2: error.message exists)', async () => {
      const error = new Error('Delete failed');

      // C2: Tests error instanceof Error && error.message branch
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([[matchers.call.fn(transactionService.deleteTransaction), throwError(error)]])
        .put(transactionActions.deleteTransactionFailure('Delete failed'))
        .dispatch(transactionActions.deleteTransactionRequest(deletePayload))
        .silentRun();
    });

    it('should handle error without message (C2: fallback error message)', async () => {
      const error = new Error();
      error.name = 'DeleteError';

      // C2: Tests error without message → fallback message
      await expectSaga(transactionSaga)
        .withState({
          transactions: { filters: mockFilters, pagination: { page: 1, limit: 10, total: 0 } },
        })
        .provide([[matchers.call.fn(transactionService.deleteTransaction), throwError(error)]])
        .put(transactionActions.deleteTransactionFailure('Failed to delete transaction'))
        .dispatch(transactionActions.deleteTransactionRequest(deletePayload))
        .silentRun();
    });
  });

  // ============================================
  // GET TRANSACTION DETAIL FLOW - C2 Coverage
  // ============================================
  describe('Get Transaction Detail Flow', () => {
    const mockTransaction: ITransaction = {
      id: 'tx1',
      amount: 100000,
      type: 1,
      date: '2025-01-15',
      description: 'Lunch',
      categoryId: 'cat1',
      accountId: 'acc1',
      userId: 'user1',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    };

    it('should get transaction by id (C2: success path)', async () => {
      // C2: Tests successful getTransaction flow
      await expectSaga(transactionSaga)
        .provide([[matchers.call.fn(transactionService.getTransaction), mockTransaction]])
        .put(transactionActions.getTransactionSuccess(mockTransaction))
        .dispatch(transactionActions.getTransactionRequest('tx1'))
        .silentRun();
    });

    it('should pass id to service (C2: parameter passing)', async () => {
      // C2: Tests id parameter extraction from payload
      await expectSaga(transactionSaga)
        .provide([[matchers.call.fn(transactionService.getTransaction), mockTransaction]])
        .call(transactionService.getTransaction, 'tx1')
        .dispatch(transactionActions.getTransactionRequest('tx1'))
        .silentRun();
    });

    it('should handle error with message (C2: error.message exists)', async () => {
      const error = new Error('Transaction not found');

      // C2: Tests error instanceof Error && error.message branch
      await expectSaga(transactionSaga)
        .provide([[matchers.call.fn(transactionService.getTransaction), throwError(error)]])
        .put(transactionActions.getTransactionFailure('Transaction not found'))
        .dispatch(transactionActions.getTransactionRequest('tx1'))
        .silentRun();
    });

    it('should handle error without message (C2: fallback error message)', async () => {
      const error = new Error();
      error.name = 'FetchError';

      // C2: Tests error without message → fallback message
      await expectSaga(transactionSaga)
        .provide([[matchers.call.fn(transactionService.getTransaction), throwError(error)]])
        .put(transactionActions.getTransactionFailure('Failed to fetch transaction'))
        .dispatch(transactionActions.getTransactionRequest('tx1'))
        .silentRun();
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should handle response with only data array (C2: minimal response)', async () => {
      const mockTransactions: ITransaction[] = [
        {
          id: '1',
          amount: 100000,
          type: 1,
          date: '2025-01-15',
          description: 'Test',
          categoryId: 'cat1',
          accountId: 'acc1',
          userId: 'user1',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
        },
      ];

      const minimalResponse = { data: mockTransactions };

      // C2: Tests response with only data field (no pagination)
      await expectSaga(transactionSaga)
        .withState({
          transactions: {
            filters: {},
            pagination: { page: 1, limit: 10, total: 0 },
          },
        })
        .provide([[matchers.call.fn(transactionService.listTransactions), minimalResponse]])
        .put(
          transactionActions.listTransactionsSuccess({
            transactions: mockTransactions,
            total: 1,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(transactionActions.listTransactionsRequest({}))
        .silentRun();
    });

    it('should preserve filters when refreshing list (C2: filter persistence)', async () => {
      const customFilters = {
        type: 1,
        categoryId: 'cat1',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      };

      // C2: Tests filters are retrieved from selector and passed to refresh
      await expectSaga(transactionSaga)
        .withState({
          transactions: {
            filters: customFilters,
            pagination: { page: 1, limit: 10, total: 0 },
          },
        })
        .provide([
          [matchers.call.fn(transactionService.createTransaction), {} as ITransaction],
          [matchers.call.fn(transactionService.listTransactions), []],
        ])
        .put(transactionActions.listTransactionsRequest(customFilters))
        .dispatch(
          transactionActions.createTransactionRequest({
            amount: 100000,
            type: 1,
            date: '2025-01-20',
            description: 'Test',
            categoryId: 'cat1',
            accountId: 'acc1',
          })
        )
        .silentRun();
    });
  });
});
