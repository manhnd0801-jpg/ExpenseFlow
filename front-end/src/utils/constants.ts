/**
 * Application Constants
 */

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Expense Flow',
  version: import.meta.env.VITE_APP_VERSION || '0.1.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
};

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

/**
 * Route Paths
 */
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Public
  HOME: '/',
  LANDING: '/landing',

  // Private - Dashboard
  DASHBOARD: '/dashboard',

  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTIONS_CREATE: '/transactions/create',
  TRANSACTIONS_EDIT: '/transactions/:id',

  // Accounts
  ACCOUNTS: '/accounts',
  ACCOUNTS_CREATE: '/accounts/create',
  ACCOUNTS_EDIT: '/accounts/:id',

  // Categories
  CATEGORIES: '/categories',
  CATEGORIES_CREATE: '/categories/create',
  CATEGORIES_EDIT: '/categories/:id',

  // Budgets
  BUDGETS: '/budgets',
  BUDGETS_CREATE: '/budgets/create',
  BUDGETS_EDIT: '/budgets/:id',

  // Goals
  GOALS: '/goals',
  GOALS_CREATE: '/goals/create',
  GOALS_EDIT: '/goals/:id',

  // Debts
  DEBTS: '/debts',
  DEBTS_CREATE: '/debts/create',
  DEBTS_EDIT: '/debts/:id',

  // Events
  EVENTS: '/events',
  EVENTS_CREATE: '/events/create',
  EVENTS_EDIT: '/events/:id',

  // Loans
  LOANS: '/loans',
  LOANS_CREATE: '/loans/create',
  LOANS_EDIT: '/loans/:id',

  // Reminders
  REMINDERS: '/reminders',
  REMINDERS_CREATE: '/reminders/create',
  REMINDERS_EDIT: '/reminders/:id',

  // Reports
  REPORTS: '/reports',

  // Settings
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',

  // 404
  NOT_FOUND: '*',
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    DELETE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/upload-avatar',
  },

  // Accounts
  ACCOUNTS: {
    LIST: '/accounts',
    CREATE: '/accounts',
    GET_BY_ID: (id: string) => `/accounts/${id}`,
    UPDATE: (id: string) => `/accounts/${id}`,
    DELETE: (id: string) => `/accounts/${id}`,
    TOTAL_BALANCE: '/accounts/total-balance',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET_BY_ID: (id: string) => `/categories/${id}`,
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Transactions
  TRANSACTIONS: {
    LIST: '/transactions',
    CREATE: '/transactions',
    GET_BY_ID: (id: string) => `/transactions/${id}`,
    UPDATE: (id: string) => `/transactions/${id}`,
    DELETE: (id: string) => `/transactions/${id}`,
    SUMMARY: '/transactions/summary',
  },

  // Budgets
  BUDGETS: {
    LIST: '/budgets',
    CREATE: '/budgets',
    GET_BY_ID: (id: string) => `/budgets/${id}`,
    UPDATE: (id: string) => `/budgets/${id}`,
    DELETE: (id: string) => `/budgets/${id}`,
  },

  // Goals
  GOALS: {
    LIST: '/goals',
    CREATE: '/goals',
    GET_BY_ID: (id: string) => `/goals/${id}`,
    UPDATE: (id: string) => `/goals/${id}`,
    DELETE: (id: string) => `/goals/${id}`,
    CONTRIBUTE: (id: string) => `/goals/${id}/contribute`,
  },

  // Debts
  DEBTS: {
    LIST: '/debts',
    CREATE: '/debts',
    GET_BY_ID: (id: string) => `/debts/${id}`,
    UPDATE: (id: string) => `/debts/${id}`,
    DELETE: (id: string) => `/debts/${id}`,
    PAYMENTS: (id: string) => `/debts/${id}/payments`,
    CREATE_PAYMENT: (id: string) => `/debts/${id}/payments`,
  },

  // Events
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    GET_BY_ID: (id: string) => `/events/${id}`,
    SUMMARY: (id: string) => `/events/${id}/summary`,
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
  },

  // Reminders
  REMINDERS: {
    LIST: '/reminders',
    CREATE: '/reminders',
    GET_BY_ID: (id: string) => `/reminders/${id}`,
    UPDATE: (id: string) => `/reminders/${id}`,
    DELETE: (id: string) => `/reminders/${id}`,
    UPCOMING: '/reminders/upcoming',
    BY_TYPE: '/reminders/by-type',
    COMPLETE: (id: string) => `/reminders/${id}/complete`,
  },

  // Reports
  REPORTS: {
    INCOME_EXPENSE: '/reports/income-expense',
    CATEGORY_DISTRIBUTION: '/reports/category-distribution',
    MONTHLY_TREND: '/reports/monthly-trend',
    ACCOUNT_BALANCE: '/reports/account-balance',
    CASH_FLOW: '/reports/cash-flow',
    TOP_SPENDING: '/reports/top-spending',
    FINANCIAL_SUMMARY: '/reports/financial-summary',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD: '/notifications/unread',
    UNREAD_COUNT: '/notifications/unread/count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    DELETE_ALL_READ: '/notifications/read/all',
  },
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_TIME: 'YYYY-MM-DDTHH:mm:ss',
  API: 'YYYY-MM-DD',
};

/**
 * Currency Format
 */
export const CURRENCY_FORMAT = {
  DEFAULT: 'VND',
  SYMBOLS: {
    VND: '₫',
    USD: '$',
    EUR: '€',
  },
  LOCALES: {
    VND: 'vi-VN',
    USD: 'en-US',
    EUR: 'en-DE',
  },
};

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

/**
 * Validation
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,
};
