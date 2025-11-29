/**
 * Goal Saga Integration Tests - C2 Coverage
 * Tests saga flows with API mocking for all conditional branches
 */

import { IGoal } from '@/types/models';
import { goalService } from '@services/index';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { describe, it } from 'vitest';
import goalSaga from '../goalSaga';
import {
  contributeGoalFailure,
  contributeGoalStart,
  contributeGoalSuccess,
  createGoalFailure,
  createGoalStart,
  createGoalSuccess,
  deleteGoalFailure,
  deleteGoalStart,
  deleteGoalSuccess,
  fetchGoalsFailure,
  fetchGoalsStart,
  fetchGoalsSuccess,
  updateGoalFailure,
  updateGoalStart,
  updateGoalSuccess,
} from '../goalSlice';

// Mock goal data
const mockGoal: IGoal = {
  id: 'goal-1',
  userId: 'user-1',
  name: 'Mua nhà',
  targetAmount: 500000000,
  currentAmount: 100000000,
  deadline: '2026-12-31',
  status: 1, // Active
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockGoal2: IGoal = {
  ...mockGoal,
  id: 'goal-2',
  name: 'Mua xe',
  targetAmount: 200000000,
  currentAmount: 50000000,
};

describe('goalSaga - C2 Coverage', () => {
  // ============================================
  // FETCH GOALS - C2 Coverage
  // ============================================
  describe('Fetch Goals Flow', () => {
    it('should fetch goals successfully (C2: success path)', async () => {
      const goals = [mockGoal, mockGoal2];

      // C2: Tests success path
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), goals]])
        .put(fetchGoalsSuccess(goals))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });

    it('should handle empty goals list (C2: empty array)', async () => {
      const goals: IGoal[] = [];

      // C2: Tests empty array response
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), goals]])
        .put(fetchGoalsSuccess([]))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });

    it('should handle fetch goals error with message (C2: error.message exists)', async () => {
      const error = new Error('Network error');

      // C2: Tests error.message exists branch
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), throwError(error)]])
        .put(fetchGoalsFailure('Network error'))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });

    it('should handle fetch goals error without message (C2: fallback message)', async () => {
      const error = new Error();

      // C2: Tests error.message is empty → fallback to default message
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), throwError(error)]])
        .put(fetchGoalsFailure('Lỗi khi tải danh sách mục tiêu'))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });
  });

  // ============================================
  // CREATE GOAL - C2 Coverage
  // ============================================
  describe('Create Goal Flow', () => {
    it('should create goal successfully (C2: success path)', async () => {
      const payload = {
        name: 'Mua nhà',
        targetAmount: 500000000,
        deadline: '2026-12-31',
      };

      // C2: Tests success path
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.createGoal), mockGoal]])
        .put(createGoalSuccess(mockGoal))
        .dispatch(createGoalStart(payload))
        .silentRun();
    });

    it('should handle create goal with full payload (C2: all fields)', async () => {
      const payload = {
        name: 'Mua xe',
        targetAmount: 200000000,
        deadline: '2026-06-30',
        currentAmount: 0,
        status: 1,
      };

      // C2: Tests with all optional fields
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.createGoal), mockGoal2]])
        .call(goalService.createGoal, payload)
        .put(createGoalSuccess(mockGoal2))
        .dispatch(createGoalStart(payload))
        .silentRun();
    });

    it('should handle create goal error with message (C2: error.message exists)', async () => {
      const error = new Error('Validation failed');
      const payload = {
        name: 'Invalid goal',
        targetAmount: -1000,
        deadline: '2025-01-01',
      };

      // C2: Tests error.message exists
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.createGoal), throwError(error)]])
        .put(createGoalFailure('Validation failed'))
        .dispatch(createGoalStart(payload))
        .silentRun();
    });

    it('should handle create goal error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = {
        name: 'Test goal',
        targetAmount: 1000000,
        deadline: '2026-01-01',
      };

      // C2: Tests error.message is empty → fallback
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.createGoal), throwError(error)]])
        .put(createGoalFailure('Lỗi khi tạo mục tiêu'))
        .dispatch(createGoalStart(payload))
        .silentRun();
    });
  });

  // ============================================
  // UPDATE GOAL - C2 Coverage
  // ============================================
  describe('Update Goal Flow', () => {
    it('should update goal successfully (C2: success path)', async () => {
      const payload = {
        id: 'goal-1',
        updates: {
          name: 'Mua nhà mới',
          targetAmount: 600000000,
        },
      };

      const updatedGoal = {
        ...mockGoal,
        name: 'Mua nhà mới',
        targetAmount: 600000000,
      };

      // C2: Tests success path with id and data extraction
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.updateGoal), updatedGoal]])
        .call(goalService.updateGoal, 'goal-1', payload.updates)
        .put(updateGoalSuccess(updatedGoal))
        .dispatch(updateGoalStart(payload))
        .silentRun();
    });

    it('should handle update with minimal fields (C2: partial update)', async () => {
      const payload = {
        id: 'goal-1',
        updates: {
          deadline: '2027-12-31',
        },
      };

      const updatedGoal = {
        ...mockGoal,
        deadline: '2027-12-31',
      };

      // C2: Tests update with only one field
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.updateGoal), updatedGoal]])
        .put(updateGoalSuccess(updatedGoal))
        .dispatch(updateGoalStart(payload))
        .silentRun();
    });

    it('should handle update goal error with message (C2: error.message exists)', async () => {
      const error = new Error('Goal not found');
      const payload = {
        id: 'goal-999',
        updates: { name: 'Updated name' },
      };

      // C2: Tests error.message exists
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.updateGoal), throwError(error)]])
        .put(updateGoalFailure('Goal not found'))
        .dispatch(updateGoalStart(payload))
        .silentRun();
    });

    it('should handle update goal error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = {
        id: 'goal-1',
        updates: { name: 'Test' },
      };

      // C2: Tests error.message is empty → fallback
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.updateGoal), throwError(error)]])
        .put(updateGoalFailure('Lỗi khi cập nhật mục tiêu'))
        .dispatch(updateGoalStart(payload))
        .silentRun();
    });
  });

  // ============================================
  // DELETE GOAL - C2 Coverage
  // ============================================
  describe('Delete Goal Flow', () => {
    it('should delete goal successfully (C2: success path)', async () => {
      const payload = { id: 'goal-1' };

      // C2: Tests success path with id extraction
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.deleteGoal), undefined]])
        .call(goalService.deleteGoal, 'goal-1')
        .put(deleteGoalSuccess(payload))
        .dispatch(deleteGoalStart(payload))
        .silentRun();
    });

    it('should extract id from payload correctly (C2: destructuring)', async () => {
      const payload = { id: 'goal-2' };

      // C2: Tests action.payload.id extraction
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.deleteGoal), undefined]])
        .call(goalService.deleteGoal, 'goal-2')
        .put(deleteGoalSuccess(payload))
        .dispatch(deleteGoalStart(payload))
        .silentRun();
    });

    it('should handle delete goal error with message (C2: error.message exists)', async () => {
      const error = new Error('Cannot delete goal with contributions');
      const payload = { id: 'goal-1' };

      // C2: Tests error.message exists
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.deleteGoal), throwError(error)]])
        .put(deleteGoalFailure('Cannot delete goal with contributions'))
        .dispatch(deleteGoalStart(payload))
        .silentRun();
    });

    it('should handle delete goal error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = { id: 'goal-1' };

      // C2: Tests error.message is empty → fallback
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.deleteGoal), throwError(error)]])
        .put(deleteGoalFailure('Lỗi khi xóa mục tiêu'))
        .dispatch(deleteGoalStart(payload))
        .silentRun();
    });
  });

  // ============================================
  // CONTRIBUTE TO GOAL - C2 Coverage
  // ============================================
  describe('Contribute to Goal Flow', () => {
    it('should contribute to goal successfully (C2: success path)', async () => {
      const payload = {
        goalId: 'goal-1',
        amount: 10000000,
      };

      const updatedGoal = {
        ...mockGoal,
        currentAmount: 110000000,
      };

      // C2: Tests success path with goalId and amount extraction
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.contributeToGoal), updatedGoal]])
        .call(goalService.contributeToGoal, 'goal-1', payload)
        .put(contributeGoalSuccess(updatedGoal))
        .dispatch(contributeGoalStart(payload))
        .silentRun();
    });

    it('should handle small contribution (C2: boundary value)', async () => {
      const payload = {
        goalId: 'goal-1',
        amount: 1000, // Very small contribution
      };

      const updatedGoal = {
        ...mockGoal,
        currentAmount: 100001000,
      };

      // C2: Tests small amount boundary
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.contributeToGoal), updatedGoal]])
        .put(contributeGoalSuccess(updatedGoal))
        .dispatch(contributeGoalStart(payload))
        .silentRun();
    });

    it('should handle large contribution (C2: boundary value)', async () => {
      const payload = {
        goalId: 'goal-1',
        amount: 400000000, // Large contribution to complete goal
      };

      const updatedGoal = {
        ...mockGoal,
        currentAmount: 500000000,
        status: 2, // Completed
      };

      // C2: Tests large amount that completes goal
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.contributeToGoal), updatedGoal]])
        .put(contributeGoalSuccess(updatedGoal))
        .dispatch(contributeGoalStart(payload))
        .silentRun();
    });

    it('should handle contribute error with message (C2: error.message exists)', async () => {
      const error = new Error('Insufficient funds');
      const payload = {
        goalId: 'goal-1',
        amount: 10000000,
      };

      // C2: Tests error.message exists
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.contributeToGoal), throwError(error)]])
        .put(contributeGoalFailure('Insufficient funds'))
        .dispatch(contributeGoalStart(payload))
        .silentRun();
    });

    it('should handle contribute error without message (C2: fallback message)', async () => {
      const error = new Error();
      const payload = {
        goalId: 'goal-1',
        amount: 10000000,
      };

      // C2: Tests error.message is empty → fallback
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.contributeToGoal), throwError(error)]])
        .put(contributeGoalFailure('Lỗi khi đóng góp vào mục tiêu'))
        .dispatch(contributeGoalStart(payload))
        .silentRun();
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should handle goal with zero target amount (C2: boundary value)', async () => {
      const zeroGoal: IGoal = {
        ...mockGoal,
        targetAmount: 0,
        currentAmount: 0,
      };

      const goals = [zeroGoal];

      // C2: Tests zero amount edge case
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), goals]])
        .put(fetchGoalsSuccess(goals))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });

    it('should handle goal with past deadline (C2: date edge case)', async () => {
      const expiredGoal: IGoal = {
        ...mockGoal,
        deadline: '2020-01-01', // Past date
      };

      const goals = [expiredGoal];

      // C2: Tests expired deadline
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), goals]])
        .put(fetchGoalsSuccess(goals))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });

    it('should handle goal exceeding target amount (C2: over-contribution)', async () => {
      const overGoal: IGoal = {
        ...mockGoal,
        currentAmount: 600000000, // Exceeds target of 500M
      };

      const goals = [overGoal];

      // C2: Tests over-contribution scenario
      await expectSaga(goalSaga)
        .provide([[matchers.call.fn(goalService.getGoals), goals]])
        .put(fetchGoalsSuccess(goals))
        .dispatch(fetchGoalsStart({}))
        .silentRun();
    });
  });
});
