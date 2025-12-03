/**
 * API Route constants for the expense management system
 */
export const ApiRoutes = {
  // Base API prefix
  PREFIX: 'api/v1',

  // Authentication routes
  AUTH: {
    BASE: 'auth',
    LOGIN: 'login',
    REGISTER: 'register',
    LOGOUT: 'logout',
    REFRESH: 'refresh',
    FORGOT_PASSWORD: 'forgot-password',
    RESET_PASSWORD: 'reset-password',
    VERIFY_EMAIL: 'verify-email',
    PROFILE: 'profile',
  },

  // User routes
  USERS: {
    BASE: 'users',
    PROFILE: 'profile',
    CHANGE_PASSWORD: 'change-password',
    UPLOAD_AVATAR: 'upload-avatar',
  },

  // Account routes
  ACCOUNTS: {
    BASE: 'accounts',
    TOTAL_BALANCE: 'total-balance',
    BALANCE: 'balance',
    TRANSFER: 'transfer',
    HISTORY: 'history',
  },

  // Transaction routes
  TRANSACTIONS: {
    BASE: 'transactions',
    SUMMARY: 'summary',
    UPLOAD_RECEIPT: 'upload-receipt',
    RECURRING: 'recurring',
    BULK_IMPORT: 'bulk-import',
    EXPORT: 'export',
    SEARCH: 'search',
  },

  // Category routes
  CATEGORIES: {
    BASE: 'categories',
    DEFAULT: 'default',
    CUSTOM: 'custom',
  },

  // Budget routes
  BUDGETS: {
    BASE: 'budgets',
    PROGRESS: 'progress',
    ALERTS: 'alerts',
  },

  // Goal routes
  GOALS: {
    BASE: 'goals',
    PROGRESS: 'progress',
    CONTRIBUTE: 'contribute',
  },

  // Debt routes
  DEBTS: {
    BASE: 'debts',
    PAYMENTS: 'payments',
    DELETE_PAYMENT: 'payments/:paymentId',
    SUMMARY: 'summary',
    HISTORY: 'history',
  },

  // Loan routes
  LOANS: {
    BASE: 'loans',
    PAYMENTS: 'payments',
    DELETE_PAYMENT: 'payments/:paymentId',
    AMORTIZATION_SCHEDULE: 'amortization-schedule',
    PAYMENT_SCHEDULE: 'payment-schedule', // Payment schedule with status (paid/unpaid)
    SIMULATE_PREPAYMENT: 'simulate-prepayment',
    SCHEDULE: 'schedule',
    PREPAYMENT: 'prepayment',
  },

  // Event routes
  EVENTS: {
    BASE: 'events',
    SUMMARY: 'summary',
    TRANSACTIONS: 'transactions',
    BUDGET: 'budget',
  },

  // Report routes
  REPORTS: {
    BASE: 'reports',
    INCOME_EXPENSE: 'income-expense',
    CATEGORY_DISTRIBUTION: 'category-distribution',
    MONTHLY_TREND: 'monthly-trend',
    ACCOUNT_BALANCE: 'account-balance',
    CASH_FLOW: 'cash-flow',
    TOP_SPENDING: 'top-spending',
    FINANCIAL_SUMMARY: 'financial-summary',
    CATEGORY_ANALYSIS: 'category-analysis',
    TRENDS: 'trends',
    EXPORT: 'export',
  },

  // Reminder routes
  REMINDERS: {
    BASE: 'reminders',
    UPCOMING: 'upcoming',
    BY_TYPE: 'by-type',
    COMPLETE: 'complete',
  },

  // Notification routes
  NOTIFICATIONS: {
    BASE: 'notifications',
    UNREAD: 'unread',
    UNREAD_COUNT: 'unread/count',
    READ: 'read',
    READ_ALL: 'read-all',
    MARK_READ: 'mark-read',
  },

  // Recurring Transaction routes
  RECURRING_TRANSACTIONS: {
    BASE: 'recurring-transactions',
    DUE: 'due',
    TOGGLE_ACTIVE: 'toggle-active',
    EXECUTE: 'execute',
  },

  // Shared book routes
  SHARED_BOOKS: {
    BASE: 'shared-books',
    MEMBERS: 'members',
    INVITE: 'invite',
    ACCEPT: 'accept',
    LEAVE: 'leave',
  },

  // Health check routes
  HEALTH: {
    BASE: 'health',
    DATABASE: 'database',
    REDIS: 'redis',
  },
} as const;
