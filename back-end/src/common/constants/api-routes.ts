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
    BALANCE: 'balance',
    TRANSFER: 'transfer',
    HISTORY: 'history',
  },

  // Transaction routes
  TRANSACTIONS: {
    BASE: 'transactions',
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
    HISTORY: 'history',
  },

  // Loan routes
  LOANS: {
    BASE: 'loans',
    PAYMENTS: 'payments',
    SCHEDULE: 'schedule',
    PREPAYMENT: 'prepayment',
  },

  // Event routes
  EVENTS: {
    BASE: 'events',
    TRANSACTIONS: 'transactions',
    BUDGET: 'budget',
  },

  // Report routes
  REPORTS: {
    BASE: 'reports',
    INCOME_EXPENSE: 'income-expense',
    CATEGORY_ANALYSIS: 'category-analysis',
    CASH_FLOW: 'cash-flow',
    TRENDS: 'trends',
    EXPORT: 'export',
  },

  // Reminder routes
  REMINDERS: {
    BASE: 'reminders',
    UPCOMING: 'upcoming',
  },

  // Notification routes
  NOTIFICATIONS: {
    BASE: 'notifications',
    UNREAD: 'unread',
    MARK_READ: 'mark-read',
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