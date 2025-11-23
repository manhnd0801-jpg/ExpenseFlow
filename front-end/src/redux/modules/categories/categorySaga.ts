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

    // Handle both array response and paginated response from backend
    let categories: ICategory[] = [];
    let total = 0;
    let page = action.payload.page || 1;
    let limit = action.payload.limit || 10;

    if (Array.isArray(response)) {
      // Direct array response
      categories = response;
      total = response.length;
    } else if (response && typeof response === 'object') {
      // Paginated response: { data: [], pagination: {...} }
      categories = response.data || response;
      total = response.pagination?.total || response.total || categories.length;
      page = response.pagination?.page || response.page || page;
      limit = response.pagination?.limit || response.limit || limit;
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
    const newCategory: ICategory = yield call(categoryService.createCategory, action.payload);

    yield put(categoryActions.createCategorySuccess(newCategory));

    // Refresh category list
    yield put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }));
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
    const updatedCategory: ICategory = yield call(categoryService.updateCategory, id, updateData);

    yield put(categoryActions.updateCategorySuccess(updatedCategory));

    // Refresh category list
    yield put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }));
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

    yield put(categoryActions.deleteCategorySuccess({ id }));

    // Refresh category list
    yield put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }));
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
    const category: ICategory = yield call(categoryService.getCategoryById, id);

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
