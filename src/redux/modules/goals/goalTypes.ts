/**
 * Goal Redux Types
 */
import type { IGoal } from '../../../types';

export interface IGoalState {
  goals: IGoal[];
  selectedGoal: IGoal | null;
  loading: boolean;
  error: string | null;
}

// Action payload types
export interface IFetchGoalsPayload {
  page?: number;
  pageSize?: number;
}

export interface ICreateGoalPayload {
  name: string;
  targetAmount: number;
  deadline: string;
}

export interface IUpdateGoalPayload {
  id: string;
  updates: {
    name?: string;
    targetAmount?: number;
    deadline?: string;
    status?: number;
  };
}

export interface IDeleteGoalPayload {
  id: string;
}

export interface IContributeGoalPayload {
  goalId: string;
  amount: number;
  note?: string;
}
