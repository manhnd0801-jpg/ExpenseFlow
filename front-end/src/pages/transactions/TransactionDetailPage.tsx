/**
 * Transaction Detail Page
 * Shows detailed information about a single transaction
 */

import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
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
      message.success('Xóa giao dịch thành công!');
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
        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải...</div>
      </PageWrapper>
    );
  }

  if (!transaction) {
    return (
      <PageWrapper>
        <Empty description="Không tìm thấy giao dịch" />
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Button onClick={handleBack}>Quay lại</Button>
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
          Quay lại
        </Button>
        <h1>Chi tiết giao dịch</h1>
      </div>

      {/* Transaction Info Card */}
      <Card>
        <div className={`amount-display ${isIncome ? 'income' : 'expense'}`}>
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Mô tả">
            {transaction.description || transaction.notes || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Loại giao dịch">
            <Tag color={isIncome ? 'green' : 'red'}>{isIncome ? 'Thu nhập' : 'Chi tiêu'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {/* Category would need to be fetched separately or included in response */}
            Danh mục #{transaction.categoryId}
          </Descriptions.Item>
          <Descriptions.Item label="Tài khoản">
            {/* Account would need to be fetched separately or included in response */}
            Tài khoản #{transaction.accountId}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao dịch">
            {formatDate(new Date(transaction.date), 'DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          {transaction.notes && (
            <Descriptions.Item label="Ghi chú">{transaction.notes}</Descriptions.Item>
          )}
          <Descriptions.Item label="Ngày tạo">
            {formatDate(new Date(transaction.createdAt), 'DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {formatDate(new Date(transaction.updatedAt), 'DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Chỉnh sửa
            </Button>
            <Popconfirm
              title="Xóa giao dịch?"
              description="Bạn có chắc muốn xóa giao dịch này không?"
              onConfirm={handleDelete}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default TransactionDetailPage;
