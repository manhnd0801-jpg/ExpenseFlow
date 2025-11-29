/**
 * Event Service
 * Handles event/project management API calls
 */

import type {
  ICreateEventRequest,
  IEvent,
  IEventSummary,
  IUpdateEventRequest,
} from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

export const eventService = {
  /**
   * Get all events for current user
   */
  getEvents: async (): Promise<IEvent[]> => {
    return api.get<IEvent[]>(API_ENDPOINTS.EVENTS.LIST);
  },

  /**
   * Get event by ID
   */
  getEventById: async (id: string): Promise<IEvent> => {
    return api.get<IEvent>(API_ENDPOINTS.EVENTS.GET_BY_ID(id));
  },

  /**
   * Get event summary with transactions
   */
  getEventSummary: async (id: string): Promise<IEventSummary> => {
    return api.get<IEventSummary>(API_ENDPOINTS.EVENTS.SUMMARY(id));
  },

  /**
   * Create new event
   */
  createEvent: async (data: ICreateEventRequest): Promise<IEvent> => {
    const messages = getServiceMessages();
    return api.post<IEvent>(API_ENDPOINTS.EVENTS.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.events.created,
    });
  },

  /**
   * Update existing event
   */
  updateEvent: async (id: string, data: IUpdateEventRequest): Promise<IEvent> => {
    const messages = getServiceMessages();
    return api.patch<IEvent>(API_ENDPOINTS.EVENTS.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.events.updated,
    });
  },

  /**
   * Delete event (soft delete)
   */
  deleteEvent: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.EVENTS.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.events.deleted,
    });
  },
};
