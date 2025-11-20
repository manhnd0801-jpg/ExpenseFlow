/**
 * Category Redux Selectors
 * Memoized selectors for efficient category state access
 */

import type { RootState } from '@/redux/store';
import { createSelector } from '@reduxjs/toolkit';

// ============================================
// BASE SELECTORS
// ============================================

const selectCategoryState = (state: RootState) => state.categories as any;

// ============================================
// MEMOIZED SELECTORS
// ============================================

export const selectCategories = createSelector([selectCategoryState], (state) => state.categories);

export const selectCurrentCategory = createSelector(
  [selectCategoryState],
  (state) => state.currentCategory
);

export const selectIsCategoryLoading = createSelector(
  [selectCategoryState],
  (state) => state.isLoading
);

export const selectCategoryError = createSelector([selectCategoryState], (state) => state.error);

export const selectCategoryErrors = createSelector([selectCategoryState], (state) => state.errors);

export const selectCategoryPagination = createSelector(
  [selectCategoryState],
  (state) => state.pagination
);

export const selectCategoryFilters = createSelector(
  [selectCategoryState],
  (state) => state.filters
);

export const selectCategoryLastUpdated = createSelector(
  [selectCategoryState],
  (state) => state.lastUpdated
);

// ============================================
// DERIVED SELECTORS
// ============================================

/**
 * Select category by ID
 */
export const selectCategoryById = (id: string) =>
  createSelector([selectCategories], (categories: any[]) =>
    categories.find((cat: any) => cat.id === id)
  );

/**
 * Select active categories only
 */
export const selectActiveCategories = createSelector([selectCategories], (categories: any[]) =>
  categories.filter((cat: any) => cat.isActive)
);

/**
 * Select categories by type
 */
export const selectCategoriesByType = (type: number) =>
  createSelector([selectCategories], (categories: any[]) =>
    categories.filter((cat: any) => cat.type === type)
  );

/**
 * Select categories grouped by type
 */
export const selectCategoriesGroupedByType = createSelector(
  [selectCategories],
  (categories: any[]) => {
    const grouped: Record<number, any[]> = {};
    categories.forEach((category: any) => {
      if (!grouped[category.type]) {
        grouped[category.type] = [];
      }
      grouped[category.type].push(category);
    });
    return grouped;
  }
);

/**
 * Select empty state status (no categories exist)
 */
export const selectIsCategoriesEmpty = createSelector(
  [selectCategories],
  (categories: any[]) => categories.length === 0
);
