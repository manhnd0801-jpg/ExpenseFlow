/**
 * Events List Page - Redesigned to match backend Event entity
 * Events group transactions together (e.g., wedding, vacation, project)
 */
import { EventForm } from '@/components/molecules';
import { EventStatus } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import {
  createEventRequest,
  deleteEventRequest,
  fetchEventsRequest,
  updateEventRequest,
} from '@/redux/modules/events';
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

export const EventsListPage: React.FC = () => {
  const { t, getEventStatusLabel } = useI18n();
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.events);
  const loading = useAppSelector((state) => state.events.loading);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEventFormVisible, setIsEventFormVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<IEvent | undefined>(undefined);

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
    setEditingEvent(undefined);
    setIsEventFormVisible(true);
  };

  const handleEdit = (event: IEvent) => {
    setEditingEvent(event);
    setIsEventFormVisible(true);
  };

  const handleEventFormSubmit = (values: any) => {
    if (editingEvent) {
      // Update existing event
      dispatch(
        updateEventRequest({
          id: editingEvent.id,
          ...values,
        })
      );
    } else {
      // Create new event
      dispatch(createEventRequest(values));
    }
    setIsEventFormVisible(false);
    setEditingEvent(undefined);
  };

  const handleEventFormCancel = () => {
    setIsEventFormVisible(false);
    setEditingEvent(undefined);
  };

  const handleView = (event: IEvent) => {
    // Show event details in a modal
    Modal.info({
      title: event.name,
      width: 700,
      content: (
        <div style={{ marginTop: 16 }}>
          {event.description && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('events.description')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{event.description}</p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <strong>{t('events.status')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>{getEventStatusLabel(event.status)}</p>
          </div>

          {event.location && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('events.location')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{event.location}</p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <strong>{t('events.timeRange')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>
              {formatDate(event.startDate)} {event.endDate && ` - ${formatDate(event.endDate)}`}
            </p>
          </div>

          {event.budget && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('events.budget')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{formatCurrency(event.budget)}</p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <strong>{t('events.status')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>{getEventStatusLabel(event.status)}</p>
          </div>

          {event.totalSpent !== undefined && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('events.totalSpent')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{formatCurrency(event.totalSpent)}</p>
            </div>
          )}
        </div>
      ),
      okText: t('common.close'),
    });
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
      title: t('events.eventName'),
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
      title: t('events.timeRange'),
      key: 'dates',
      width: 150,
      render: (_: any, record: IEvent) => (
        <Space direction="vertical" size={0}>
          <div>
            <CalendarOutlined /> {formatDate(record.startDate)}
          </div>
          {record.endDate && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {t('events.to')} {formatDate(record.endDate)}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: t('events.budget'),
      key: 'budget',
      width: 200,
      render: (_: any, record: IEvent) => {
        if (!record.budget) {
          return <div style={{ color: '#8c8c8c' }}>{t('events.noBudget')}</div>;
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
                {t('events.overBudget')} {formatCurrency(spent - record.budget)}
              </div>
            )}
          </Space>
        );
      },
    },
    {
      title: t('events.status'),
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: EventStatus) => (
        <Tag color={getStatusColor(status)}>{getEventStatusLabel(status)}</Tag>
      ),
      filters: [
        { text: t('events.planned'), value: EventStatus.PLANNED },
        { text: t('events.active'), value: EventStatus.ACTIVE },
        { text: t('events.completed'), value: EventStatus.COMPLETED },
        { text: t('events.cancelled'), value: EventStatus.CANCELLED },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('events.transactionCount'),
      key: 'transactions',
      width: 120,
      align: 'center',
      render: (_: any, record: IEvent) => <div>{record.transactions?.length || 0}</div>,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: IEvent) => (
        <Space size="small">
          <Tooltip title={t('common.viewDetails')}>
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title={t('common.delete')}>
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
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('events.totalEvents')}
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('events.activeEvents')}
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('events.totalBudget')}
              value={stats.totalBudget}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('events.totalSpent')}
              value={stats.totalSpent}
              valueStyle={{ color: stats.totalSpent > stats.totalBudget ? '#ff4d4f' : '#3f8600' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Events Table */}
      <Card
        title={t('events.manageEvents')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('events.createEvent')}
          </Button>
        }
      >
        <Table
          bordered
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('events.totalEventsPagination', { total }),
          }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('events.deleteEvent')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>{t('events.deleteConfirmation')}</p>
        <p>{t('events.deleteWarning')}</p>
      </Modal>

      {/* Event Form Modal */}
      <EventForm
        visible={isEventFormVisible}
        onCancel={handleEventFormCancel}
        onSubmit={handleEventFormSubmit}
        initialValues={editingEvent}
        loading={loading}
      />
    </div>
  );
};

export default EventsListPage;
