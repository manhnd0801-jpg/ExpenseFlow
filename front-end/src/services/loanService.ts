/**
 * Loan Service
 * API service for loan management operations
 */

import { ApiRoutes, buildApiPath, buildResourcePath } from '@/constants/api-routes';
import type {
  IAmortizationScheduleItem,
  ICreateLoanPayload,
  IDeleteExtraPrincipalTransactionPayload,
  IExtraPrincipalPaymentPayload,
  ILoan,
  ILoanListQuery,
  ILoanPayment,
  IPaymentScheduleWithStatus,
  IPrepaymentSimulation,
  IRecordLoanPaymentPayload,
  ISimulatePrepaymentPayload,
  IUpdateLoanPayload,
} from '@/redux/modules/loans/loanTypes';
import type { TPaginatedResponse } from '@/types';
import api from './api';

const loanService = {
  /**
   * Get all loans with pagination and filters
   * GET /api/v1/loans
   */
  getLoans: async (params?: ILoanListQuery): Promise<TPaginatedResponse<ILoan>> => {
    const response = await api.get<TPaginatedResponse<ILoan>>(buildApiPath(ApiRoutes.LOANS.BASE), {
      params,
    });
    return response;
  },

  /**
   * Get loan by ID
   * GET /api/v1/loans/:id
   */
  getLoanById: async (id: string): Promise<ILoan> => {
    const response = await api.get<ILoan>(buildResourcePath(ApiRoutes.LOANS.BASE, id));
    return response;
  },

  /**
   * Create new loan
   * POST /api/v1/loans
   */
  createLoan: async (payload: ICreateLoanPayload): Promise<ILoan> => {
    const response = await api.post<ILoan>(buildApiPath(ApiRoutes.LOANS.BASE), payload);
    return response;
  },

  /**
   * Update loan
   * PATCH /api/v1/loans/:id
   */
  updateLoan: async (id: string, payload: Partial<IUpdateLoanPayload>): Promise<ILoan> => {
    const response = await api.patch<ILoan>(buildResourcePath(ApiRoutes.LOANS.BASE, id), payload);
    return response;
  },

  /**
   * Delete loan
   * DELETE /api/v1/loans/:id
   */
  deleteLoan: async (id: string): Promise<void> => {
    await api.delete(buildResourcePath(ApiRoutes.LOANS.BASE, id));
  },

  /**
   * Get amortization schedule for a loan
   * GET /api/v1/loans/:id/amortization-schedule
   */
  getAmortizationSchedule: async (loanId: string): Promise<IAmortizationScheduleItem[]> => {
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/${
      ApiRoutes.LOANS.AMORTIZATION_SCHEDULE
    }`;
    const response = await api.get<IAmortizationScheduleItem[]>(url);
    return response;
  },

  /**
   * Get payment history for a loan
   * GET /api/v1/loans/:id/payments
   */
  getLoanPayments: async (loanId: string): Promise<ILoanPayment[]> => {
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/${ApiRoutes.LOANS.PAYMENTS}`;
    const response = await api.get<ILoanPayment[]>(url);
    return response;
  },

  /**
   * Get payment schedule with status for a loan
   * GET /api/v1/loans/:id/payment-schedule
   */
  getPaymentScheduleWithStatus: async (loanId: string): Promise<IPaymentScheduleWithStatus[]> => {
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/${
      ApiRoutes.LOANS.PAYMENT_SCHEDULE
    }`;
    const response = await api.get<IPaymentScheduleWithStatus[]>(url);
    return response;
  },

  /**
   * Record a loan payment
   * POST /api/v1/loans/:id/payments
   */
  recordPayment: async (payload: IRecordLoanPaymentPayload): Promise<ILoanPayment> => {
    const { loanId, ...paymentData } = payload;
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/${ApiRoutes.LOANS.PAYMENTS}`;
    const response = await api.post<ILoanPayment>(url, paymentData);
    return response;
  },

  /**
   * Delete a loan payment (most recent only)
   * DELETE /api/v1/loans/:id/payments/:paymentId
   */
  deletePayment: async (loanId: string, paymentId: string): Promise<void> => {
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/${
      ApiRoutes.LOANS.PAYMENTS
    }/${paymentId}`;
    await api.delete(url);
  },

  /**
   * Simulate prepayment impact
   * POST /api/v1/loans/:id/simulate-prepayment
   */
  simulatePrepayment: async (
    payload: ISimulatePrepaymentPayload
  ): Promise<IPrepaymentSimulation> => {
    const { loanId, ...simulationData } = payload;
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/${
      ApiRoutes.LOANS.SIMULATE_PREPAYMENT
    }`;
    const response = await api.post<IPrepaymentSimulation>(url, simulationData);
    return response;
  },

  /**
   * Make extra principal payment outside regular schedule
   * POST /api/v1/loans/:id/extra-principal
   */
  makeExtraPrincipalPayment: async (
    payload: IExtraPrincipalPaymentPayload
  ): Promise<{ newRemainingPrincipal: number }> => {
    const { loanId, ...paymentData } = payload;
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/extra-principal`;
    const response = await api.post<{ newRemainingPrincipal: number }>(url, paymentData);
    return response;
  },

  /**
   * Get extra principal payment transactions
   * GET /api/v1/loans/:id/extra-principal
   */
  getExtraPrincipalTransactions: async (loanId: string): Promise<{ data: any[] }> => {
    const url = `${buildResourcePath(ApiRoutes.LOANS.BASE, loanId)}/extra-principal`;
    const response = await api.get<{ data: any[] }>(url);
    return response;
  },

  /**
   * Delete extra principal payment transaction
   * DELETE /api/v1/loans/:id/extra-principal/:transactionId
   */
  deleteExtraPrincipalTransaction: async (
    payload: IDeleteExtraPrincipalTransactionPayload
  ): Promise<void> => {
    const { loanId, transactionId } = payload;
    const url = `${buildResourcePath(
      ApiRoutes.LOANS.BASE,
      loanId
    )}/extra-principal/${transactionId}`;
    await api.delete(url);
  },
};

export default loanService;
