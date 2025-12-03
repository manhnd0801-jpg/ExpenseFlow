/**
 * Transaction Types & Interfaces
 * Defines all TypeScript interfaces and enums for transaction management
 */

import { TransactionType } from '../../../constants/enums';

// Re-export TransactionType enum for use in components
export { TransactionType };

// ============================================
// TRANSACTION INTERFACES
// ============================================

/**
 * Transaction Entity
 * IMPORTANT: Backend returns 'date' field (not transactionDate)
 */
export interface ITransaction {
  id: string;
  userId: string;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For TRANSFER transactions
  loanId?: string; // For loan disbursement transactions
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO 8601 format - Backend field name is 'date'
  note?: string;
  tags?: string[];
  imageUrl?: string | null;
  eventId?: string | null;

  // Populated fields from backend (when using relations)
  category?: {
    id: string;
    name: string;
    type: number;
    icon?: string;
    color?: string;
  };
  account?: {
    id: string;
    name: string;
    type: number;
    balance: number;
    currency: string;
  };
  toAccount?: {
    id: string;
    name: string;
    type: number;
    balance: number;
    currency: string;
  };
  event?: {
    id: string;
    name: string;
  };

  createdAt: string;
  updatedAt: string;
}

/**
 * Create Transaction Payload
 */
export interface ICreateTransactionPayload {
  categoryId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // Backend expects 'date' field
  note?: string;
  tags?: string[];
  imageUrl?: string;
  eventId?: string;
  toAccountId?: string; // For transfer transactions
}

/**
 * Update Transaction Payload
 */
export interface IUpdateTransactionPayload {
  id: string;
  categoryId?: string;
  accountId?: string;
  type?: TransactionType;
  amount?: number;
  description?: string;
  date?: string; // Backend expects 'date' field
  note?: string;
  tags?: string[];
  imageUrl?: string;
  eventId?: string;
}

/**
 * Delete Transaction Payload
 */
export interface IDeleteTransactionPayload {
  id: string;
}

/**
 * Transaction Filters
 */
export interface ITransactionFilters {
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  categoryId?: string;
  accountId?: string;
  eventId?: string;
  type?: TransactionType;
  search?: string; // Backend expects 'search' not 'searchText'
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Transaction List Query
 */
export interface ITransactionListQuery extends ITransactionFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Transaction API Response
 */
export interface ITransactionResponse {
  success: boolean;
  message?: string;
  data?: ITransaction | ITransaction[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Transaction State
 */
export interface ITransactionState {
  // Data
  transactions: ITransaction[];
  currentTransaction: ITransaction | null;

  // Filters
  filters: ITransactionFilters;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Loading States
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error Handling
  error: string | null;
  errors: {
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
  };

  // Success Messages
  successMessage: string | null;
}

/**
 * Initial Transaction State
 */
export const initialTransactionState: ITransactionState = {
  transactions: [],
  currentTransaction: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  errors: {
    list: undefined,
    create: undefined,
    update: undefined,
    delete: undefined,
  },
  successMessage: null,
};
