/**
 * Dashboard Page Component
 * Main dashboard with widgets and overview
 */
import { TransactionType } from '@/constants/enums';
import { ROUTES } from '@/utils/constants';
import { ArrowDownOutlined, ArrowUpOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useI18n } from '@hooks';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { transactionActions } from '@redux/modules/transactions';
import type { ITransaction } from '@redux/modules/transactions/transactionTypes';
import { Button, Card, Col, Empty, Progress, Row, Space, Statistic, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Helper functions
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
  const { t } = useI18n();

  // Get state from Redux
  const transactions = useAppSelector((state) => state.transactions.transactions) || [];
  const isLoading = useAppSelector((state) => state.transactions.isLoading);

  // Load transactions on mount
  useEffect(() => {
    dispatch(transactionActions.listTransactionsRequest({}));
  }, [dispatch]);

  // Calculate statistics from transactions
  const stats = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return { totalIncome: 0, totalExpense: 0, balance: 0, expenseRatio: 0 };
    }

    const totalIncome = transactions
      .filter((t: ITransaction) => t.type === TransactionType.INCOME)
      .reduce((sum: number, t: ITransaction) => Number(sum) + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t: ITransaction) => t.type === TransactionType.EXPENSE)
      .reduce((sum: number, t: ITransaction) => Number(sum) + Number(t.amount), 0);
    const balance = Number(totalIncome) - Number(totalExpense);
    const expenseRatio = totalIncome > 0 ? (Number(totalExpense) / Number(totalIncome)) * 100 : 0;

    return { totalIncome, totalExpense, balance, expenseRatio };
  }, [transactions]);

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Table columns
  const columns = [
    {
      title: t('transactions.date'),
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date: string) => dayjs(date).format('HH:mm DD/MM/YYYY'),
    },
    {
      title: t('transactions.account'),
      dataIndex: 'account',
      key: 'account',
      width: 150,
      render: (_: any, record: ITransaction) => record.account?.name || 'N/A',
    },
    {
      title: t('transactions.category'),
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: any) =>
        category ? (
          <Space>
            {category.icon && <span style={{ color: category.color }}>{category.icon}</span>}
            <span>{category.name}</span>
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: t('transactions.type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (_: any, record: ITransaction) => (
        <Tag color={record.type === TransactionType.INCOME ? 'green' : 'red'}>
          {record.type === TransactionType.INCOME ? 'Thu nhập' : 'Chi tiêu'}
        </Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number, record: ITransaction) => {
        const isIncome = record.type === TransactionType.INCOME;
        return (
          <span className={`amount ${isIncome ? 'income' : 'expense'}`}>
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      title: t('transactions.note'),
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 100,
      render: (_: any, record: ITransaction) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`${ROUTES.TRANSACTIONS}/${record.id}`)}
        >
          {t('common.view')}
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
              title={t('dashboard.balance')}
              value={stats.balance}
              prefix="₫"
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card income" size="small">
            <Statistic
              title="Tổng thu nhập"
              value={stats.totalIncome}
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
              value={stats.totalExpense}
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
              <Progress type="circle" percent={Math.round(stats.expenseRatio)} size={50} />
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
            bordered
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
