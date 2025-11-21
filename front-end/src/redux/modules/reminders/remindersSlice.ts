/**
 * Reminders Redux Slice
 */

import type { ReminderType } from '@/constants/enums';
import type { IReminder } from '@/types/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RemindersState {
  reminders: IReminder[];
  upcomingReminders: IReminder[];
  currentReminder: IReminder | null;
  loading: boolean;
  error: string | null;
}

const initialState: RemindersState = {
  reminders: [],
  upcomingReminders: [],
  currentReminder: null,
  loading: false,
  error: null,
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    // Fetch reminders
    fetchRemindersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRemindersSuccess: (state, action: PayloadAction<IReminder[]>) => {
      state.reminders = action.payload;
      state.loading = false;
    },
    fetchRemindersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch upcoming reminders
    fetchUpcomingRemindersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUpcomingRemindersSuccess: (state, action: PayloadAction<IReminder[]>) => {
      state.upcomingReminders = action.payload;
      state.loading = false;
    },
    fetchUpcomingRemindersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch reminders by type
    fetchRemindersByTypeRequest: (state, _action: PayloadAction<ReminderType>) => {
      state.loading = true;
      state.error = null;
    },
    fetchRemindersByTypeSuccess: (state, action: PayloadAction<IReminder[]>) => {
      state.reminders = action.payload;
      state.loading = false;
    },
    fetchRemindersByTypeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create reminder
    createReminderRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createReminderSuccess: (state, action: PayloadAction<IReminder>) => {
      state.reminders.push(action.payload);
      state.loading = false;
    },
    createReminderFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update reminder
    updateReminderRequest: (state, _action: PayloadAction<{ id: string; data: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateReminderSuccess: (state, action: PayloadAction<IReminder>) => {
      const index = state.reminders.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reminders[index] = action.payload;
      }
      state.loading = false;
    },
    updateReminderFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Mark reminder complete
    markReminderCompleteRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    markReminderCompleteSuccess: (state, action: PayloadAction<IReminder>) => {
      const index = state.reminders.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reminders[index] = action.payload;
      }
      state.loading = false;
    },
    markReminderCompleteFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete reminder
    deleteReminderRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteReminderSuccess: (state, action: PayloadAction<string>) => {
      state.reminders = state.reminders.filter((r) => r.id !== action.payload);
      state.loading = false;
    },
    deleteReminderFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchRemindersRequest,
  fetchRemindersSuccess,
  fetchRemindersFailure,
  fetchUpcomingRemindersRequest,
  fetchUpcomingRemindersSuccess,
  fetchUpcomingRemindersFailure,
  fetchRemindersByTypeRequest,
  fetchRemindersByTypeSuccess,
  fetchRemindersByTypeFailure,
  createReminderRequest,
  createReminderSuccess,
  createReminderFailure,
  updateReminderRequest,
  updateReminderSuccess,
  updateReminderFailure,
  markReminderCompleteRequest,
  markReminderCompleteSuccess,
  markReminderCompleteFailure,
  deleteReminderRequest,
  deleteReminderSuccess,
  deleteReminderFailure,
} = remindersSlice.actions;

export const reminderReducer = remindersSlice.reducer;
