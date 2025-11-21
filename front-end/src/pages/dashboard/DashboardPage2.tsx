/**
 * Dashboard Page Component
 * Main dashboard with widgets and overview
 */
import { Col, Row } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BudgetProgress,
  QuickActions,
  RecentTransactions,
  SummaryStats,
} from '../../components/molecules/DashboardWidgets';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with Redux state
  const mockStats = {
    totalIncome: 50000000,
    totalExpense: 35000000,
    balance: 15000000,
    incomeChange: 12.5,
    expenseChange: -8.3,
    period: 'Tháng 11/2025',
  };

  const mockBudgets = [
    {
      id: '1',
      categoryName: 'Ăn uống',
      spent: 3000000,
      budgetAmount: 5000000,
      color: '#FF6384',
    },
    {
      id: '2',
      categoryName: 'Di chuyển',
      spent: 1500000,
      budgetAmount: 2000000,
      color: '#36A2EB',
    },
    {
      id: '3',
      categoryName: 'Giải trí',
      spent: 800000,
      budgetAmount: 1000000,
      color: '#FFCE56',
    },
  ];

  const mockTransactions = [
    {
      id: '1',
      amount: 50000,
      type: 2, // EXPENSE
      note: 'Ăn trưa',
      date: new Date().toISOString(),
      categoryName: 'Ăn uống',
      categoryIcon: '🍽️',
      accountName: 'Tiền mặt',
    },
    {
      id: '2',
      amount: 2000000,
      type: 1, // INCOME
      note: 'Lương tháng 12',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      categoryName: 'Lương',
      categoryIcon: '💰',
      accountName: 'Ngân hàng',
    },
    {
      id: '3',
      amount: 300000,
      type: 2, // EXPENSE
      note: 'Mua quần áo',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      categoryName: 'Mua sắm',
      categoryIcon: '👕',
      accountName: 'Thẻ tín dụng',
    },
  ];

  const handleQuickActions = {
    onAddTransaction: () => navigate('/transactions/new'),
    onTransfer: () => navigate('/transactions/transfer'),
    onViewReports: () => navigate('/reports'),
    onManageAccounts: () => navigate('/accounts'),
    onManageCategories: () => navigate('/categories'),
    onViewBudgets: () => navigate('/budgets'),
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        {/* Summary Statistics */}
        <Col span={24}>
          <SummaryStats {...mockStats} />
        </Col>

        {/* Quick Actions */}
        <Col span={24} lg={8}>
          <QuickActions {...handleQuickActions} />
        </Col>

        {/* Budget Progress */}
        <Col span={24} lg={16}>
          <BudgetProgress budgets={mockBudgets} onViewAll={() => navigate('/budgets')} />
        </Col>

        {/* Recent Transactions */}
        <Col span={24}>
          <RecentTransactions
            transactions={mockTransactions}
            onViewAll={() => navigate('/transactions')}
            onAddNew={() => navigate('/transactions/new')}
          />
        </Col>
      </Row>
    </div>
  );
};
