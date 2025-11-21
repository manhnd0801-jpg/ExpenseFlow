/**
 * Budget List Page
 */
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Progress, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { BudgetPeriodLabels } from '../../constants/enum-labels';
import { BudgetPeriod } from '../../constants/enums';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { deleteBudgetStart, fetchBudgetsStart } from '../../redux/modules/budgets/budgetSlice';
import type { IBudget } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BudgetListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { budgets, budgetProgress, loading } = useAppSelector((state) => state.budgets);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBudgetsStart({ page: 1, pageSize: 50 }));
  }, [dispatch]);

  const handleEdit = (budget: IBudget) => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit budget:', budget);
  };

  const handleDelete = (budgetId: string) => {
    setSelectedBudgetId(budgetId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedBudgetId) {
      dispatch(deleteBudgetStart({ id: selectedBudgetId }));
      setIsDeleteModalVisible(false);
      setSelectedBudgetId(null);
    }
  };

  const handleView = (budget: IBudget) => {
    // TODO: Navigate to budget detail page
    console.log('View budget:', budget);
  };

  const renderProgress = (budget: IBudget) => {
    const progress = budgetProgress[budget.id];
    if (!progress) {
      return <Progress percent={0} size="small" status="normal" />;
    }

    const { percentage, totalSpent, totalBudget } = progress;
    let status: 'normal' | 'exception' | 'success' = 'normal';

    if (percentage >= 100) {
      status = 'exception';
    } else if (percentage >= 80) {
      status = 'success';
    }

    return (
      <div>
        <Progress
          percent={Math.min(percentage, 100)}
          size="small"
          status={status}
          format={() => `${percentage.toFixed(1)}%`}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
        </div>
      </div>
    );
  };

  const columns: ColumnsType<IBudget> = [
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: string) => {
        // TODO: Get category name from categories state
        return categoryId || 'Tất cả danh mục';
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Kỳ hạn',
      dataIndex: 'period',
      key: 'period',
      render: (period: BudgetPeriod) => (
        <Tag>{BudgetPeriodLabels[period as keyof typeof BudgetPeriodLabels]}</Tag>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dateRange',
      render: (_, budget) => (
        <div>
          <div>{formatDate(budget.startDate)}</div>
          {budget.endDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>đến {formatDate(budget.endDate)}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 200,
      render: (_, budget) => renderProgress(budget),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, budget) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(budget)}
            title="Xem chi tiết"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(budget)}
            title="Chỉnh sửa"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(budget.id)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý Ngân sách"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // TODO: Navigate to create budget page
              console.log('Create budget');
            }}
          >
            Tạo ngân sách
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={budgets}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} ngân sách`,
          }}
        />
      </Card>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa ngân sách này không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default BudgetListPage;
