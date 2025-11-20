/**
 * Account Types & Interfaces
 * Defines all TypeScript interfaces for account management
 */

import { AccountType } from '@/constants/enums';

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
  currency: string; // ISO 4217 code (VND, USD, etc.)
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
  currency?: string;
  color?: string;
  icon?: string;
  description?: string;
}

/**
 * Update Account Payload
 */
export interface IUpdateAccountPayload {
  id: string;
  name?: string;
  type?: AccountType;
  balance?: number;
  isActive?: boolean;
  color?: string;
  icon?: string;
  description?: string;
}

/**
 * Delete Account Payload
 */
export interface IDeleteAccountPayload {
  id: string;
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
  pageSize?: number;
  sortBy?: 'name' | 'balance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Account Pagination
 */
export interface IAccountPagination {
  page: number;
  pageSize: number;
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
  pageSize: number;
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
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  lastUpdated: null,
};
