/**
 * Routes Configuration
 * Define application routes
 */

import { AuthLayout } from '@components/templates/AuthLayout';
import { DashboardLayout } from '@components/templates/DashboardLayout';
import { LoginPage } from '@pages/auth/LoginPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { TransactionsPage } from '@pages/transactions';
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// Page imports
import { AccountListPage } from '@pages/accounts';
import ForgotPasswordPage from '@pages/auth/ForgotPasswordPage';
import SignupPage from '@pages/auth/SignupPage';
import { BudgetCreatePage, BudgetDetailPage, BudgetEditPage, BudgetListPage } from '@pages/budgets';
import { CategoryListPage } from '@pages/categories';
import { DebtsListPage } from '@pages/debts';
import { EventsListPage } from '@pages/events';
import { GoalsListPage } from '@pages/goals';
import I18nTestPage from '@pages/I18nTestPage';
import LoanDetailPage from '@pages/loans/LoanDetailPage';
import LoanForm from '@pages/loans/LoanForm';
import LoansListPage from '@pages/loans/LoansListPage';
import { RemindersListPage } from '@pages/reminders';
import { ReportsPage } from '@pages/reports';
import { SettingsPage } from '@pages/settings';
import { TransactionDetailPage } from '@pages/transactions';

/**
 * Route Configuration Type
 */
interface IRouteConfig {
  path: string;
  element: React.ReactNode;
  isPrivate: boolean;
  layout?: 'auth' | 'dashboard';
}

/**
 * Route Configurations Array
 */
const routeConfigs: IRouteConfig[] = [
  // Public Routes - Auth
  {
    path: '/login',
    element: <LoginPage />,
    isPrivate: false,
    layout: 'auth',
  },
  {
    path: '/signup',
    element: <SignupPage />,
    isPrivate: false,
    layout: 'auth',
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    isPrivate: false,
    layout: 'auth',
  },

  // Private Routes - Main Pages
  {
    path: '/dashboard',
    element: <DashboardPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/transactions',
    element: <TransactionsPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/transactions/:id',
    element: <TransactionDetailPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/accounts',
    element: <AccountListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/categories',
    element: <CategoryListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },

  // Budgets Routes
  {
    path: '/budgets',
    element: <BudgetListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/budgets/create',
    element: <BudgetCreatePage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/budgets/:id',
    element: <BudgetDetailPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/budgets/:id/edit',
    element: <BudgetEditPage />,
    isPrivate: true,
    layout: 'dashboard',
  },

  // Goals, Debts, Loans
  {
    path: '/goals',
    element: <GoalsListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/debts',
    element: <DebtsListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/loans',
    element: <LoansListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/loans/create',
    element: <LoanForm />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/loans/:id',
    element: <LoanDetailPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/loans/:id/edit',
    element: <LoanForm />,
    isPrivate: true,
    layout: 'dashboard',
  },

  // Events, Reminders, Reports, Settings
  {
    path: '/events',
    element: <EventsListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/reminders',
    element: <RemindersListPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/reports',
    element: <ReportsPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    isPrivate: true,
    layout: 'dashboard',
  },

  // Dev/Test Routes
  {
    path: '/i18n-test',
    element: <I18nTestPage />,
    isPrivate: true,
    layout: 'dashboard',
  },
];

/**
 * Render route with appropriate wrapper
 */
const renderRoute = (config: IRouteConfig) => {
  const { path, element, isPrivate, layout } = config;

  // Wrap with layout
  let wrappedElement = element;
  if (layout === 'auth') {
    wrappedElement = <AuthLayout>{element}</AuthLayout>;
  } else if (layout === 'dashboard') {
    wrappedElement = <DashboardLayout>{element}</DashboardLayout>;
  }

  // Wrap with route guard
  if (isPrivate) {
    wrappedElement = <PrivateRoute>{wrappedElement}</PrivateRoute>;
  } else {
    wrappedElement = <PublicRoute>{wrappedElement}</PublicRoute>;
  }

  return <Route key={path} path={path} element={wrappedElement} />;
};

/**
 * App Routes
 */
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Map all configured routes */}
      {routeConfigs.map((config) => renderRoute(config))}

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
