/**
 * Reports Redux Slice
 */

import type {
  ICashFlowReport,
  ICategoryDistributionReport,
  IFinancialSummaryReport,
  IIncomeExpenseReport,
  IMonthlyTrendReport,
  ITopSpendingCategoryReport,
} from '@/types/models';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReportsState {
  incomeExpenseReport: IIncomeExpenseReport | null;
  categoryDistribution: ICategoryDistributionReport | null;
  monthlyTrend: IMonthlyTrendReport | null;
  cashFlowReport: ICashFlowReport | null;
  topSpendingCategories: ITopSpendingCategoryReport | null;
  financialSummary: IFinancialSummaryReport | null;
  accountBalanceReport: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  incomeExpenseReport: null,
  categoryDistribution: null,
  monthlyTrend: null,
  cashFlowReport: null,
  topSpendingCategories: null,
  financialSummary: null,
  accountBalanceReport: null,
  loading: false,
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    // Income/Expense Report
    fetchIncomeExpenseReportRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchIncomeExpenseReportSuccess: (state, action: PayloadAction<IIncomeExpenseReport>) => {
      state.incomeExpenseReport = action.payload;
      state.loading = false;
    },
    fetchIncomeExpenseReportFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Category Distribution
    fetchCategoryDistributionRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCategoryDistributionSuccess: (
      state,
      action: PayloadAction<ICategoryDistributionReport>
    ) => {
      state.categoryDistribution = action.payload;
      state.loading = false;
    },
    fetchCategoryDistributionFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Monthly Trend
    fetchMonthlyTrendRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchMonthlyTrendSuccess: (state, action: PayloadAction<IMonthlyTrendReport>) => {
      state.monthlyTrend = action.payload;
      state.loading = false;
    },
    fetchMonthlyTrendFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Cash Flow Report
    fetchCashFlowReportRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchCashFlowReportSuccess: (state, action: PayloadAction<ICashFlowReport>) => {
      state.cashFlowReport = action.payload;
      state.loading = false;
    },
    fetchCashFlowReportFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Top Spending Categories
    fetchTopSpendingCategoriesRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchTopSpendingCategoriesSuccess: (
      state,
      action: PayloadAction<ITopSpendingCategoryReport>
    ) => {
      state.topSpendingCategories = action.payload;
      state.loading = false;
    },
    fetchTopSpendingCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Financial Summary
    fetchFinancialSummaryRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    fetchFinancialSummarySuccess: (state, action: PayloadAction<IFinancialSummaryReport>) => {
      state.financialSummary = action.payload;
      state.loading = false;
    },
    fetchFinancialSummaryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Account Balance Report
    fetchAccountBalanceReportRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAccountBalanceReportSuccess: (state, action: PayloadAction<any>) => {
      state.accountBalanceReport = action.payload;
      state.loading = false;
    },
    fetchAccountBalanceReportFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Clear reports
    clearReports: (state) => {
      state.incomeExpenseReport = null;
      state.categoryDistribution = null;
      state.monthlyTrend = null;
      state.cashFlowReport = null;
      state.topSpendingCategories = null;
      state.financialSummary = null;
      state.accountBalanceReport = null;
    },
  },
});

export const {
  fetchIncomeExpenseReportRequest,
  fetchIncomeExpenseReportSuccess,
  fetchIncomeExpenseReportFailure,
  fetchCategoryDistributionRequest,
  fetchCategoryDistributionSuccess,
  fetchCategoryDistributionFailure,
  fetchMonthlyTrendRequest,
  fetchMonthlyTrendSuccess,
  fetchMonthlyTrendFailure,
  fetchCashFlowReportRequest,
  fetchCashFlowReportSuccess,
  fetchCashFlowReportFailure,
  fetchTopSpendingCategoriesRequest,
  fetchTopSpendingCategoriesSuccess,
  fetchTopSpendingCategoriesFailure,
  fetchFinancialSummaryRequest,
  fetchFinancialSummarySuccess,
  fetchFinancialSummaryFailure,
  fetchAccountBalanceReportRequest,
  fetchAccountBalanceReportSuccess,
  fetchAccountBalanceReportFailure,
  clearReports,
} = reportsSlice.actions;

export const reportReducer = reportsSlice.reducer;
