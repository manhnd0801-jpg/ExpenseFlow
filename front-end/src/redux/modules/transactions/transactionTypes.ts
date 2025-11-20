/**
 * Transaction Types & Interfaces
 * Defines all TypeScript interfaces and enums for transaction management
 */

// ============================================
// TRANSACTION ENUMS
// ============================================

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ============================================
// TRANSACTION INTERFACES
// ============================================

/**
 * Transaction Entity
 */
export interface ITransaction {
  id: string;
  userId: string;
  categoryId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // ISO 8601 format
  status: TransactionStatus;
  notes?: string;
  tags?: string[];
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
  date: string;
  notes?: string;
  tags?: string[];
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
  date?: string;
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
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
  type?: TransactionType;
  status?: TransactionStatus;
  searchText?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Transaction List Query
 */
export interface ITransactionListQuery extends ITransactionFilters {
  page?: number;
  pageSize?: number;
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
    pageSize: number;
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
    pageSize: number;
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
    pageSize: 10,
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
