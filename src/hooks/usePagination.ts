/**
 * usePagination Hook
 * Handle pagination logic for lists and tables
 * Supports page, pageSize, and total items tracking
 */

import { useMemo, useState } from 'react';

/**
 * Pagination state interface
 */
export interface IPaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Pagination result interface
 */
export interface IPaginationResult<T> {
  data: T[];
  pagination: IPaginationState;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setPageSize: (size: number) => void;
  setTotal: (total: number) => void;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * usePagination Hook
 * Manages pagination state and provides utility functions
 *
 * @param items - Full list of items to paginate
 * @param initialPageSize - Initial page size (default: 10)
 * @returns Pagination result with data, state, and utility functions
 *
 * @example
 * const { data, pagination, goToNextPage } = usePagination(allItems, 20);
 * // data contains only items for current page
 * // pagination contains current page, pageSize, total
 */
export const usePagination = <T>(
  items: T[],
  initialPageSize: number = 10
): IPaginationResult<T> => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const total = items.length;

  // Calculate paginated data
  const { data, totalPages, hasNextPage, hasPreviousPage } = useMemo(() => {
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = items.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }, [items, page, pageSize, total]);

  // Navigation functions
  const goToPage = (newPage: number) => {
    const maxPage = Math.ceil(total / pageSize);
    const validPage = Math.max(1, Math.min(newPage, maxPage));
    setPage(validPage);
  };

  const goToNextPage = () => {
    goToPage(page + 1);
  };

  const goToPreviousPage = () => {
    goToPage(page - 1);
  };

  const setPageSize = (newSize: number) => {
    setPageSizeState(Math.max(1, newSize));
    setPage(1); // Reset to first page when page size changes
  };

  const setTotal = (_total: number) => {
    // For external total management (when using server-side pagination)
    // This is a placeholder for potential future enhancements
  };

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
    },
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    setTotal,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

export default usePagination;
