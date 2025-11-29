/**
 * Reports Saga
 */

import type {
  ICashFlowReport,
  ICategoryDistributionReport,
  IFinancialSummaryReport,
  IIncomeExpenseReport,
  IMonthlyTrendReport,
  ITopSpendingCategoryReport,
} from '@/types/models';
import { PayloadAction } from '@reduxjs/toolkit';
import { IReportDateRange, reportService } from '@services/reportService';
import { translate } from '@utils/i18nService';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAccountBalanceReportFailure,
  fetchAccountBalanceReportRequest,
  fetchAccountBalanceReportSuccess,
  fetchCashFlowReportFailure,
  fetchCashFlowReportRequest,
  fetchCashFlowReportSuccess,
  fetchCategoryDistributionFailure,
  fetchCategoryDistributionRequest,
  fetchCategoryDistributionSuccess,
  fetchFinancialSummaryFailure,
  fetchFinancialSummaryRequest,
  fetchFinancialSummarySuccess,
  fetchIncomeExpenseReportFailure,
  fetchIncomeExpenseReportRequest,
  fetchIncomeExpenseReportSuccess,
  fetchMonthlyTrendFailure,
  fetchMonthlyTrendRequest,
  fetchMonthlyTrendSuccess,
  fetchTopSpendingCategoriesFailure,
  fetchTopSpendingCategoriesRequest,
  fetchTopSpendingCategoriesSuccess,
} from './reportsSlice';

// Income/Expense Report
function* fetchIncomeExpenseReportSaga(action: PayloadAction<IReportDateRange>) {
  try {
    const report: IIncomeExpenseReport = yield call(
      reportService.getIncomeExpenseReport,
      action.payload
    );
    yield put(fetchIncomeExpenseReportSuccess(report));
  } catch (error: any) {
    yield put(
      fetchIncomeExpenseReportFailure(
        error.message || translate('notifications.error.fetchIncomeExpenseReport')
      )
    );
  }
}

// Category Distribution
function* fetchCategoryDistributionSaga(action: PayloadAction<IReportDateRange>) {
  try {
    const report: ICategoryDistributionReport = yield call(
      reportService.getCategoryDistribution,
      action.payload
    );
    yield put(fetchCategoryDistributionSuccess(report));
  } catch (error: any) {
    yield put(
      fetchCategoryDistributionFailure(
        error.message || translate('notifications.error.fetchCategoryDistribution')
      )
    );
  }
}

// Monthly Trend
function* fetchMonthlyTrendSaga(action: PayloadAction<IReportDateRange>) {
  try {
    const report: IMonthlyTrendReport = yield call(reportService.getMonthlyTrend, action.payload);
    yield put(fetchMonthlyTrendSuccess(report));
  } catch (error: any) {
    yield put(
      fetchMonthlyTrendFailure(error.message || translate('notifications.error.fetchMonthlyTrend'))
    );
  }
}

// Cash Flow Report
function* fetchCashFlowReportSaga(action: PayloadAction<IReportDateRange>) {
  try {
    const report: ICashFlowReport = yield call(reportService.getCashFlowReport, action.payload);
    yield put(fetchCashFlowReportSuccess(report));
  } catch (error: any) {
    yield put(
      fetchCashFlowReportFailure(
        error.message || translate('notifications.error.fetchCashFlowReport')
      )
    );
  }
}

// Top Spending Categories
function* fetchTopSpendingCategoriesSaga(
  action: PayloadAction<IReportDateRange & { limit?: number }>
) {
  try {
    const report: ITopSpendingCategoryReport = yield call(
      reportService.getTopSpendingCategories,
      action.payload
    );
    yield put(fetchTopSpendingCategoriesSuccess(report));
  } catch (error: any) {
    yield put(
      fetchTopSpendingCategoriesFailure(
        error.message || translate('notifications.error.fetchTopSpendingCategories')
      )
    );
  }
}

// Financial Summary
function* fetchFinancialSummarySaga(action: PayloadAction<IReportDateRange>) {
  try {
    const report: IFinancialSummaryReport = yield call(
      reportService.getFinancialSummary,
      action.payload
    );
    yield put(fetchFinancialSummarySuccess(report));
  } catch (error: any) {
    yield put(
      fetchFinancialSummaryFailure(
        error.message || translate('notifications.error.fetchFinancialSummary')
      )
    );
  }
}

// Account Balance Report
function* fetchAccountBalanceReportSaga(): Generator<any, void, any> {
  try {
    const report = yield call(reportService.getAccountBalanceReport);
    yield put(fetchAccountBalanceReportSuccess(report));
  } catch (error: any) {
    yield put(
      fetchAccountBalanceReportFailure(
        error.message || translate('notifications.error.fetchAccountBalanceReport')
      )
    );
  }
}

// Root saga
export default function* reportsSaga() {
  yield takeLatest(fetchIncomeExpenseReportRequest.type, fetchIncomeExpenseReportSaga);
  yield takeLatest(fetchCategoryDistributionRequest.type, fetchCategoryDistributionSaga);
  yield takeLatest(fetchMonthlyTrendRequest.type, fetchMonthlyTrendSaga);
  yield takeLatest(fetchCashFlowReportRequest.type, fetchCashFlowReportSaga);
  yield takeLatest(fetchTopSpendingCategoriesRequest.type, fetchTopSpendingCategoriesSaga);
  yield takeLatest(fetchFinancialSummaryRequest.type, fetchFinancialSummarySaga);
  yield takeLatest(fetchAccountBalanceReportRequest.type, fetchAccountBalanceReportSaga);
}
