/**
 * API Routes Constants (Frontend)
 * Mirror of backend API routes for consistent endpoint management
 */

export const ApiRoutes = {
  // Loan routes
  LOANS: {
    BASE: 'loans',
    AMORTIZATION_SCHEDULE: 'amortization-schedule',
    SIMULATE_PREPAYMENT: 'simulate-prepayment',
    PAYMENTS: 'payments',
    PAYMENT_SCHEDULE: 'payment-schedule',
  },

  // Account routes
  ACCOUNTS: {
    BASE: 'accounts',
    TOTAL_BALANCE: 'total-balance',
    TRANSFER: 'transfer',
  },

  // Transaction routes
  TRANSACTIONS: {
    BASE: 'transactions',
    SUMMARY: 'summary',
  },

  // Category routes
  CATEGORIES: {
    BASE: 'categories',
  },

  // Budget routes
  BUDGETS: {
    BASE: 'budgets',
  },

  // Goal routes
  GOALS: {
    BASE: 'goals',
    CONTRIBUTE: 'contribute',
    WITHDRAW: 'withdraw',
    TRANSACTIONS: 'transactions',
  },

  // Debt routes
  DEBTS: {
    BASE: 'debts',
    PAYMENTS: 'payments',
  },

  // Event routes
  EVENTS: {
    BASE: 'events',
    SUMMARY: 'summary',
  },

  // Reminder routes
  REMINDERS: {
    BASE: 'reminders',
    UPCOMING: 'upcoming',
    BY_TYPE: 'by-type',
    COMPLETE: 'complete',
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
} as const;

/**
 * Build API path
 * @param route - Route constant from ApiRoutes
 * @returns API path without prefix (baseURL already includes /api/v1)
 */
export const buildApiPath = (route: string): string => {
  return `/${route}`;
};

/**
 * Build resource path with ID
 * @param baseRoute - Base route (e.g., 'loans')
 * @param id - Resource ID
 * @returns API path with ID (e.g., /loans/uuid)
 */
export const buildResourcePath = (baseRoute: string, id: string): string => {
  return `/${baseRoute}/${id}`;
};
