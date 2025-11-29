/**
 * Category Service
 * Handles category-related API calls
 */

import type { ICategory, ICreateCategoryRequest, IUpdateCategoryRequest } from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import { getServiceMessages } from '@utils/i18nService';
import api from './api';

export const categoryService = {
  /**
   * Get all categories for current user
   */
  getCategories: async (): Promise<ICategory[]> => {
    return api.get<ICategory[]>(API_ENDPOINTS.CATEGORIES.LIST);
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (id: string): Promise<ICategory> => {
    return api.get<ICategory>(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
  },

  /**
   * Create new category
   */
  createCategory: async (data: ICreateCategoryRequest): Promise<ICategory> => {
    const messages = getServiceMessages();
    return api.post<ICategory>(API_ENDPOINTS.CATEGORIES.CREATE, data, {
      showSuccessMessage: true,
      successMessage: messages.categories.created,
    });
  },

  /**
   * Update existing category
   */
  updateCategory: async (id: string, data: IUpdateCategoryRequest): Promise<ICategory> => {
    const messages = getServiceMessages();
    return api.patch<ICategory>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: messages.categories.updated,
    });
  },

  /**
   * Delete category (soft delete)
   */
  deleteCategory: async (id: string): Promise<void> => {
    const messages = getServiceMessages();
    return api.delete<void>(API_ENDPOINTS.CATEGORIES.DELETE(id), {
      showSuccessMessage: true,
      successMessage: messages.categories.deleted,
    });
  },
};
