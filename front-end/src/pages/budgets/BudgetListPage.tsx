/**
 * Budget List Page
 */
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Progress, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BudgetPeriod } from '../../constants/enums';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { deleteBudgetStart, fetchBudgetsStart } from '../../redux/modules/budgets/budgetSlice';
import type { IBudget } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BudgetListPage: React.FC = () => {
  const { t, getBudgetPeriodLabel } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { budgets, budgetProgress, loading } = useAppSelector((state) => state.budgets);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchBudgetsStart({ page: 1, pageSize: 50 }));
  }, [dispatch]);

  const handleEdit = (budget: IBudget) => {
    navigate(`/budgets/${budget.id}/edit`);
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
    navigate(`/budgets/${budget.id}`);
  };

  const renderProgress = (budget: IBudget) => {
    // const progress = budgetProgress[budget.id];
    // if (!progress) {
    //   return <Progress percent={0} size="small" status="normal" />;
    // }

    const { percentage } = budget;
    if (!percentage) {
      return <Progress percent={0} size="small" status="normal" />;
    }
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
          {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
        </div>
      </div>
    );
  };

  const columns: ColumnsType<IBudget> = [
    {
      title: t('categories.category'),
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => {
        return category?.name || category;
      },
    },
    {
      title: t('budgets.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: t('budgets.period'),
      dataIndex: 'period',
      key: 'period',
      render: (period: BudgetPeriod) => <Tag>{getBudgetPeriodLabel(period)}</Tag>,
    },
    {
      title: t('budgets.timeRange'),
      key: 'dateRange',
      render: (_, budget) => (
        <div>
          <div>{formatDate(budget.startDate)}</div>
          {budget.endDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {t('budgets.to')} {formatDate(budget.endDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('budgets.progress'),
      key: 'progress',
      width: 200,
      render: (_, budget) => renderProgress(budget),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, budget) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(budget)}
            title={t('common.viewDetails')}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(budget)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(budget.id)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('budgets.manageBudgets')}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              navigate('/budgets/create');
            }}
          >
            {t('budgets.createBudget')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={budgets}
          rowKey="id"
          bordered
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('budgets.totalBudgets', { total }),
          }}
        />
      </Card>
      <Modal
        title={t('budgets.deleteBudget')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('budgets.deleteConfirmation')}</p>
        <p>{t('common.irreversibleAction')}</p>
      </Modal>
    </div>
  );
};

export default BudgetListPage;
