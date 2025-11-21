/**
 * Dashboard Page Component
 * Main dashboard with widgets and overview
 */
import { ROUTES } from '@/utils/constants';
import { ArrowDownOutlined, ArrowUpOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { transactionActions } from '@redux/modules/transactions';
import { Button, Card, Col, Empty, Progress, Row, Statistic, Table } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Helper functions
const formatDate = (date: Date, _format: string): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Selectors (placeholder - need to be implemented in transaction slice)
const selectTransactions = (state: any) => state.transactions.transactions || [];
const selectIsTransactionLoading = (state: any) => state.transactions.loading || false;
const selectTotalIncome = (state: any) => state.transactions.totalIncome || 0;
const selectTotalExpense = (state: any) => state.transactions.totalExpense || 0;
const selectBalance = (state: any) => state.transactions.balance || 0;
const selectExpenseRatio = (state: any) => state.transactions.expenseRatio || 0;

/**
 * Styled Components
 */
const DashboardWrapper = styled.div`
  .stats-row {
    margin-bottom: 24px;
  }

  .stat-card {
    border-left: 4px solid var(--primary-color);
    height: 100%;

    &.income {
      border-left-color: #52c41a;
    }

    &.expense {
      border-left-color: #ff4d4f;
    }

    &.balance {
      border-left-color: var(--primary-color);
    }
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--primary-color);

    &.income-text {
      color: #52c41a;
    }

    &.expense-text {
      color: #ff4d4f;
    }
  }

  .section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: rgba(0, 0, 0, 0.85);
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .transactions-table {
    .amount {
      font-weight: 600;

      &.income {
        color: #52c41a;
      }

      &.expense {
        color: #ff4d4f;
      }
    }
  }
`;

/**
 * Dashboard Page Component
 */

/**
 * Dashboard Page Component
 */
export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const transactions = useAppSelector(selectTransactions);
  const isLoading = useAppSelector(selectIsTransactionLoading);
  const totalIncome = useAppSelector(selectTotalIncome);
  const totalExpense = useAppSelector(selectTotalExpense);
  const balance = useAppSelector(selectBalance);
  const expenseRatio = useAppSelector(selectExpenseRatio);

  // Load transactions on mount
  useEffect(() => {
    dispatch(transactionActions.listTransactionsRequest({}));
  }, [dispatch]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Table columns
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => formatDate(new Date(date), 'DD/MM/YYYY'),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (_: any, record: any) => record.category?.name || 'N/A',
    },
    {
      title: 'Mô tả',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
    {
      title: 'Tài khoản',
      dataIndex: 'account',
      key: 'account',
      width: 150,
      render: (_: any, record: any) => record.account?.name || 'N/A',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number, record: any) => {
        const isIncome = record.type === 'INCOME' || record.type === 1;
        return (
          <span className={`amount ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? '+' : '-'}
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`${ROUTES.TRANSACTIONS}/${record.id}`)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <DashboardWrapper>
      {/* Statistics Row */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card balance" size="small">
            <Statistic
              title="Số dư"
              value={balance}
              prefix="₫"
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card income" size="small">
            <Statistic
              title="Tổng thu nhập"
              value={totalIncome}
              prefix="₫"
              suffix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card expense" size="small">
            <Statistic
              title="Tổng chi tiêu"
              value={totalExpense}
              prefix="₫"
              suffix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" size="small">
            <div>
              <div style={{ marginBottom: '8px', fontSize: '12px', color: 'rgba(0,0,0,0.45)' }}>
                Tỷ lệ chi tiêu
              </div>
              <Progress type="circle" percent={Math.round(expenseRatio)} width={50} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            Giao dịch gần đây
          </h3>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(ROUTES.TRANSACTIONS_CREATE)}
            >
              Thêm giao dịch
            </Button>
            <Button icon={<EyeOutlined />} onClick={() => navigate(ROUTES.TRANSACTIONS)}>
              Xem tất cả
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
        ) : recentTransactions.length > 0 ? (
          <Table
            className="transactions-table"
            columns={columns}
            dataSource={recentTransactions}
            rowKey="id"
            pagination={false}
            size="small"
            style={{ marginTop: '16px' }}
            loading={isLoading}
          />
        ) : (
          <Empty description="Không có giao dịch" style={{ marginTop: '24px' }} />
        )}
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Button block size="large" type="dashed">
            Thêm tài khoản
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Button block size="large" type="dashed">
            Thêm danh mục
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Button block size="large" type="dashed">
            Xem báo cáo
          </Button>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Button block size="large" type="dashed">
            Cài đặt
          </Button>
        </Col>
      </Row>
    </DashboardWrapper>
  );
};

export default DashboardPage;
