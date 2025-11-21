/**
 * Category Types & Interfaces
 * Defines all TypeScript interfaces for category management
 */

import { CategoryType } from '@/constants/enums';

// ============================================
// CATEGORY INTERFACES
// ============================================

/**
 * Category Entity
 */
export interface ICategory {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Category Payload
 */
export interface ICreateCategoryPayload {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  description?: string;
}

/**
 * Update Category Payload
 */
export interface IUpdateCategoryPayload {
  id: string;
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Delete Category Payload
 */
export interface IDeleteCategoryPayload {
  id: string;
}

/**
 * Category Filters
 */
export interface ICategoryFilters {
  type?: CategoryType;
  isActive?: boolean;
  searchText?: string;
}

/**
 * Category List Query
 */
export interface ICategoryListQuery extends ICategoryFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Category Pagination
 */
export interface ICategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Category State
 */
export interface ICategoryState {
  categories: ICategory[];
  currentCategory: ICategory | null;
  isLoading: boolean;
  error: string | null;
  errors: {
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
  pagination: ICategoryPagination;
  filters: ICategoryFilters;
  lastUpdated: string | null;
}

/**
 * Category List Response
 */
export interface ICategoryListResponse {
  data: ICategory[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Initial Category State
 */
export const initialCategoryState: ICategoryState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
  errors: {
    list: undefined,
    create: undefined,
    update: undefined,
    delete: undefined,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  lastUpdated: null,
};
