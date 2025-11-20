/**
 * Summary Stats Widget
 * Displays income, expense, and balance overview
 */
import { ArrowDownOutlined, ArrowUpOutlined, WalletOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { formatCurrency } from '../../../utils/formatters';

interface ISummaryStatsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeChange?: number; // Percentage change from previous period
  expenseChange?: number;
  period?: string; // "Tháng 11/2025"
}

const StatsWrapper = styled.div`
  .stats-card {
    border-left: 4px solid transparent;

    &.income {
      border-left-color: #52c41a;

      .ant-statistic-content {
        color: #52c41a;
      }
    }

    &.expense {
      border-left-color: #f5222d;

      .ant-statistic-content {
        color: #f5222d;
      }
    }

    &.balance {
      border-left-color: #1890ff;

      .ant-statistic-content {
        color: #1890ff;
      }
    }
  }

  .period-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .change-indicator {
    font-size: 12px;
    margin-top: 4px;
  }
`;

export const SummaryStats: React.FC<ISummaryStatsProps> = ({
  totalIncome,
  totalExpense,
  balance,
  incomeChange,
  expenseChange,
  period = 'Tháng này',
}) => {
  return (
    <StatsWrapper>
      <Card>
        <div className="period-header">
          <h3>{period}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>◀</span>
            <span>Hôm nay</span>
            <span>▶</span>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="stats-card income" size="small">
              <Statistic
                title="Thu nhập"
                value={totalIncome}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<ArrowUpOutlined />}
              />
              {incomeChange !== undefined && (
                <div className="change-indicator">
                  <span style={{ color: incomeChange >= 0 ? '#52c41a' : '#f5222d' }}>
                    {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card className="stats-card expense" size="small">
              <Statistic
                title="Chi tiêu"
                value={totalExpense}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<ArrowDownOutlined />}
              />
              {expenseChange !== undefined && (
                <div className="change-indicator">
                  <span style={{ color: expenseChange >= 0 ? '#f5222d' : '#52c41a' }}>
                    {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card className="stats-card balance" size="small">
              <Statistic
                title="Số dư"
                value={balance}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<WalletOutlined />}
              />
              <div className="change-indicator">
                <span style={{ color: '#1890ff' }}>💰</span>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </StatsWrapper>
  );
};

export default SummaryStats;
