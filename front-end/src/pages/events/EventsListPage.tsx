/**
 * Events List Page - Redesigned to match backend Event entity
 * Events group transactions together (e.g., wedding, vacation, project)
 */
import { EventStatusLabels } from '@/constants/enum-labels';
import { EventStatus } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { deleteEventRequest, fetchEventsRequest } from '@/redux/modules/events';
import { IEvent } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  CalendarOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .stats-row {
    margin-bottom: 24px;
  }

  .event-card {
    margin-bottom: 16px;
    border-left: 4px solid;

    &.planned {
      border-left-color: #1890ff;
    }

    &.active {
      border-left-color: #52c41a;
    }

    &.completed {
      border-left-color: #8c8c8c;
    }

    &.cancelled {
      border-left-color: #ff4d4f;
    }
  }
`;

export const EventsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.events);
  const loading = useAppSelector((state) => state.events.loading);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchEventsRequest());
  }, [dispatch]);

  // Calculate statistics
  const stats = {
    total: events.length,
    active: events.filter((e) => e.status === EventStatus.ACTIVE).length,
    completed: events.filter((e) => e.status === EventStatus.COMPLETED).length,
    totalBudget: events.reduce((sum, e) => sum + (e.budget || 0), 0),
    totalSpent: events.reduce((sum, e) => sum + (e.totalSpent || 0), 0),
  };

  const handleCreate = () => {
    console.log('Create event');
    // TODO: Navigate to create page or open modal
  };

  const handleEdit = (event: IEvent) => {
    console.log('Edit event:', event);
    // TODO: Navigate to edit page
  };

  const handleView = (event: IEvent) => {
    console.log('View event:', event);
    // TODO: Navigate to detail page
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      dispatch(deleteEventRequest(deleteId));
      setIsDeleteModalVisible(false);
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: EventStatus): string => {
    const colors: Record<EventStatus, string> = {
      [EventStatus.PLANNED]: 'blue',
      [EventStatus.ACTIVE]: 'green',
      [EventStatus.COMPLETED]: 'default',
      [EventStatus.CANCELLED]: 'red',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<IEvent> = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: IEvent) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.description}</div>
          )}
          {record.location && (
            <div style={{ fontSize: '12px', color: '#1890ff' }}>
              <EnvironmentOutlined /> {record.location}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      key: 'dates',
      width: 150,
      render: (_: any, record: IEvent) => (
        <Space direction="vertical" size={0}>
          <div>
            <CalendarOutlined /> {formatDate(record.startDate)}
          </div>
          {record.endDate && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              đến {formatDate(record.endDate)}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Ngân sách',
      key: 'budget',
      width: 200,
      render: (_: any, record: IEvent) => {
        if (!record.budget) {
          return <div style={{ color: '#8c8c8c' }}>Chưa đặt ngân sách</div>;
        }

        const spent = record.totalSpent || 0;
        const percentage = (spent / record.budget) * 100;
        const isOverBudget = percentage > 100;

        return (
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ fontSize: '12px' }}>
              <span style={{ fontWeight: 500 }}>{formatCurrency(spent)}</span> /{' '}
              {formatCurrency(record.budget)}
            </div>
            <Progress
              percent={Math.min(percentage, 100)}
              size="small"
              status={isOverBudget ? 'exception' : percentage >= 80 ? 'normal' : 'active'}
              format={() => `${percentage.toFixed(1)}%`}
            />
            {isOverBudget && (
              <div style={{ fontSize: '11px', color: '#ff4d4f' }}>
                Vượt {formatCurrency(spent - record.budget)}
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: EventStatus) => (
        <Tag color={getStatusColor(status)}>{EventStatusLabels[status]}</Tag>
      ),
      filters: [
        { text: 'Đã lên kế hoạch', value: EventStatus.PLANNED },
        { text: 'Đang diễn ra', value: EventStatus.ACTIVE },
        { text: 'Đã hoàn thành', value: EventStatus.COMPLETED },
        { text: 'Đã hủy', value: EventStatus.CANCELLED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Số giao dịch',
      key: 'transactions',
      width: 120,
      align: 'center',
      render: (_: any, record: IEvent) => <div>{record.transactions?.length || 0}</div>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: IEvent) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Quản lý Sự kiện</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng sự kiện" value={stats.total} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang diễn ra"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng ngân sách"
              value={stats.totalBudget}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã chi tiêu"
              value={stats.totalSpent}
              valueStyle={{ color: stats.totalSpent > stats.totalBudget ? '#ff4d4f' : '#3f8600' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Events Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: loading ? 'Đang tải...' : 'Chưa có sự kiện nào',
          }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} sự kiện`,
          }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa sự kiện này không?</p>
        <p>Các giao dịch liên quan sẽ không bị xóa nhưng sẽ không còn liên kết với sự kiện này.</p>
      </Modal>
    </PageWrapper>
  );
};

export default EventsListPage;
