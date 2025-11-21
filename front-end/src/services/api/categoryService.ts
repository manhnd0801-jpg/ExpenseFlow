/**
 * Category Service
 * Handles all category-related API calls
 */

import type {
  ICategory,
  ICategoryListResponse,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from '@/redux/modules/categories';
import apiClient from '../api';

const CATEGORY_ENDPOINTS = {
  LIST: '/categories',
  CREATE: '/categories',
  GET: (id: string) => `/categories/${id}`,
  UPDATE: (id: string) => `/categories/${id}`,
  DELETE: (id: string) => `/categories/${id}`,
};

class CategoryService {
  /**
   * Get list of categories with filters
   */
  async listCategories(filters?: Record<string, any>): Promise<ICategoryListResponse> {
    try {
      const response = await apiClient.get<ICategoryListResponse>(CATEGORY_ENDPOINTS.LIST, {
        params: filters,
      });
      return response as ICategoryListResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(id: string): Promise<ICategory> {
    try {
      const response = await apiClient.get<ICategory>(CATEGORY_ENDPOINTS.GET(id));
      return response as ICategory;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new category
   */
  async createCategory(payload: ICreateCategoryPayload): Promise<ICategory> {
    try {
      const response = await apiClient.post<ICategory>(CATEGORY_ENDPOINTS.CREATE, payload, {
        showSuccessMessage: true,
        successMessage: 'Category created successfully',
      } as any);
      return response as ICategory;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: string, payload: IUpdateCategoryPayload): Promise<ICategory> {
    try {
      const response = await apiClient.put<ICategory>(CATEGORY_ENDPOINTS.UPDATE(id), payload, {
        showSuccessMessage: true,
        successMessage: 'Category updated successfully',
      } as any);
      return response as ICategory;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(CATEGORY_ENDPOINTS.DELETE(id), {
        showSuccessMessage: true,
        successMessage: 'Category deleted successfully',
      } as any);
    } catch (error) {
      throw error;
    }
  }
}

export default new CategoryService();
