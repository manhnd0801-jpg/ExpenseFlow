/**
 * Budget Redux Types
 */
import type { IBudget, IBudgetProgressResponse } from '../../../types';

export interface IBudgetState {
  budgets: IBudget[];
  budgetProgress: Record<string, IBudgetProgressResponse>;
  selectedBudget: IBudget | null;
  loading: boolean;
  error: string | null;
}

// Action payload types
export interface IFetchBudgetsPayload {
  page?: number;
  pageSize?: number;
}

export interface ICreateBudgetPayload {
  categoryId?: string;
  amount: number;
  period: number;
  startDate: string;
  endDate?: string;
}

export interface IUpdateBudgetPayload {
  id: string;
  updates: {
    categoryId?: string;
    amount?: number;
    period?: number;
    startDate?: string;
    endDate?: string;
  };
}

export interface IDeleteBudgetPayload {
  id: string;
}

export interface IFetchBudgetProgressPayload {
  budgetId: string;
}
