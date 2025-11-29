/**
 * Debt Saga Tests - C2 Coverage
 * Tests all CRUD operations + Payment operations with comprehensive C2 coverage
 */

import type { IDebt, IDebtPayment } from '@/types/models';
import { debtService } from '@services/index';
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';
import debtSaga from '../debtSaga';
import {
  createDebtFailure,
  createDebtPaymentFailure,
  createDebtPaymentRequest,
  createDebtPaymentSuccess,
  createDebtRequest,
  createDebtSuccess,
  deleteDebtFailure,
  deleteDebtRequest,
  deleteDebtSuccess,
  fetchDebtPaymentsFailure,
  fetchDebtPaymentsRequest,
  fetchDebtPaymentsSuccess,
  fetchDebtsFailure,
  fetchDebtsRequest,
  fetchDebtsSuccess,
  updateDebtFailure,
  updateDebtRequest,
  updateDebtSuccess,
} from '../debtSlice';

describe('debtSaga - C2 Coverage', () => {
  // Mock data
  const mockDebt: IDebt = {
    id: 'debt-1',
    userId: 'user-123',
    type: 1, // LENDING
    personName: 'Nguyễn Văn A',
    amount: 50000000,
    paidAmount: 10000000,
    remainingAmount: 40000000,
    interestRate: 5,
    borrowedDate: '2024-01-01T00:00:00Z',
    dueDate: '2024-12-31T00:00:00Z',
    status: 1, // PENDING
    note: 'Cho vay dài hạn',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockDebt2: IDebt = {
    id: 'debt-2',
    userId: 'user-123',
    type: 2, // BORROWING
    personName: 'Trần Thị B',
    amount: 30000000,
    paidAmount: 0,
    remainingAmount: 30000000,
    borrowedDate: '2024-02-01T00:00:00Z',
    dueDate: '2024-11-30T00:00:00Z',
    status: 1, // PENDING
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  };

  const mockDebtPayment: IDebtPayment = {
    id: 'payment-1',
    debtId: 'debt-1',
    amount: 10000000,
    paymentDate: '2024-03-01T00:00:00Z',
    note: 'Thanh toán đợt 1',
    createdAt: '2024-03-01T00:00:00Z',
  };

  const mockDebtPayment2: IDebtPayment = {
    id: 'payment-2',
    debtId: 'debt-1',
    amount: 5000000,
    paymentDate: '2024-04-01T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  };

  /**
   * Fetch Debts Flow - C2 Coverage
   */
  describe('Fetch Debts Flow', () => {
    it('should fetch debts successfully (C2: success path)', () => {
      const debts = [mockDebt, mockDebt2];

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebts), debts]])
        .put(fetchDebtsSuccess(debts))
        .dispatch(fetchDebtsRequest())
        .silentRun();
    });

    it('should handle empty debts list (C2: empty array)', () => {
      const emptyDebts: IDebt[] = [];

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebts), emptyDebts]])
        .put(fetchDebtsSuccess(emptyDebts))
        .dispatch(fetchDebtsRequest())
        .silentRun();
    });

    it('should handle fetch debts error with message (C2: error.message exists)', () => {
      const error = new Error('Network timeout');

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebts), Promise.reject(error)]])
        .put(fetchDebtsFailure('Network timeout'))
        .dispatch(fetchDebtsRequest())
        .silentRun();
    });

    it('should handle fetch debts error without message (C2: fallback message)', () => {
      const error = new Error();
      error.message = '';

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebts), Promise.reject(error)]])
        .put(fetchDebtsFailure('Lỗi khi tải danh sách nợ'))
        .dispatch(fetchDebtsRequest())
        .silentRun();
    });
  });

  /**
   * Create Debt Flow - C2 Coverage
   */
  describe('Create Debt Flow', () => {
    it('should create debt successfully (C2: success path)', () => {
      const payload = {
        type: 1, // LENDING
        personName: 'Nguyễn Văn A',
        amount: 50000000,
        interestRate: 5,
        borrowedDate: '2024-01-01',
        dueDate: '2024-12-31',
      };

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebt, payload), mockDebt]])
        .put(createDebtSuccess(mockDebt))
        .dispatch(createDebtRequest(payload))
        .silentRun();
    });

    it('should handle create debt with minimal fields (C2: no optional fields)', () => {
      const payload = {
        type: 2, // BORROWING
        personName: 'Trần Thị B',
        amount: 30000000,
        borrowedDate: '2024-02-01',
      };

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebt, payload), mockDebt2]])
        .put(createDebtSuccess(mockDebt2))
        .dispatch(createDebtRequest(payload))
        .silentRun();
    });

    it('should handle create debt error with message (C2: error.message exists)', () => {
      const payload = {
        type: 1, // LENDING
        personName: 'Test',
        amount: 10000000,
        borrowedDate: '2024-01-01',
      };
      const error = new Error('Validation failed');

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebt, payload), Promise.reject(error)]])
        .put(createDebtFailure('Validation failed'))
        .dispatch(createDebtRequest(payload))
        .silentRun();
    });

    it('should handle create debt error without message (C2: fallback message)', () => {
      const payload = {
        type: 1, // LENDING
        personName: 'Test',
        amount: 10000000,
        borrowedDate: '2024-01-01',
      };
      const error = new Error();
      error.message = '';

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebt, payload), Promise.reject(error)]])
        .put(createDebtFailure('Lỗi khi tạo khoản nợ'))
        .dispatch(createDebtRequest(payload))
        .silentRun();
    });
  });

  /**
   * Update Debt Flow - C2 Coverage
   */
  describe('Update Debt Flow', () => {
    it('should update debt successfully (C2: success path)', () => {
      const payload = {
        id: 'debt-1',
        data: {
          personName: 'Nguyễn Văn A - Updated',
          amount: 60000000,
          interestRate: 6,
        },
      };

      return expectSaga(debtSaga)
        .provide([[call(debtService.updateDebt, payload.id, payload.data), mockDebt]])
        .put(updateDebtSuccess(mockDebt))
        .dispatch(updateDebtRequest(payload))
        .silentRun();
    });

    it('should handle update with minimal fields (C2: partial update)', () => {
      const payload = {
        id: 'debt-1',
        data: {
          status: 2, // PAID
        },
      };

      return expectSaga(debtSaga)
        .provide([[call(debtService.updateDebt, payload.id, payload.data), mockDebt]])
        .put(updateDebtSuccess(mockDebt))
        .dispatch(updateDebtRequest(payload))
        .silentRun();
    });

    it('should handle update debt error with message (C2: error.message exists)', () => {
      const payload = {
        id: 'debt-1',
        data: { amount: -1000 },
      };
      const error = new Error('Invalid amount');

      return expectSaga(debtSaga)
        .provide([[call(debtService.updateDebt, payload.id, payload.data), Promise.reject(error)]])
        .put(updateDebtFailure('Invalid amount'))
        .dispatch(updateDebtRequest(payload))
        .silentRun();
    });

    it('should handle update debt error without message (C2: fallback message)', () => {
      const payload = {
        id: 'debt-1',
        data: { amount: 50000000 },
      };
      const error = new Error();
      error.message = '';

      return expectSaga(debtSaga)
        .provide([[call(debtService.updateDebt, payload.id, payload.data), Promise.reject(error)]])
        .put(updateDebtFailure('Lỗi khi cập nhật khoản nợ'))
        .dispatch(updateDebtRequest(payload))
        .silentRun();
    });
  });

  /**
   * Delete Debt Flow - C2 Coverage
   */
  describe('Delete Debt Flow', () => {
    it('should delete debt successfully (C2: success path)', () => {
      const debtId = 'debt-1';

      return expectSaga(debtSaga)
        .provide([[call(debtService.deleteDebt, debtId), undefined]])
        .put(deleteDebtSuccess(debtId))
        .dispatch(deleteDebtRequest(debtId))
        .silentRun();
    });

    it('should extract id from payload correctly (C2: id parameter)', () => {
      const debtId = 'debt-2';

      return expectSaga(debtSaga)
        .provide([[call(debtService.deleteDebt, debtId), undefined]])
        .put(deleteDebtSuccess(debtId))
        .dispatch(deleteDebtRequest(debtId))
        .silentRun();
    });

    it('should handle delete debt error with message (C2: error.message exists)', () => {
      const debtId = 'debt-1';
      const error = new Error('Cannot delete debt with payments');

      return expectSaga(debtSaga)
        .provide([[call(debtService.deleteDebt, debtId), Promise.reject(error)]])
        .put(deleteDebtFailure('Cannot delete debt with payments'))
        .dispatch(deleteDebtRequest(debtId))
        .silentRun();
    });

    it('should handle delete debt error without message (C2: fallback message)', () => {
      const debtId = 'debt-1';
      const error = new Error();
      error.message = '';

      return expectSaga(debtSaga)
        .provide([[call(debtService.deleteDebt, debtId), Promise.reject(error)]])
        .put(deleteDebtFailure('Lỗi khi xóa khoản nợ'))
        .dispatch(deleteDebtRequest(debtId))
        .silentRun();
    });
  });

  /**
   * Fetch Debt Payments Flow - C2 Coverage
   */
  describe('Fetch Debt Payments Flow', () => {
    it('should fetch debt payments successfully (C2: success path)', () => {
      const debtId = 'debt-1';
      const payments = [mockDebtPayment, mockDebtPayment2];

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebtPayments, debtId), payments]])
        .put(fetchDebtPaymentsSuccess(payments))
        .dispatch(fetchDebtPaymentsRequest(debtId))
        .silentRun();
    });

    it('should handle empty payments list (C2: empty array)', () => {
      const debtId = 'debt-2';
      const emptyPayments: IDebtPayment[] = [];

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebtPayments, debtId), emptyPayments]])
        .put(fetchDebtPaymentsSuccess(emptyPayments))
        .dispatch(fetchDebtPaymentsRequest(debtId))
        .silentRun();
    });

    it('should pass debtId to service correctly (C2: parameter passing)', () => {
      const debtId = 'debt-3';
      const payments = [mockDebtPayment];

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebtPayments, debtId), payments]])
        .put(fetchDebtPaymentsSuccess(payments))
        .dispatch(fetchDebtPaymentsRequest(debtId))
        .silentRun();
    });

    it('should handle fetch payments error with message (C2: error.message exists)', () => {
      const debtId = 'debt-1';
      const error = new Error('Debt not found');

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebtPayments, debtId), Promise.reject(error)]])
        .put(fetchDebtPaymentsFailure('Debt not found'))
        .dispatch(fetchDebtPaymentsRequest(debtId))
        .silentRun();
    });

    it('should handle fetch payments error without message (C2: fallback message)', () => {
      const debtId = 'debt-1';
      const error = new Error();
      error.message = '';

      return expectSaga(debtSaga)
        .provide([[call(debtService.getDebtPayments, debtId), Promise.reject(error)]])
        .put(fetchDebtPaymentsFailure('Lỗi khi tải lịch sử thanh toán'))
        .dispatch(fetchDebtPaymentsRequest(debtId))
        .silentRun();
    });
  });

  /**
   * Create Debt Payment Flow - C2 Coverage
   */
  describe('Create Debt Payment Flow', () => {
    it('should create debt payment successfully (C2: success path)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: 10000000,
          paymentDate: '2024-03-01',
          note: 'Thanh toán đợt 1',
        },
      };

      return expectSaga(debtSaga)
        .provide([
          [call(debtService.createDebtPayment, payload.debtId, payload.data), mockDebtPayment],
        ])
        .put(createDebtPaymentSuccess(mockDebtPayment))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });

    it('should handle payment with minimal fields (C2: no note)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: 5000000,
          paymentDate: '2024-04-01',
        },
      };

      return expectSaga(debtSaga)
        .provide([
          [call(debtService.createDebtPayment, payload.debtId, payload.data), mockDebtPayment2],
        ])
        .put(createDebtPaymentSuccess(mockDebtPayment2))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });

    it('should handle small payment amount (C2: boundary value)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: 1000,
          paymentDate: '2024-05-01',
        },
      };
      const smallPayment = { ...mockDebtPayment, amount: 1000 };

      return expectSaga(debtSaga)
        .provide([
          [call(debtService.createDebtPayment, payload.debtId, payload.data), smallPayment],
        ])
        .put(createDebtPaymentSuccess(smallPayment))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });

    it('should handle large payment amount (C2: boundary value)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: 500000000,
          paymentDate: '2024-06-01',
        },
      };
      const largePayment = { ...mockDebtPayment, amount: 500000000 };

      return expectSaga(debtSaga)
        .provide([
          [call(debtService.createDebtPayment, payload.debtId, payload.data), largePayment],
        ])
        .put(createDebtPaymentSuccess(largePayment))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });

    it('should handle create payment error with message (C2: error.message exists)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: -1000,
          paymentDate: '2024-03-01',
        },
      };
      const error = new Error('Invalid payment amount');

      return expectSaga(debtSaga)
        .provide([
          [
            call(debtService.createDebtPayment, payload.debtId, payload.data),
            Promise.reject(error),
          ],
        ])
        .put(createDebtPaymentFailure('Invalid payment amount'))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });

    it('should handle create payment error without message (C2: fallback message)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: 10000000,
          paymentDate: '2024-03-01',
        },
      };
      const error = new Error();
      error.message = '';

      return expectSaga(debtSaga)
        .provide([
          [
            call(debtService.createDebtPayment, payload.debtId, payload.data),
            Promise.reject(error),
          ],
        ])
        .put(createDebtPaymentFailure('Lỗi khi ghi nhận thanh toán'))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });
  });

  /**
   * Edge Cases - C2 Coverage
   */
  describe('Edge Cases', () => {
    it('should handle debt with zero interest rate (C2: boundary value)', () => {
      const payload = {
        type: 1, // LENDING
        personName: 'No Interest Loan',
        amount: 20000000,
        interestRate: 0,
        borrowedDate: '2024-01-01',
      };
      const zeroInterestDebt = { ...mockDebt, interestRate: 0 };

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebt, payload), zeroInterestDebt]])
        .put(createDebtSuccess(zeroInterestDebt))
        .dispatch(createDebtRequest(payload))
        .silentRun();
    });

    it('should handle debt with overdue date (C2: date edge case)', () => {
      const payload = {
        type: 2, // BORROWING
        personName: 'Overdue Debt',
        amount: 15000000,
        borrowedDate: '2023-01-01',
        dueDate: '2023-12-31',
      };
      const overdueDebt = {
        ...mockDebt,
        borrowedDate: '2023-01-01T00:00:00Z',
        dueDate: '2023-12-31T00:00:00Z',
      };

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebt, payload), overdueDebt]])
        .put(createDebtSuccess(overdueDebt))
        .dispatch(createDebtRequest(payload))
        .silentRun();
    });

    it('should handle payment exceeding remaining amount (C2: over-payment)', () => {
      const payload = {
        debtId: 'debt-1',
        data: {
          amount: 100000000, // More than remaining
          paymentDate: '2024-07-01',
          note: 'Full payment + extra',
        },
      };
      const overPayment = { ...mockDebtPayment, amount: 100000000 };

      return expectSaga(debtSaga)
        .provide([[call(debtService.createDebtPayment, payload.debtId, payload.data), overPayment]])
        .put(createDebtPaymentSuccess(overPayment))
        .dispatch(createDebtPaymentRequest(payload))
        .silentRun();
    });
  });
});
