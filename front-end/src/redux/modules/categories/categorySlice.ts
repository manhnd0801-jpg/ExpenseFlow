/**
 * Category Redux Slice
 * Manages category state with reducers for list, create, update, delete operations
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ICategory,
  ICategoryFilters,
  ICreateCategoryPayload,
  IDeleteCategoryPayload,
  initialCategoryState,
  IUpdateCategoryPayload,
} from './categoryTypes';

const categorySlice = createSlice({
  name: 'categories',
  initialState: initialCategoryState,
  reducers: {
    // ==========================================
    // LIST CATEGORIES
    // ==========================================
    listCategoriesRequest: (state, _action: PayloadAction<ICategoryFilters>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.list = undefined;
    },

    listCategoriesSuccess: (
      state,
      action: PayloadAction<{
        categories: ICategory[];
        total: number;
        page: number;
        pageSize: number;
      }>
    ) => {
      const { categories, total, page, pageSize } = action.payload;
      state.categories = categories;
      state.pagination = {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      };
      state.isLoading = false;
      state.error = null;
      state.errors.list = undefined;
      state.lastUpdated = new Date().toISOString();
    },

    listCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.list = action.payload;
    },

    // ==========================================
    // CREATE CATEGORY
    // ==========================================
    createCategoryRequest: (state, _action: PayloadAction<ICreateCategoryPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.create = undefined;
    },

    createCategorySuccess: (state, action: PayloadAction<ICategory>) => {
      state.categories.unshift(action.payload);
      state.isLoading = false;
      state.error = null;
      state.errors.create = undefined;
    },

    createCategoryFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.create = action.payload;
    },

    // ==========================================
    // UPDATE CATEGORY
    // ==========================================
    updateCategoryRequest: (state, _action: PayloadAction<IUpdateCategoryPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.update = undefined;
    },

    updateCategorySuccess: (state, action: PayloadAction<ICategory>) => {
      const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
      if (index > -1) {
        state.categories[index] = action.payload;
      }
      state.isLoading = false;
      state.error = null;
      state.errors.update = undefined;
    },

    updateCategoryFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.update = action.payload;
    },

    // ==========================================
    // DELETE CATEGORY
    // ==========================================
    deleteCategoryRequest: (state, _action: PayloadAction<IDeleteCategoryPayload>) => {
      state.isLoading = true;
      state.error = null;
      state.errors.delete = undefined;
    },

    deleteCategorySuccess: (state, action: PayloadAction<{ id: string }>) => {
      state.categories = state.categories.filter((cat) => cat.id !== action.payload.id);
      state.isLoading = false;
      state.error = null;
      state.errors.delete = undefined;
    },

    deleteCategoryFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.errors.delete = action.payload;
    },

    // ==========================================
    // GET CATEGORY DETAIL
    // ==========================================
    getCategoryDetailRequest: (state, _action: PayloadAction<{ id: string }>) => {
      state.isLoading = true;
      state.error = null;
    },

    getCategoryDetailSuccess: (state, action: PayloadAction<ICategory>) => {
      state.currentCategory = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    getCategoryDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // ==========================================
    // SET FILTERS
    // ==========================================
    setCategoryFilters: (state, action: PayloadAction<ICategoryFilters>) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },

    // ==========================================
    // SET PAGINATION
    // ==========================================
    setCategoryPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    // ==========================================
    // CLEAR ERRORS
    // ==========================================
    clearCategoryErrors: (state) => {
      state.error = null;
      state.errors = {};
    },

    // ==========================================
    // RESET STATE
    // ==========================================
    resetCategoryState: () => {
      return initialCategoryState;
    },
  },
});

export const categoryActions = categorySlice.actions;
export const categoryReducer = categorySlice.reducer;
export default categorySlice;
