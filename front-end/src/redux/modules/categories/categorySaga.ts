/**
 * Category Redux Saga
 * Handles side effects for category operations (API calls, etc.)
 */

import { PayloadAction } from '@reduxjs/toolkit';
import { put, takeEvery } from 'redux-saga/effects';
import { categoryActions } from './categorySlice';
import {
  ICategory,
  ICreateCategoryPayload,
  IDeleteCategoryPayload,
  IUpdateCategoryPayload,
} from './categoryTypes';

// Placeholder for category service (will be implemented)
// import categoryService from '@/services/categoryService';

/**
 * Watch List Categories
 */
function* watchListCategories() {
  try {
    // TODO: Implement API call
    // const response = yield call(categoryService.listCategories, action.payload);

    // Placeholder: Mock data
    const mockCategories: ICategory[] = [];
    yield put(
      categoryActions.listCategoriesSuccess({
        categories: mockCategories,
        total: 0,
        page: 1,
        limit: 10,
      })
    );
  } catch (error: any) {
    yield put(
      categoryActions.listCategoriesFailure(error?.message || 'Failed to fetch categories')
    );
  }
}

/**
 * Watch Create Category
 */
function* watchCreateCategory(action: PayloadAction<ICreateCategoryPayload>) {
  try {
    // TODO: Implement API call
    // const response = yield call(categoryService.createCategory, action.payload);

    // Placeholder: Mock data
    const mockCategory: ICategory = {
      id: Math.random().toString(36).substr(2, 9),
      userId: '',
      name: action.payload.name,
      type: action.payload.type,
      icon: action.payload.icon,
      color: action.payload.color,
      description: action.payload.description,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    yield put(categoryActions.createCategorySuccess(mockCategory));
  } catch (error: any) {
    yield put(categoryActions.createCategoryFailure(error?.message || 'Failed to create category'));
  }
}

/**
 * Watch Update Category
 */
function* watchUpdateCategory(action: PayloadAction<IUpdateCategoryPayload>) {
  try {
    // TODO: Implement API call
    // const response = yield call(categoryService.updateCategory, action.payload.id, action.payload);

    // Placeholder: Mock data
    const mockCategory: ICategory = {
      id: action.payload.id,
      userId: '',
      name: action.payload.name || '',
      type: action.payload.type || 1,
      icon: action.payload.icon,
      color: action.payload.color,
      description: action.payload.description,
      isActive: action.payload.isActive !== undefined ? action.payload.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    yield put(categoryActions.updateCategorySuccess(mockCategory));
  } catch (error: any) {
    yield put(categoryActions.updateCategoryFailure(error?.message || 'Failed to update category'));
  }
}

/**
 * Watch Delete Category
 */
function* watchDeleteCategory(action: PayloadAction<IDeleteCategoryPayload>) {
  try {
    // TODO: Implement API call
    // yield call(categoryService.deleteCategory, action.payload.id);

    yield put(categoryActions.deleteCategorySuccess({ id: action.payload.id }));
  } catch (error: any) {
    yield put(categoryActions.deleteCategoryFailure(error?.message || 'Failed to delete category'));
  }
}

/**
 * Watch Get Category Detail
 */
function* watchGetCategoryDetail(action: PayloadAction<{ id: string }>) {
  try {
    // TODO: Implement API call
    // const response = yield call(categoryService.getCategoryDetail, action.payload.id);

    // Placeholder: Mock data
    const mockCategory: ICategory = {
      id: action.payload.id,
      userId: '',
      name: 'My Category',
      type: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    yield put(categoryActions.getCategoryDetailSuccess(mockCategory));
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
  yield takeEvery(categoryActions.listCategoriesRequest.type, watchListCategories);
  yield takeEvery(categoryActions.createCategoryRequest.type, watchCreateCategory);
  yield takeEvery(categoryActions.updateCategoryRequest.type, watchUpdateCategory);
  yield takeEvery(categoryActions.deleteCategoryRequest.type, watchDeleteCategory);
  yield takeEvery(categoryActions.getCategoryDetailRequest.type, watchGetCategoryDetail);
}
