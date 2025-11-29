/**
 * Transaction Detail Page
 * Shows detailed information about a single transaction
 */

import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useI18n } from '@hooks/useI18n';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import {
  selectCurrentTransaction,
  selectIsTransactionFetching,
  transactionActions,
} from '@redux/modules/transactions';
import { ROUTES } from '@utils/constants';
import { formatCurrency, formatDate } from '@utils/formatters';
import { Button, Card, Descriptions, Empty, Popconfirm, Space, Tag, message } from 'antd';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TransactionType } from '../../constants/enums';

/**
 * Styled Components
 */
const PageWrapper = styled.div`
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }
  }

  .action-buttons {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .amount-display {
    font-size: 32px;
    font-weight: 700;
    margin: 16px 0;

    &.income {
      color: #10b981;
    }

    &.expense {
      color: #ef4444;
    }
  }
`;

/**
 * Transaction Detail Page Component
 */
export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const transaction = useAppSelector(selectCurrentTransaction);
  const isLoading = useAppSelector(selectIsTransactionFetching);

  /**
   * Load transaction on mount
   */
  useEffect(() => {
    if (id) {
      dispatch(transactionActions.getTransactionRequest(id));
    }
  }, [id, dispatch]);

  /**
   * Handle delete transaction
   */
  const handleDelete = () => {
    if (id) {
      dispatch(transactionActions.deleteTransactionRequest({ id }));
      message.success(t('transactions.deleteSuccess'));
      navigate(ROUTES.TRANSACTIONS);
    }
  };

  /**
   * Handle edit transaction
   */
  const handleEdit = () => {
    if (id) {
      navigate(`${ROUTES.TRANSACTIONS}/${id}/edit`);
    }
  };

  /**
   * Handle back
   */
  const handleBack = () => {
    navigate(ROUTES.TRANSACTIONS);
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div style={{ textAlign: 'center', padding: '40px' }}>{t('transactions.loading')}</div>
      </PageWrapper>
    );
  }

  if (!transaction) {
    return (
      <PageWrapper>
        <Empty description={t('transactions.notFound')} />
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button onClick={handleBack}>{t('common.back')}</Button>
        </div>
      </PageWrapper>
    );
  }

  const isIncome = transaction.type === TransactionType.INCOME;

  return (
    <PageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          {t('common.back')}
        </Button>
        <h1>{t('transactions.detail')}</h1>
      </div>

      {/* Transaction Info Card */}
      <Card>
        <div className={`amount-display ${isIncome ? 'income' : 'expense'}`}>
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label={t('transactions.description')}>
            {transaction.description || transaction.note || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.type')}>
            <Tag color={isIncome ? 'green' : 'red'}>
              {isIncome ? t('transactions.income') : t('transactions.expense')}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.category')}>
            {/* Prefer showing category name if available (backend now returns full object) */}
            {transaction.category?.name
              ? transaction.category.name
              : `${t('transactions.category')} #${transaction.categoryId}`}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.account')}>
            {/* Prefer showing account name if available (backend now returns full object) */}
            {transaction.account?.name
              ? transaction.account.name
              : `${t('transactions.account')} #${transaction.accountId}`}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.transactionDate')}>
            {transaction.date ? formatDate(new Date(transaction.date), 'DD/MM/YYYY HH:mm') : '-'}
          </Descriptions.Item>
          {transaction.note && (
            <Descriptions.Item label={t('transactions.note')}>{transaction.note}</Descriptions.Item>
          )}
          <Descriptions.Item label={t('transactions.createdDate')}>
            {transaction.createdAt
              ? formatDate(new Date(transaction.createdAt), 'DD/MM/YYYY HH:mm')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('transactions.updatedDate')}>
            {transaction.updatedAt
              ? formatDate(new Date(transaction.updatedAt), 'DD/MM/YYYY HH:mm')
              : '-'}
          </Descriptions.Item>
        </Descriptions>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              {t('common.edit')}
            </Button>
            <Popconfirm
              title={t('transactions.deleteTransaction')}
              description={t('transactions.deleteConfirmation')}
              onConfirm={handleDelete}
              okText={t('common.delete')}
              cancelText={t('common.cancel')}
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>
                {t('common.delete')}
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default TransactionDetailPage;
