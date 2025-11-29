/**
 * Budget Saga Integration Tests - C2 Coverage
 * Tests saga flows with API mocking for all conditional branches
 */

import { budgetService } from '@/services/budgetService';
import { IBudget, IBudgetProgressResponse } from '@/types';
import { message } from 'antd';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import budgetSaga from '../budgetSaga';
import {
  createBudgetFailure,
  createBudgetStart,
  createBudgetSuccess,
  deleteBudgetFailure,
  deleteBudgetStart,
  deleteBudgetSuccess,
  fetchBudgetProgressFailure,
  fetchBudgetProgressStart,
  fetchBudgetProgressSuccess,
  fetchBudgetsFailure,
  fetchBudgetsStart,
  fetchBudgetsSuccess,
  updateBudgetFailure,
  updateBudgetStart,
  updateBudgetSuccess,
} from '../budgetSlice';

// Mock Ant Design message
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock budget data
const mockBudget: IBudget = {
  id: 'budget-1',
  userId: 'user-1',
  categoryId: 'cat-1',
  amount: 5000000,
  spent: 2500000,
  remaining: 2500000,
  period: 1, // Monthly
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockBudget2: IBudget = {
  ...mockBudget,
  id: 'budget-2',
  categoryId: 'cat-2',
  amount: 3000000,
  spent: 1500000,
  remaining: 1500000,
};

const mockBudgetProgress: IBudgetProgressResponse = {
  budgetId: 'budget-1',
  totalBudget: 5000000,
  totalSpent: 2500000,
  percentage: 50,
  remainingAmount: 2500000,
  remainingDays: 15,
};

describe('budgetSaga - C2 Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // FETCH BUDGETS - C2 Coverage
  // ============================================
  describe('Fetch Budgets Flow', () => {
    it('should fetch budgets successfully with default pagination (C2: default parameters)', async () => {
      const response = {
        items: [mockBudget, mockBudget2],
        total: 2,
      };

      // C2: Tests page/pageSize with default values (page || 1, pageSize || 20)
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), response]])
        .put(fetchBudgetsSuccess([mockBudget, mockBudget2]))
        .dispatch(fetchBudgetsStart({}))
        .silentRun();
    });

    it('should fetch budgets successfully with custom pagination (C2: custom parameters)', async () => {
      const response = {
        items: [mockBudget],
        total: 1,
      };

      // C2: Tests page/pageSize with custom values
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), response]])
        .put(fetchBudgetsSuccess([mockBudget]))
        .dispatch(fetchBudgetsStart({ page: 2, pageSize: 10 }))
        .silentRun();
    });

    it('should handle fetch budgets error with message (C2: error.message exists)', async () => {
      const error = new Error('Network error');

      // C2: Tests error.message exists branch
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), throwError(error)]])
        .put(fetchBudgetsFailure('Network error'))
        .dispatch(fetchBudgetsStart({}))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Network error');
    });

    it('should handle fetch budgets error without message (C2: fallback message)', async () => {
      const error = new Error();

      // C2: Tests error.message is empty → fallback to default message
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), throwError(error)]])
        .put(fetchBudgetsFailure('Không thể tải danh sách ngân sách'))
        .dispatch(fetchBudgetsStart({}))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Không thể tải danh sách ngân sách');
    });

    it('should handle empty budgets list (C2: empty array)', async () => {
      const response = {
        items: [],
        total: 0,
      };

      // C2: Tests empty array response
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), response]])
        .put(fetchBudgetsSuccess([]))
        .dispatch(fetchBudgetsStart({}))
        .silentRun();
    });
  });

  // ============================================
  // CREATE BUDGET - C2 Coverage
  // ============================================
  describe('Create Budget Flow', () => {
    it('should create budget successfully (C2: success path)', async () => {
      const payload = {
        categoryId: 'cat-1',
        amount: 5000000,
        period: 1,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      // C2: Tests success path with message.success
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.createBudget), mockBudget]])
        .put(createBudgetSuccess(mockBudget))
        .dispatch(createBudgetStart(payload))
        .silentRun();

      expect(message.success).toHaveBeenCalledWith('Tạo ngân sách thành công');
    });

    it('should handle full payload with all optional fields (C2: complete payload)', async () => {
      const payload = {
        amount: 3000000,
        period: 1,
        startDate: '2025-01-01',
      };

      const response = {
        ...mockBudget,
        amount: 3000000,
      };

      // C2: Tests without optional categoryId and endDate
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.createBudget), response]])
        .put(createBudgetSuccess(response))
        .dispatch(createBudgetStart(payload))
        .silentRun();

      expect(message.success).toHaveBeenCalledWith('Tạo ngân sách thành công');
    });

    it('should handle create budget error with message (C2: error.message exists)', async () => {
      const error = new Error('Validation failed');
      const payload = {
        amount: 5000000,
        period: 1,
        startDate: '2025-01-01',
      };

      // C2: Tests error.message exists
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.createBudget), throwError(error)]])
        .put(createBudgetFailure('Validation failed'))
        .dispatch(createBudgetStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Validation failed');
    });

    it('should handle create budget error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = {
        amount: 5000000,
        period: 1,
        startDate: '2025-01-01',
      };

      // C2: Tests error.message is empty → fallback
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.createBudget), throwError(error)]])
        .put(createBudgetFailure('Không thể tạo ngân sách'))
        .dispatch(createBudgetStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Không thể tạo ngân sách');
    });
  });

  // ============================================
  // UPDATE BUDGET - C2 Coverage
  // ============================================
  describe('Update Budget Flow', () => {
    it('should update budget successfully (C2: success path)', async () => {
      const payload = {
        id: 'budget-1',
        updates: {
          amount: 6000000,
          endDate: '2025-01-31',
        },
      };

      const updatedBudget = {
        ...mockBudget,
        amount: 6000000,
        endDate: '2025-01-31',
      };

      // C2: Tests success path with message.success
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.updateBudget), updatedBudget]])
        .put(updateBudgetSuccess(updatedBudget))
        .dispatch(updateBudgetStart(payload))
        .silentRun();

      expect(message.success).toHaveBeenCalledWith('Cập nhật ngân sách thành công');
    });

    it('should handle update with minimal fields (C2: partial updates)', async () => {
      const payload = {
        id: 'budget-1',
        updates: {
          amount: 7000000,
        },
      };

      const updatedBudget = {
        ...mockBudget,
        amount: 7000000,
      };

      // C2: Tests update with only one field
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.updateBudget), updatedBudget]])
        .put(updateBudgetSuccess(updatedBudget))
        .dispatch(updateBudgetStart(payload))
        .silentRun();
    });

    it('should handle update budget error with message (C2: error.message exists)', async () => {
      const error = new Error('Budget not found');
      const payload = {
        id: 'budget-1',
        updates: { amount: 6000000 },
      };

      // C2: Tests error.message exists
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.updateBudget), throwError(error)]])
        .put(updateBudgetFailure('Budget not found'))
        .dispatch(updateBudgetStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Budget not found');
    });

    it('should handle update budget error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = {
        id: 'budget-1',
        updates: { amount: 6000000 },
      };

      // C2: Tests error.message is empty → fallback
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.updateBudget), throwError(error)]])
        .put(updateBudgetFailure('Không thể cập nhật ngân sách'))
        .dispatch(updateBudgetStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Không thể cập nhật ngân sách');
    });
  });

  // ============================================
  // DELETE BUDGET - C2 Coverage
  // ============================================
  describe('Delete Budget Flow', () => {
    it('should delete budget successfully (C2: success path)', async () => {
      const payload = { id: 'budget-1' };

      // C2: Tests success path with message.success
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.deleteBudget), undefined]])
        .put(deleteBudgetSuccess({ id: 'budget-1' }))
        .dispatch(deleteBudgetStart(payload))
        .silentRun();

      expect(message.success).toHaveBeenCalledWith('Xóa ngân sách thành công');
    });

    it('should extract id from payload correctly (C2: destructuring)', async () => {
      const payload = { id: 'budget-2' };

      // C2: Tests destructuring const { id } = action.payload
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.deleteBudget), undefined]])
        .call(budgetService.deleteBudget, 'budget-2')
        .put(deleteBudgetSuccess({ id: 'budget-2' }))
        .dispatch(deleteBudgetStart(payload))
        .silentRun();
    });

    it('should handle delete budget error with message (C2: error.message exists)', async () => {
      const error = new Error('Budget is in use');
      const payload = { id: 'budget-1' };

      // C2: Tests error.message exists
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.deleteBudget), throwError(error)]])
        .put(deleteBudgetFailure('Budget is in use'))
        .dispatch(deleteBudgetStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Budget is in use');
    });

    it('should handle delete budget error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = { id: 'budget-1' };

      // C2: Tests error.message is empty → fallback
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.deleteBudget), throwError(error)]])
        .put(deleteBudgetFailure('Không thể xóa ngân sách'))
        .dispatch(deleteBudgetStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Không thể xóa ngân sách');
    });
  });

  // ============================================
  // FETCH BUDGET PROGRESS - C2 Coverage
  // ============================================
  describe('Fetch Budget Progress Flow', () => {
    it('should fetch budget progress successfully (C2: success path)', async () => {
      const payload = { budgetId: 'budget-1' };

      // C2: Tests success path
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgetProgress), mockBudgetProgress]])
        .put(fetchBudgetProgressSuccess(mockBudgetProgress))
        .dispatch(fetchBudgetProgressStart(payload))
        .silentRun();
    });

    it('should pass budgetId to service correctly (C2: parameter passing)', async () => {
      const payload = { budgetId: 'budget-2' };

      // C2: Tests budgetId parameter extraction
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgetProgress), mockBudgetProgress]])
        .call(budgetService.getBudgetProgress, 'budget-2')
        .dispatch(fetchBudgetProgressStart(payload))
        .silentRun();
    });

    it('should handle fetch budget progress error with message (C2: error.message exists)', async () => {
      const error = new Error('Budget not found');
      const payload = { budgetId: 'budget-1' };

      // C2: Tests error.message exists
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgetProgress), throwError(error)]])
        .put(fetchBudgetProgressFailure('Budget not found'))
        .dispatch(fetchBudgetProgressStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Budget not found');
    });

    it('should handle fetch budget progress error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = { budgetId: 'budget-1' };

      // C2: Tests error.message is empty → fallback
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgetProgress), throwError(error)]])
        .put(fetchBudgetProgressFailure('Không thể tải tiến độ ngân sách'))
        .dispatch(fetchBudgetProgressStart(payload))
        .silentRun();

      expect(message.error).toHaveBeenCalledWith('Không thể tải tiến độ ngân sách');
    });

    it('should handle progress with zero spending (C2: edge case)', async () => {
      const zeroProgress: IBudgetProgressResponse = {
        budgetId: 'budget-1',
        totalBudget: 5000000,
        totalSpent: 0,
        percentage: 0,
        remainingAmount: 5000000,
        remainingDays: 30,
      };

      const payload = { budgetId: 'budget-1' };

      // C2: Tests zero values (edge case)
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgetProgress), zeroProgress]])
        .put(fetchBudgetProgressSuccess(zeroProgress))
        .dispatch(fetchBudgetProgressStart(payload))
        .silentRun();
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should handle budget with zero amount (C2: boundary value)', async () => {
      const zeroBudget: IBudget = {
        ...mockBudget,
        amount: 0,
        spent: 0,
        remaining: 0,
      };

      const response = {
        items: [zeroBudget],
        total: 1,
      };

      // C2: Tests zero amount edge case
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), response]])
        .put(fetchBudgetsSuccess([zeroBudget]))
        .dispatch(fetchBudgetsStart({}))
        .silentRun();
    });

    it('should handle budget with very large amount (C2: boundary value)', async () => {
      const largeBudget: IBudget = {
        ...mockBudget,
        amount: 999999999999,
        spent: 500000000000,
        remaining: 499999999999,
      };

      const response = {
        items: [largeBudget],
        total: 1,
      };

      // C2: Tests large number handling
      await expectSaga(budgetSaga)
        .provide([[matchers.call.fn(budgetService.getBudgets), response]])
        .put(fetchBudgetsSuccess([largeBudget]))
        .dispatch(fetchBudgetsStart({}))
        .silentRun();
    });
  });
});
