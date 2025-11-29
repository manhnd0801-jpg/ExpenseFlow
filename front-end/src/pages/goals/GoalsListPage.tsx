/**
 * Goals List Page
 */
import {
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Modal, Progress, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { ContributeGoalModal, GoalDetailModal } from '../../components/molecules';
import { GoalForm } from '../../components/molecules/GoalForm';
import { GoalStatus } from '../../constants/enums';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import {
  clearError,
  contributeGoalStart,
  createGoalStart,
  deleteGoalStart,
  fetchGoalsStart,
  updateGoalStart,
} from '../../redux/modules/goals/goalSlice';
import type { IGoal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GoalsListPage: React.FC = () => {
  const { t, getGoalStatusLabel } = useI18n();
  const dispatch = useAppDispatch();
  const { goals, loading, error } = useAppSelector((state) => state.goals);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isGoalFormVisible, setIsGoalFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<IGoal | undefined>(undefined);
  const [isContributeModalVisible, setIsContributeModalVisible] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<IGoal | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [viewingGoal, setViewingGoal] = useState<IGoal | null>(null);

  useEffect(() => {
    dispatch(fetchGoalsStart({ page: 1, pageSize: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Error is already handled by the service layer with notifications
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreateGoal = () => {
    setEditingGoal(undefined);
    setIsGoalFormVisible(true);
  };

  const handleEdit = (goal: IGoal) => {
    setEditingGoal(goal);
    setIsGoalFormVisible(true);
  };

  const handleDelete = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedGoalId) {
      dispatch(deleteGoalStart({ id: selectedGoalId }));
      setIsDeleteModalVisible(false);
      setSelectedGoalId(null);
    }
  };

  const handleView = (goal: IGoal) => {
    setViewingGoal(goal);
    setIsDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setViewingGoal(null);
  };

  const handleContribute = (goal: IGoal) => {
    setContributingGoal(goal);
    setIsContributeModalVisible(true);
  };

  const handleGoalFormSubmit = (values: any) => {
    if (editingGoal) {
      // Update existing goal
      dispatch(
        updateGoalStart({
          id: editingGoal.id,
          updates: values,
        })
      );
    } else {
      // Create new goal
      dispatch(createGoalStart(values));
    }
    setIsGoalFormVisible(false);
    setEditingGoal(undefined);
  };

  const handleGoalFormCancel = () => {
    setIsGoalFormVisible(false);
    setEditingGoal(undefined);
  };

  const handleContributeSubmit = (values: { accountId: string; amount: number; note?: string }) => {
    if (contributingGoal) {
      dispatch(
        contributeGoalStart({
          goalId: contributingGoal.id,
          accountId: values.accountId,
          amount: values.amount,
          note: values.note,
        })
      );
      setIsContributeModalVisible(false);
      setContributingGoal(null);
    }
  };

  const handleContributeCancel = () => {
    setIsContributeModalVisible(false);
    setContributingGoal(null);
  };

  const renderProgress = (goal: IGoal) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    let status: 'normal' | 'exception' | 'success' = 'normal';
    if (goal.status === GoalStatus.COMPLETED) {
      status = 'success';
    } else if (goal.status === GoalStatus.CANCELLED) {
      status = 'exception';
    }

    return (
      <div>
        <Progress
          percent={percentage}
          size="small"
          status={status}
          format={() => `${percentage.toFixed(1)}%`}
        />
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </div>
      </div>
    );
  };

  const renderStatus = (status: GoalStatus) => {
    let color = 'blue';
    if (status === GoalStatus.COMPLETED) {
      color = 'green';
    } else if (status === GoalStatus.CANCELLED) {
      color = 'red';
    }

    return <Tag color={color}>{getGoalStatusLabel(status)}</Tag>;
  };

  const columns: ColumnsType<IGoal> = [
    {
      title: t('goals.goalName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
    },
    {
      title: t('goals.targetAmount'),
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: t('goals.deadline'),
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const isOverdue = deadlineDate < now;

        return (
          <div style={{ color: isOverdue ? '#f5222d' : 'inherit' }}>
            {formatDate(deadline)}
            {isOverdue && <div style={{ fontSize: '12px' }}>{t('goals.overdue')}</div>}
          </div>
        );
      },
    },
    {
      title: t('goals.progress'),
      key: 'progress',
      width: 200,
      render: (_, goal) => renderProgress(goal),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, goal) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(goal)}
            title={t('common.viewDetails')}
          />
          {goal.status === GoalStatus.ACTIVE && (
            <Button
              type="text"
              icon={<DollarOutlined />}
              onClick={() => handleContribute(goal)}
              title={t('goals.contribute')}
              style={{ color: '#52c41a' }}
            />
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(goal)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(goal.id)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('goals.manageGoals')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateGoal}>
            {t('goals.createGoal')}
          </Button>
        }
      >
        <Table
          bordered
          columns={columns}
          dataSource={goals}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('goals.totalGoals', { total }),
          }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('goals.deleteGoal')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>{t('goals.deleteConfirmation')}</p>
        <p>{t('common.irreversibleAction')}</p>
      </Modal>

      {/* Goal Form Modal */}
      <GoalForm
        visible={isGoalFormVisible}
        onCancel={handleGoalFormCancel}
        onSubmit={handleGoalFormSubmit}
        initialValues={editingGoal}
        loading={loading}
      />

      {/* Contribute to Goal Modal */}
      <ContributeGoalModal
        visible={isContributeModalVisible}
        goal={contributingGoal}
        onCancel={handleContributeCancel}
        onSubmit={handleContributeSubmit}
        loading={loading}
      />

      {/* Goal Detail Modal */}
      <GoalDetailModal
        visible={isDetailModalVisible}
        goal={viewingGoal}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default GoalsListPage;
