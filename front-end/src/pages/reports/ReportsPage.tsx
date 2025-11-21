/**
 * Reports Page
 * Financial reports and analytics
 */
import { ArrowDownOutlined, ArrowUpOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Row, Statistic, Table } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { TransactionType } from '../../constants/enums';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { transactionActions } from '../../redux/modules/transactions';
import type { ITransaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

/**
 * Styled Components
 */
const PageWrapper = styled.div`
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .stats-card {
    border-left: 4px solid var(--primary-color);

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

  .category-table {
    margin-top: 24px;
  }
`;

/**
 * Reports Page Component
 */
export const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.transactions);

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // Load transactions on mount
  useEffect(() => {
    dispatch(transactionActions.listTransactionsRequest({}));
  }, [dispatch]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return transactions;
    }

    return transactions.filter((t: ITransaction) => {
      const transDate = dayjs(t.date);
      return (
        transDate.isAfter(dateRange[0]?.startOf('day')) &&
        transDate.isBefore(dateRange[1]?.endOf('day'))
      );
    });
  }, [transactions, dateRange]);

  // Calculate statistics from filtered transactions
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t: ITransaction) => t.type === TransactionType.INCOME)
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0);
    const expense = filteredTransactions
      .filter((t: ITransaction) => t.type === TransactionType.EXPENSE)
      .reduce((sum: number, t: ITransaction) => sum + t.amount, 0);
    const balance = income - expense;
    const ratio = income > 0 ? (expense / income) * 100 : 0;

    return { income, expense, balance, ratio };
  }, [filteredTransactions]);

  // Group transactions by category
  const categoryStats = useMemo(() => {
    const grouped: Record<string, { name: string; income: number; expense: number }> = {};

    filteredTransactions.forEach((t: ITransaction) => {
      const categoryId = t.categoryId || 'unknown';
      const categoryName = 'Danh mục'; // Simplified since we don't have populated category

      if (!grouped[categoryId]) {
        grouped[categoryId] = { name: categoryName, income: 0, expense: 0 };
      }

      if (t.type === TransactionType.INCOME) {
        grouped[categoryId].income += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        grouped[categoryId].expense += t.amount;
      }
    });

    return Object.values(grouped).sort((a, b) => b.income + b.expense - (a.income + a.expense));
  }, [filteredTransactions]);

  // Category table columns
  const categoryColumns = [
    {
      title: 'Danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Thu nhập',
      dataIndex: 'income',
      key: 'income',
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ color: '#52c41a' }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Chi tiêu',
      dataIndex: 'expense',
      key: 'expense',
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ color: '#ff4d4f' }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Tổng',
      key: 'total',
      align: 'right' as const,
      render: (_: any, record: { income: number; expense: number }) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(record.income - record.expense)}</span>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <h1>Báo cáo tài chính</h1>
        <p>Xem thống kê và phân tích chi tiêu của bạn</p>
      </div>

      {/* Date Range Filter */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 8 }}>Khoảng thời gian:</span>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export reports');
              }}
            >
              Xuất báo cáo
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card balance" size="small">
            <Statistic
              title="Số dư"
              value={stats.balance}
              prefix="₫"
              valueStyle={{ color: 'var(--primary-color)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card income" size="small">
            <Statistic
              title="Tổng thu nhập"
              value={stats.income}
              prefix="₫"
              suffix={<ArrowUpOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card expense" size="small">
            <Statistic
              title="Tổng chi tiêu"
              value={stats.expense}
              prefix="₫"
              suffix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stats-card" size="small">
            <Statistic
              title="Tỷ lệ chi tiêu"
              value={Math.round(stats.ratio)}
              suffix="%"
              valueStyle={{ color: stats.ratio > 80 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Statistics */}
      <Card title="Thống kê theo danh mục">
        <Table
          className="category-table"
          columns={categoryColumns}
          dataSource={categoryStats.map((stat, index) => ({ ...stat, key: index }))}
          pagination={false}
          locale={{ emptyText: 'Chưa có dữ liệu' }}
        />
      </Card>
    </PageWrapper>
  );
};

export default ReportsPage;
