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
import { GoalStatusLabels } from '../../constants/enum-labels';
import { GoalStatus } from '../../constants/enums';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { deleteGoalStart, fetchGoalsStart } from '../../redux/modules/goals/goalSlice';
import type { IGoal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GoalsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goals, loading } = useAppSelector((state) => state.goals);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchGoalsStart({ page: 1, pageSize: 50 }));
  }, [dispatch]);

  const handleEdit = (goal: IGoal) => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit goal:', goal);
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
    // TODO: Navigate to goal detail page
    console.log('View goal:', goal);
  };

  const handleContribute = (goal: IGoal) => {
    // TODO: Open contribute modal
    console.log('Contribute to goal:', goal);
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

    return <Tag color={color}>{GoalStatusLabels[status as keyof typeof GoalStatusLabels]}</Tag>;
  };

  const columns: ColumnsType<IGoal> = [
    {
      title: 'Tên mục tiêu',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
    },
    {
      title: 'Số tiền mục tiêu',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Hạn hoàn thành',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => {
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const isOverdue = deadlineDate < now;

        return (
          <div style={{ color: isOverdue ? '#f5222d' : 'inherit' }}>
            {formatDate(deadline)}
            {isOverdue && <div style={{ fontSize: '12px' }}>Quá hạn</div>}
          </div>
        );
      },
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 200,
      render: (_, goal) => renderProgress(goal),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, goal) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(goal)}
            title="Xem chi tiết"
          />
          {goal.status === GoalStatus.ACTIVE && (
            <Button
              type="text"
              icon={<DollarOutlined />}
              onClick={() => handleContribute(goal)}
              title="Đóng góp"
              style={{ color: '#52c41a' }}
            />
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(goal)}
            title="Chỉnh sửa"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(goal.id)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản lý Mục tiêu Tài chính"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // TODO: Navigate to create goal page
              console.log('Create goal');
            }}
          >
            Tạo mục tiêu
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={goals}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} mục tiêu`,
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
        <p>Bạn có chắc chắn muốn xóa mục tiêu này không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default GoalsListPage;
