/**
 * Category Redux Saga
 * Handles side effects for category operations (API calls, etc.)
 */

import { categoryService } from '@/services/categoryService';
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeEvery } from 'redux-saga/effects';
import { categoryActions } from './categorySlice';
import {
  ICategory,
  ICategoryListQuery,
  ICreateCategoryPayload,
  IDeleteCategoryPayload,
  IUpdateCategoryPayload,
} from './categoryTypes';

/**
 * List Categories Saga
 */
function* listCategoriesSaga(action: PayloadAction<ICategoryListQuery>): Generator<any, void, any> {
  try {
    const response: any = yield call(categoryService.getCategories);

    // Handle paginated response from backend
    // After Phase 1: Backend returns { items: [], total, page, limit, totalPages }
    let categories: ICategory[] = [];
    let total = 0;
    let page = action.payload.page || 1;
    let limit = action.payload.limit || 10;

    if (Array.isArray(response)) {
      // Direct array response (fallback)
      categories = response;
      total = response.length;
    } else if (response && typeof response === 'object') {
      // ✅ Standardized paginated response: { items: [], total, page, limit, totalPages }
      categories = response.items || response.data || response;
      total = response.total || categories.length;
      page = response.page || page;
      limit = response.limit || limit;
    }

    yield put(
      categoryActions.listCategoriesSuccess({
        categories,
        total,
        page,
        limit,
      })
    );
  } catch (error: any) {
    yield put(
      categoryActions.listCategoriesFailure(error?.message || 'Failed to fetch categories')
    );
  }
}

/**
 * Create Category Saga
 */
function* createCategorySaga(
  action: PayloadAction<ICreateCategoryPayload>
): Generator<any, void, any> {
  try {
    const response: any = yield call(categoryService.createCategory, action.payload);
    // Extract data from wrapped response {success, data, message}
    const newCategory: ICategory = response.data || response;

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(categoryActions.createCategorySuccess(newCategory));
  } catch (error: any) {
    yield put(categoryActions.createCategoryFailure(error?.message || 'Failed to create category'));
  }
}

/**
 * Update Category Saga
 */
function* updateCategorySaga(
  action: PayloadAction<IUpdateCategoryPayload>
): Generator<any, void, any> {
  try {
    const { id, ...updateData } = action.payload;
    const response: any = yield call(categoryService.updateCategory, id, updateData);
    // Extract data from wrapped response {success, data, message}
    const updatedCategory: ICategory = response.data || response;

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(categoryActions.updateCategorySuccess(updatedCategory));
  } catch (error: any) {
    yield put(categoryActions.updateCategoryFailure(error?.message || 'Failed to update category'));
  }
}

/**
 * Delete Category Saga
 */
function* deleteCategorySaga(
  action: PayloadAction<IDeleteCategoryPayload>
): Generator<any, void, any> {
  try {
    const { id } = action.payload;
    yield call(categoryService.deleteCategory, id);

    // ✅ Store will be updated directly by slice reducer - No need to refetch list
    yield put(categoryActions.deleteCategorySuccess({ id }));
  } catch (error: any) {
    yield put(categoryActions.deleteCategoryFailure(error?.message || 'Failed to delete category'));
  }
}

/**
 * Get Category Detail Saga
 */
function* getCategoryDetailSaga(action: PayloadAction<{ id: string }>): Generator<any, void, any> {
  try {
    const { id } = action.payload;
    const response: any = yield call(categoryService.getCategoryById, id);
    // Extract data from wrapped response {success, data, message}
    const category: ICategory = response.data || response;

    yield put(categoryActions.getCategoryDetailSuccess(category));
  } catch (error: any) {
    yield put(
      categoryActions.getCategoryDetailFailure(error?.message || 'Failed to fetch category')
    );
  }
}

/**
 * Root Category Saga
 */
export default function* categorySaga() {
  yield takeEvery(categoryActions.listCategoriesRequest.type, listCategoriesSaga);
  yield takeEvery(categoryActions.createCategoryRequest.type, createCategorySaga);
  yield takeEvery(categoryActions.updateCategoryRequest.type, updateCategorySaga);
  yield takeEvery(categoryActions.deleteCategoryRequest.type, deleteCategorySaga);
  yield takeEvery(categoryActions.getCategoryDetailRequest.type, getCategoryDetailSaga);
}
