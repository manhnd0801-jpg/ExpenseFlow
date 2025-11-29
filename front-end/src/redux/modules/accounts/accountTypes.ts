/**
 * Account Types & Interfaces
 * Defines all TypeScript interfaces for account management
 */

import { AccountType, Currency } from '@/constants/enums';

// ============================================
// ACCOUNT INTERFACES
// ============================================

/**
 * Account Entity
 */
export interface IAccount {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  currency: Currency; // Currency enum (1=VND, 2=USD, etc.)
  isActive: boolean;
  color?: string;
  icon?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Account Payload
 */
export interface ICreateAccountPayload {
  name: string;
  type: AccountType;
  initialBalance: number;
  currency?: Currency;
  color?: string;
  icon?: string;
  description?: string;
}

/**
 * Update Account Payload
 * Note: type, balance, initialBalance, and currency are immutable after creation
 */
export interface IUpdateAccountPayload {
  id: string;
  name?: string;
  bankName?: string;
  accountNumber?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  includeInTotal?: boolean;
  creditLimit?: number;
  interestRate?: number;
}

/**
 * Delete Account Payload
 */
export interface IDeleteAccountPayload {
  id: string;
}

/**
 * Transfer Between Accounts Payload
 */
export interface ITransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

/**
 * Account Filters
 */
export interface IAccountFilters {
  isActive?: boolean;
  type?: AccountType;
  searchText?: string;
}

/**
 * Account List Query
 */
export interface IAccountListQuery extends IAccountFilters {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'balance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Account Pagination
 */
export interface IAccountPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Account State
 */
export interface IAccountState {
  accounts: IAccount[];
  currentAccount: IAccount | null;
  isLoading: boolean;
  error: string | null;
  errors: {
    list?: string;
    create?: string;
    update?: string;
    delete?: string;
    transfer?: string;
  };
  pagination: IAccountPagination;
  filters: IAccountFilters;
  lastUpdated: string | null;
}

/**
 * Account Pagination Response
 */
export interface IAccountListResponse {
  data: IAccount[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Initial Account State
 */
export const initialAccountState: IAccountState = {
  accounts: [],
  currentAccount: null,
  isLoading: false,
  error: null,
  errors: {
    list: undefined,
    create: undefined,
    update: undefined,
    delete: undefined,
    transfer: undefined,
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
