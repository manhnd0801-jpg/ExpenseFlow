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

/**
 * Helper function to check if a reminder should be in upcoming list
 * (within 7 days and not completed)
 */
const isUpcomingReminder = (reminder: IReminder): boolean => {
  if (reminder.isCompleted) return false;

  const reminderDate = new Date(reminder.dueDate);
  const today = new Date();
  const daysUntilReminder = Math.ceil(
    (reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysUntilReminder >= 0 && daysUntilReminder <= 7;
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
      // Add to main reminders list
      state.reminders.push(action.payload);

      // Add to upcoming reminders if applicable
      if (isUpcomingReminder(action.payload)) {
        state.upcomingReminders.push(action.payload);
      }

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
      // Update in main reminders list - move to top
      const index = state.reminders.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        // Remove the updated item from its current position
        state.reminders.splice(index, 1);
        // Add the updated item to the beginning (to match backend updatedAt DESC)
        state.reminders.unshift(action.payload);
      } else {
        // If item not found, add it to the beginning
        state.reminders.unshift(action.payload);
      }

      // Update in upcoming reminders list
      const upcomingIndex = state.upcomingReminders.findIndex((r) => r.id === action.payload.id);
      const shouldBeInUpcoming = isUpcomingReminder(action.payload);

      if (shouldBeInUpcoming && upcomingIndex === -1) {
        // Add to upcoming if it should be there but isn't
        state.upcomingReminders.unshift(action.payload);
      } else if (shouldBeInUpcoming && upcomingIndex !== -1) {
        // Update and move to top in upcoming
        state.upcomingReminders.splice(upcomingIndex, 1);
        state.upcomingReminders.unshift(action.payload);
      } else if (!shouldBeInUpcoming && upcomingIndex !== -1) {
        // Remove from upcoming if it shouldn't be there
        state.upcomingReminders = state.upcomingReminders.filter((r) => r.id !== action.payload.id);
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
      // Update in main reminders list
      const index = state.reminders.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reminders[index] = action.payload;
      }

      // Remove from upcoming reminders (completed reminders shouldn't be in upcoming)
      state.upcomingReminders = state.upcomingReminders.filter((r) => r.id !== action.payload.id);

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
      // Remove from main reminders list
      state.reminders = state.reminders.filter((r) => r.id !== action.payload);
      // Remove from upcoming reminders list
      state.upcomingReminders = state.upcomingReminders.filter((r) => r.id !== action.payload);
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
