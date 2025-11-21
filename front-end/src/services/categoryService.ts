/**
 * Category Service
 * Handles category-related API calls
 */

import api from './api';
import { API_ENDPOINTS } from '@utils/constants';
import type {
  ICategory,
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
} from '@/types/models';

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
    return api.post<ICategory>(API_ENDPOINTS.CATEGORIES.CREATE, data, {
      showSuccessMessage: true,
      successMessage: 'Tạo danh mục thành công',
    });
  },

  /**
   * Update existing category
   */
  updateCategory: async (id: string, data: IUpdateCategoryRequest): Promise<ICategory> => {
    return api.patch<ICategory>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data, {
      showSuccessMessage: true,
      successMessage: 'Cập nhật danh mục thành công',
    });
  },

  /**
   * Delete category (soft delete)
   */
  deleteCategory: async (id: string): Promise<void> => {
    return api.delete<void>(API_ENDPOINTS.CATEGORIES.DELETE(id), {
      showSuccessMessage: true,
      successMessage: 'Xóa danh mục thành công',
    });
  },
};
