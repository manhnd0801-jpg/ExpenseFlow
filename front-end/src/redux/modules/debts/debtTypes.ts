/**
 * Debt Redux Types
 */
import type { IDebt, IDebtPayment } from '../../../types';

export interface IDebtState {
  debts: IDebt[];
  debtPayments: Record<string, IDebtPayment[]>; // debtId -> payments
  selectedDebt: IDebt | null;
  loading: boolean;
  error: string | null;
}

// Action payload types
export interface IFetchDebtsPayload {
  page?: number;
  pageSize?: number;
  type?: number; // DebtType enum
}

export interface ICreateDebtPayload {
  type: number; // DebtType enum
  personName: string;
  amount: number;
  interestRate?: number;
  borrowedDate: string;
  dueDate?: string;
}

export interface IUpdateDebtPayload {
  id: string;
  updates: {
    personName?: string;
    amount?: number;
    interestRate?: number;
    borrowedDate?: string;
    dueDate?: string;
    status?: number;
  };
}

export interface IDeleteDebtPayload {
  id: string;
}

export interface IFetchDebtPaymentsPayload {
  debtId: string;
}

export interface IMakeDebtPaymentPayload {
  debtId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}
