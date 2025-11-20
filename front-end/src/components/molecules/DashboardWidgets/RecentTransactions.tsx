/**
 * Recent Transactions Widget
 * Shows latest 5 transactions with quick actions
 */
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, List } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { TransactionType } from '../../../constants/enums';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface ITransaction {
  id: string;
  amount: number;
  type: number; // TransactionType enum
  note?: string;
  date: string;
  categoryName?: string;
  categoryIcon?: string;
  accountName?: string;
}

interface IRecentTransactionsProps {
  transactions: ITransaction[];
  loading?: boolean;
  onViewAll?: () => void;
  onAddNew?: () => void;
}

const TransactionsWrapper = styled.div`
  .transactions-header {
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

  .transaction-item {
    .ant-list-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .transaction-icon {
    font-size: 20px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-right: 12px;
    background: #f0f0f0;
  }

  .transaction-content {
    flex: 1;

    .transaction-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }

    .transaction-title {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .transaction-category {
      font-size: 12px;
      color: #8c8c8c;
    }

    .transaction-amount {
      font-weight: 600;
      font-size: 16px;

      &.income {
        color: #52c41a;
      }

      &.expense {
        color: #f5222d;
      }
    }

    .transaction-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 4px;
    }
  }
`;

export const RecentTransactions: React.FC<IRecentTransactionsProps> = ({
  transactions,
  loading = false,
  onViewAll,
  onAddNew,
}) => {
  const getTransactionIcon = (categoryIcon?: string, type?: number) => {
    if (categoryIcon) return categoryIcon;

    switch (type) {
      case TransactionType.INCOME:
        return '💰';
      case TransactionType.EXPENSE:
        return '💳';
      case TransactionType.TRANSFER:
        return '🔄';
      default:
        return '📝';
    }
  };

  const formatTransactionTime = (date: string) => {
    const transactionDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (transactionDate.toDateString() === today.toDateString()) {
      return `Hôm nay ${formatDate(transactionDate, 'HH:mm')}`;
    }

    if (transactionDate.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }

    return formatDate(transactionDate, 'DD/MM/YYYY');
  };

  return (
    <TransactionsWrapper>
      <Card>
        <div className="transactions-header">
          <h4>Giao dịch gần đây</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="text" size="small" onClick={onViewAll} icon={<EyeOutlined />}>
              Xem tất cả
            </Button>
            <Button type="primary" size="small" onClick={onAddNew} icon={<PlusOutlined />}>
              Thêm
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <Empty description="Chưa có giao dịch nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            className="transaction-item"
            dataSource={transactions.slice(0, 5)}
            loading={loading}
            renderItem={(transaction) => (
              <List.Item style={{ padding: '12px 0', border: 'none' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <div className="transaction-icon">
                    {getTransactionIcon(transaction.categoryIcon, transaction.type)}
                  </div>
                  <div className="transaction-content">
                    <div className="transaction-main">
                      <div>
                        <div className="transaction-title">
                          {transaction.note || transaction.categoryName || 'Giao dịch'}
                        </div>
                        <div className="transaction-category">{transaction.categoryName}</div>
                      </div>
                      <div
                        className={`transaction-amount ${
                          transaction.type === TransactionType.INCOME ? 'income' : 'expense'
                        }`}
                      >
                        {transaction.type === TransactionType.INCOME ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                    <div className="transaction-meta">
                      <span>{formatTransactionTime(transaction.date)}</span>
                      <span>{transaction.accountName}</span>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </TransactionsWrapper>
  );
};

export default RecentTransactions;
