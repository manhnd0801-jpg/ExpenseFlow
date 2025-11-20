/**
 * Budget Progress Widget
 * Shows budget progress for current month
 */
import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Progress } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { formatCurrency } from '../../../utils/formatters';

interface IBudgetItem {
  id: string;
  categoryName: string;
  categoryIcon?: string;
  spent: number;
  budgetAmount: number;
  color?: string;
}

interface IBudgetProgressProps {
  budgets: IBudgetItem[];
  onViewAll?: () => void;
}

const BudgetWrapper = styled.div`
  .budget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .budget-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .budget-icon {
    font-size: 20px;
    margin-right: 12px;
    width: 24px;
    text-align: center;
  }

  .budget-info {
    flex: 1;
    margin-right: 16px;

    .category-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .budget-amounts {
      font-size: 12px;
      color: #8c8c8c;
    }
  }

  .budget-progress {
    width: 120px;
  }
`;

export const BudgetProgress: React.FC<IBudgetProgressProps> = ({ budgets, onViewAll }) => {
  const getBudgetStatus = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'exception';
    if (percentage >= 80) return 'active';
    return 'normal';
  };

  const getBudgetColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return '#f5222d';
    if (percentage >= 80) return '#faad14';
    return '#52c41a';
  };

  return (
    <BudgetWrapper>
      <Card>
        <div className="budget-header">
          <h4>Ngân sách tháng này</h4>
          <Button type="text" size="small" onClick={onViewAll} icon={<EyeOutlined />}>
            Xem tất cả
          </Button>
        </div>

        {budgets.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
            Chưa có ngân sách nào được thiết lập
          </div>
        ) : (
          budgets.slice(0, 4).map((budget) => {
            const percentage = Math.min((budget.spent / budget.budgetAmount) * 100, 100);
            const status = getBudgetStatus(budget.spent, budget.budgetAmount);
            const color = getBudgetColor(budget.spent, budget.budgetAmount);

            return (
              <div key={budget.id} className="budget-item">
                <div className="budget-icon">{budget.categoryIcon || '📊'}</div>
                <div className="budget-info">
                  <div className="category-name">{budget.categoryName}</div>
                  <div className="budget-amounts">
                    {formatCurrency(budget.spent)}/{formatCurrency(budget.budgetAmount)}
                  </div>
                </div>
                <div className="budget-progress">
                  <Progress
                    percent={percentage}
                    size="small"
                    status={status}
                    strokeColor={color}
                    format={() => `${percentage.toFixed(0)}%`}
                  />
                </div>
              </div>
            );
          })
        )}
      </Card>
    </BudgetWrapper>
  );
};

export default BudgetProgress;
