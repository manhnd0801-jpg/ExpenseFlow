/**
 * Category Saga Integration Tests - C2 Coverage
 * Tests saga flows with API mocking for all conditional branches
 */

import { CategoryType } from '@/constants/enums';
import { categoryService } from '@/services/categoryService';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';
import { describe, it } from 'vitest';
import categorySaga from '../categorySaga';
import { categoryActions } from '../categorySlice';
import { ICategory } from '../categoryTypes';

// Mock category data
const mockCategory: ICategory = {
  id: 'cat-1',
  userId: 'user-1',
  name: 'Groceries',
  type: CategoryType.EXPENSE,
  color: '#FF5722',
  icon: 'shopping-cart',
  description: 'Food and groceries',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockCategory2: ICategory = {
  ...mockCategory,
  id: 'cat-2',
  name: 'Salary',
  type: CategoryType.INCOME,
  color: '#4CAF50',
  icon: 'money',
};

describe('categorySaga - C2 Coverage', () => {
  // ============================================
  // LIST CATEGORIES - C2 Coverage
  // ============================================
  describe('List Categories Flow', () => {
    it('should handle array response successfully (C2: Array.isArray branch)', async () => {
      const categories = [mockCategory, mockCategory2];

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), categories]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories,
            total: 2,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle paginated response successfully (C2: object with pagination)', async () => {
      const paginatedResponse = {
        data: [mockCategory, mockCategory2],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), paginatedResponse]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories: [mockCategory, mockCategory2],
            total: 2,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle response without pagination (C2: fallback to array length)', async () => {
      const response = {
        data: [mockCategory],
      };

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), response]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories: [mockCategory],
            total: 1, // Falls back to categories.length
            page: 1,
            limit: 10,
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle empty array response (C2: empty array branch)', async () => {
      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), []]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories: [],
            total: 0,
            page: 1,
            limit: 10,
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle API error with message (C2: error.message exists)', async () => {
      const error = new Error('Network error');

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), throwError(error)]])
        .put(categoryActions.listCategoriesFailure('Network error'))
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });

    it('should handle API error without message (C2: fallback message)', async () => {
      const error = new Error();
      error.message = ''; // Empty message

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), throwError(error)]])
        .put(categoryActions.listCategoriesFailure('Failed to fetch categories'))
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });
  });

  // ============================================
  // CREATE CATEGORY - C2 Coverage
  // ============================================
  describe('Create Category Flow', () => {
    const createPayload = {
      name: 'New Category',
      type: CategoryType.EXPENSE,
      color: '#FF5722',
      icon: 'shopping',
    };

    it('should create category and refresh list (C2: success path)', async () => {
      await expectSaga(categorySaga)
        .provide([
          [matchers.call.fn(categoryService.createCategory), mockCategory],
          [matchers.call.fn(categoryService.getCategories), [mockCategory]],
        ])
        .put(categoryActions.createCategorySuccess(mockCategory))
        .put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .dispatch(categoryActions.createCategoryRequest(createPayload))
        .silentRun();
    });

    it('should handle create error with message (C2: error.message exists)', async () => {
      const error = new Error('Validation failed');

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.createCategory), throwError(error)]])
        .put(categoryActions.createCategoryFailure('Validation failed'))
        .not.put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .dispatch(categoryActions.createCategoryRequest(createPayload))
        .silentRun();
    });

    it('should handle create error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.createCategory), throwError(error)]])
        .put(categoryActions.createCategoryFailure('Failed to create category'))
        .dispatch(categoryActions.createCategoryRequest(createPayload))
        .silentRun();
    });
  });

  // ============================================
  // UPDATE CATEGORY - C2 Coverage
  // ============================================
  describe('Update Category Flow', () => {
    const updatePayload = {
      id: 'cat-1',
      name: 'Updated Category',
      color: '#2196F3',
    };

    it('should update category and refresh list (C2: success path)', async () => {
      const updatedCategory = { ...mockCategory, name: 'Updated Category' };

      await expectSaga(categorySaga)
        .provide([
          [matchers.call.fn(categoryService.updateCategory), updatedCategory],
          [matchers.call.fn(categoryService.getCategories), [updatedCategory]],
        ])
        .put(categoryActions.updateCategorySuccess(updatedCategory))
        .put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .dispatch(categoryActions.updateCategoryRequest(updatePayload))
        .silentRun();
    });

    it('should handle update error with message (C2: error.message exists)', async () => {
      const error = new Error('Category not found');

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.updateCategory), throwError(error)]])
        .put(categoryActions.updateCategoryFailure('Category not found'))
        .not.put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .dispatch(categoryActions.updateCategoryRequest(updatePayload))
        .silentRun();
    });

    it('should handle update error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.updateCategory), throwError(error)]])
        .put(categoryActions.updateCategoryFailure('Failed to update category'))
        .dispatch(categoryActions.updateCategoryRequest(updatePayload))
        .silentRun();
    });
  });

  // ============================================
  // DELETE CATEGORY - C2 Coverage
  // ============================================
  describe('Delete Category Flow', () => {
    const deletePayload = { id: 'cat-1' };

    it('should delete category and refresh list (C2: success path)', async () => {
      await expectSaga(categorySaga)
        .provide([
          [matchers.call.fn(categoryService.deleteCategory), undefined],
          [matchers.call.fn(categoryService.getCategories), []],
        ])
        .put(categoryActions.deleteCategorySuccess({ id: 'cat-1' }))
        .put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .dispatch(categoryActions.deleteCategoryRequest(deletePayload))
        .silentRun();
    });

    it('should handle delete error with message (C2: error.message exists)', async () => {
      const error = new Error('Cannot delete category in use');

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.deleteCategory), throwError(error)]])
        .put(categoryActions.deleteCategoryFailure('Cannot delete category in use'))
        .not.put(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .dispatch(categoryActions.deleteCategoryRequest(deletePayload))
        .silentRun();
    });

    it('should handle delete error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.deleteCategory), throwError(error)]])
        .put(categoryActions.deleteCategoryFailure('Failed to delete category'))
        .dispatch(categoryActions.deleteCategoryRequest(deletePayload))
        .silentRun();
    });
  });

  // ============================================
  // GET CATEGORY DETAIL - C2 Coverage
  // ============================================
  describe('Get Category Detail Flow', () => {
    const detailPayload = { id: 'cat-1' };

    it('should get category detail successfully (C2: success path)', async () => {
      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategoryById), mockCategory]])
        .put(categoryActions.getCategoryDetailSuccess(mockCategory))
        .dispatch(categoryActions.getCategoryDetailRequest(detailPayload))
        .silentRun();
    });

    it('should handle get detail error with message (C2: error.message exists)', async () => {
      const error = new Error('Category not found');

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategoryById), throwError(error)]])
        .put(categoryActions.getCategoryDetailFailure('Category not found'))
        .dispatch(categoryActions.getCategoryDetailRequest(detailPayload))
        .silentRun();
    });

    it('should handle get detail error without message (C2: fallback message)', async () => {
      const error = new Error();

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategoryById), throwError(error)]])
        .put(categoryActions.getCategoryDetailFailure('Failed to fetch category'))
        .dispatch(categoryActions.getCategoryDetailRequest(detailPayload))
        .silentRun();
    });
  });

  // ============================================
  // EDGE CASES - C2 Coverage
  // ============================================
  describe('Edge Cases', () => {
    it('should use custom page/limit from action (C2: custom pagination)', async () => {
      const response = [mockCategory];

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), response]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories: response,
            total: 1,
            page: 3,
            limit: 20,
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({ page: 3, limit: 20 }))
        .silentRun();
    });

    it('should use default page/limit when not provided (C2: undefined pagination)', async () => {
      const response = [mockCategory];

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), response]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories: response,
            total: 1,
            page: 1, // Default
            limit: 10, // Default
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({}))
        .silentRun();
    });

    it('should handle response with top-level total/page (C2: alternate structure)', async () => {
      const response = {
        data: [mockCategory, mockCategory2],
        total: 5,
        page: 2,
        limit: 10,
      };

      await expectSaga(categorySaga)
        .provide([[matchers.call.fn(categoryService.getCategories), response]])
        .put(
          categoryActions.listCategoriesSuccess({
            categories: [mockCategory, mockCategory2],
            total: 5,
            page: 2,
            limit: 10,
          })
        )
        .dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 10 }))
        .silentRun();
    });
  });
});
