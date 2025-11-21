/**
 * Events Redux Slice
 */

import type { IEvent, IEventSummary } from '@/types/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EventsState {
  events: IEvent[];
  currentEvent: IEvent | null;
  currentEventSummary: IEventSummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  currentEventSummary: null,
  loading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Fetch events
    fetchEventsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventsSuccess: (state, action: PayloadAction<IEvent[]>) => {
      state.events = action.payload;
      state.loading = false;
    },
    fetchEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch single event
    fetchEventByIdRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventByIdSuccess: (state, action: PayloadAction<IEvent>) => {
      state.currentEvent = action.payload;
      state.loading = false;
    },
    fetchEventByIdFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch event summary
    fetchEventSummaryRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventSummarySuccess: (state, action: PayloadAction<IEventSummary>) => {
      state.currentEventSummary = action.payload;
      state.loading = false;
    },
    fetchEventSummaryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create event
    createEventRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createEventSuccess: (state, action: PayloadAction<IEvent>) => {
      state.events.push(action.payload);
      state.loading = false;
    },
    createEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update event
    updateEventRequest: (state, _action: PayloadAction<{ id: string; data: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateEventSuccess: (state, action: PayloadAction<IEvent>) => {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
      if (state.currentEvent?.id === action.payload.id) {
        state.currentEvent = action.payload;
      }
      state.loading = false;
    },
    updateEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete event
    deleteEventRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteEventSuccess: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
      if (state.currentEvent?.id === action.payload) {
        state.currentEvent = null;
      }
      state.loading = false;
    },
    deleteEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear current event
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.currentEventSummary = null;
    },
  },
});

export const {
  fetchEventsRequest,
  fetchEventsSuccess,
  fetchEventsFailure,
  fetchEventByIdRequest,
  fetchEventByIdSuccess,
  fetchEventByIdFailure,
  fetchEventSummaryRequest,
  fetchEventSummarySuccess,
  fetchEventSummaryFailure,
  createEventRequest,
  createEventSuccess,
  createEventFailure,
  updateEventRequest,
  updateEventSuccess,
  updateEventFailure,
  deleteEventRequest,
  deleteEventSuccess,
  deleteEventFailure,
  clearCurrentEvent,
} = eventsSlice.actions;

export const eventReducer = eventsSlice.reducer;
