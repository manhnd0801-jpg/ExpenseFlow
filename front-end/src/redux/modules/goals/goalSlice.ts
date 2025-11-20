/**
 * Goal Redux Slice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IGoal } from '../../../types';
import type {
  IContributeGoalPayload,
  ICreateGoalPayload,
  IDeleteGoalPayload,
  IFetchGoalsPayload,
  IGoalState,
  IUpdateGoalPayload,
} from './goalTypes';

const initialState: IGoalState = {
  goals: [],
  selectedGoal: null,
  loading: false,
  error: null,
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Fetch goals
    fetchGoalsStart: (state, _action: PayloadAction<IFetchGoalsPayload>) => {
      state.loading = true;
      state.error = null;
    },
    fetchGoalsSuccess: (state, action: PayloadAction<IGoal[]>) => {
      state.loading = false;
      state.goals = action.payload;
      state.error = null;
    },
    fetchGoalsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create goal
    createGoalStart: (state, _action: PayloadAction<ICreateGoalPayload>) => {
      state.loading = true;
      state.error = null;
    },
    createGoalSuccess: (state, action: PayloadAction<IGoal>) => {
      state.loading = false;
      state.goals.push(action.payload);
      state.error = null;
    },
    createGoalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update goal
    updateGoalStart: (state, _action: PayloadAction<IUpdateGoalPayload>) => {
      state.loading = true;
      state.error = null;
    },
    updateGoalSuccess: (state, action: PayloadAction<IGoal>) => {
      state.loading = false;
      const index = state.goals.findIndex((goal) => goal.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
      if (state.selectedGoal?.id === action.payload.id) {
        state.selectedGoal = action.payload;
      }
      state.error = null;
    },
    updateGoalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete goal
    deleteGoalStart: (state, _action: PayloadAction<IDeleteGoalPayload>) => {
      state.loading = true;
      state.error = null;
    },
    deleteGoalSuccess: (state, action: PayloadAction<{ id: string }>) => {
      state.loading = false;
      state.goals = state.goals.filter((goal) => goal.id !== action.payload.id);
      if (state.selectedGoal?.id === action.payload.id) {
        state.selectedGoal = null;
      }
      state.error = null;
    },
    deleteGoalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Contribute to goal
    contributeGoalStart: (state, _action: PayloadAction<IContributeGoalPayload>) => {
      state.loading = true;
      state.error = null;
    },
    contributeGoalSuccess: (state, action: PayloadAction<IGoal>) => {
      state.loading = false;
      const index = state.goals.findIndex((goal) => goal.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
      if (state.selectedGoal?.id === action.payload.id) {
        state.selectedGoal = action.payload;
      }
      state.error = null;
    },
    contributeGoalFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Set selected goal
    setSelectedGoal: (state, action: PayloadAction<IGoal | null>) => {
      state.selectedGoal = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetGoalState: () => initialState,
  },
});

export const {
  fetchGoalsStart,
  fetchGoalsSuccess,
  fetchGoalsFailure,
  createGoalStart,
  createGoalSuccess,
  createGoalFailure,
  updateGoalStart,
  updateGoalSuccess,
  updateGoalFailure,
  deleteGoalStart,
  deleteGoalSuccess,
  deleteGoalFailure,
  contributeGoalStart,
  contributeGoalSuccess,
  contributeGoalFailure,
  setSelectedGoal,
  clearError,
  resetGoalState,
} = goalSlice.actions;

export default goalSlice.reducer;
