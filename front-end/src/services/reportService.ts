/**
 * Report Service
 * Handles financial reports and analytics API calls
 */

import type {
  ICashFlowReport,
  ICategoryDistributionReport,
  IFinancialSummaryReport,
  IIncomeExpenseReport,
  IMonthlyTrendReport,
  ITopSpendingCategoryReport,
} from '@/types/models';
import { API_ENDPOINTS } from '@utils/constants';
import api from './api';

export interface IReportDateRange {
  startDate: string;
  endDate: string;
}

export const reportService = {
  /**
   * Get income vs expense report
   */
  getIncomeExpenseReport: async (params: IReportDateRange): Promise<IIncomeExpenseReport> => {
    return api.get<IIncomeExpenseReport>(API_ENDPOINTS.REPORTS.INCOME_EXPENSE, {
      params,
    });
  },

  /**
   * Get category distribution report
   */
  getCategoryDistribution: async (
    params: IReportDateRange
  ): Promise<ICategoryDistributionReport> => {
    return api.get<ICategoryDistributionReport>(API_ENDPOINTS.REPORTS.CATEGORY_DISTRIBUTION, {
      params,
    });
  },

  /**
   * Get monthly trend report
   */
  getMonthlyTrend: async (params: IReportDateRange): Promise<IMonthlyTrendReport> => {
    return api.get<IMonthlyTrendReport>(API_ENDPOINTS.REPORTS.MONTHLY_TREND, {
      params,
    });
  },

  /**
   * Get cash flow report (income - expense)
   */
  getCashFlowReport: async (params: IReportDateRange): Promise<ICashFlowReport> => {
    return api.get<ICashFlowReport>(API_ENDPOINTS.REPORTS.CASH_FLOW, {
      params,
    });
  },

  /**
   * Get top spending categories
   */
  getTopSpendingCategories: async (
    params: IReportDateRange & { limit?: number }
  ): Promise<ITopSpendingCategoryReport> => {
    return api.get<ITopSpendingCategoryReport>(API_ENDPOINTS.REPORTS.TOP_SPENDING, {
      params,
    });
  },

  /**
   * Get financial summary (overview of all metrics)
   */
  getFinancialSummary: async (params: IReportDateRange): Promise<IFinancialSummaryReport> => {
    return api.get<IFinancialSummaryReport>(API_ENDPOINTS.REPORTS.FINANCIAL_SUMMARY, {
      params,
    });
  },

  /**
   * Get account balance report
   */
  getAccountBalanceReport: async (): Promise<any> => {
    return api.get<any>(API_ENDPOINTS.REPORTS.ACCOUNT_BALANCE);
  },
};
