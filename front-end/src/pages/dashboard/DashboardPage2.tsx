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
import { DashboardLayout } from '../../components/templates/DashboardLayout';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with Redux state
  const mockStats = {
    totalIncome: 50000000,
    totalExpense: 35000000,
    totalBalance: 15000000,
    monthlyIncome: 8000000,
    monthlyExpense: 5500000,
    monthlyBalance: 2500000,
  };

  const mockBudgets = [
    {
      id: '1',
      name: 'Ăn uống',
      budgetAmount: 2000000,
      spentAmount: 1200000,
      category: 'Ăn uống',
      period: 'monthly',
      color: '#ff6b6b',
    },
    {
      id: '2',
      name: 'Mua sắm',
      budgetAmount: 1500000,
      spentAmount: 900000,
      category: 'Mua sắm',
      period: 'monthly',
      color: '#4ecdc4',
    },
    {
      id: '3',
      name: 'Di chuyển',
      budgetAmount: 1000000,
      spentAmount: 800000,
      category: 'Di chuyển',
      period: 'monthly',
      color: '#45b7d1',
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
    <DashboardLayout>
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
            <BudgetProgress
              budgets={mockBudgets}
              onViewAll={() => navigate('/budgets')}
              onAddNew={() => navigate('/budgets/new')}
            />
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
    </DashboardLayout>
  );
};
