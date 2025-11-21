/**
 * Events List Page
 * Manage financial events and projects
 */
import {
  CalendarOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  message,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { EventStatus, EventType } from '../../constants/enums';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface IEvent {
  id: string;
  name: string;
  description?: string;
  type: number;
  status: number;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  actualAmount: number;
  targetAmount?: number;
  currency: string;
  categoryId?: string;
  categoryName?: string;
  participants?: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

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

    .ant-card {
      text-align: center;

      .ant-statistic-title {
        color: #8c8c8c;
        font-size: 14px;
      }

      .ant-statistic-content {
        font-size: 20px;
        font-weight: 600;
      }
    }
  }

  .event-table {
    .event-name {
      font-weight: 500;
      color: #262626;
    }

    .event-description {
      color: #8c8c8c;
      font-size: 12px;
      margin-top: 2px;
    }

    .budget-progress {
      width: 100px;
    }

    .amount-column {
      text-align: right;

      .budget-amount {
        font-weight: 600;
        color: #262626;
      }

      .actual-amount {
        font-size: 12px;
        color: #8c8c8c;
        margin-top: 2px;
      }
    }
  }
`;

export const EventsListPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data - will be replaced with API calls
  const mockEvents: IEvent[] = [
    {
      id: '1',
      name: 'Chuyến du lịch Đà Lạt',
      description: 'Du lịch cuối tuần với gia đình',
      type: EventType.TRAVEL,
      status: EventStatus.PLANNING,
      startDate: '2024-02-15',
      endDate: '2024-02-18',
      budgetAmount: 10000000,
      actualAmount: 2500000,
      targetAmount: 10000000,
      currency: 'VND',
      categoryName: 'Du lịch',
      participants: 4,
      location: 'Đà Lạt',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Tiệc sinh nhật con',
      description: 'Tổ chức sinh nhật 10 tuổi',
      type: EventType.PERSONAL,
      status: EventStatus.ACTIVE,
      startDate: '2024-01-25',
      endDate: '2024-01-25',
      budgetAmount: 3000000,
      actualAmount: 1800000,
      targetAmount: 3000000,
      currency: 'VND',
      categoryName: 'Giải trí',
      participants: 15,
      location: 'Nhà riêng',
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
    },
    {
      id: '3',
      name: 'Mua laptop mới',
      description: 'Nâng cấp thiết bị làm việc',
      type: EventType.PURCHASE,
      status: EventStatus.COMPLETED,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      budgetAmount: 25000000,
      actualAmount: 23500000,
      targetAmount: 25000000,
      currency: 'VND',
      categoryName: 'Công nghệ',
      participants: 1,
      location: 'Online',
      createdAt: '2023-12-15T00:00:00Z',
      updatedAt: '2024-01-31T00:00:00Z',
    },
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setLoading(false);
      message.error('Không thể tải danh sách sự kiện');
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case EventStatus.PLANNING:
        return 'blue';
      case EventStatus.ACTIVE:
        return 'green';
      case EventStatus.COMPLETED:
        return 'default';
      case EventStatus.CANCELLED:
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case EventStatus.PLANNING:
        return 'Đang lên kế hoạch';
      case EventStatus.ACTIVE:
        return 'Đang diễn ra';
      case EventStatus.COMPLETED:
        return 'Đã hoàn thành';
      case EventStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getTypeText = (type: number) => {
    switch (type) {
      case EventType.TRAVEL:
        return 'Du lịch';
      case EventType.EDUCATION:
        return 'Giáo dục';
      case EventType.HEALTH:
        return 'Sức khỏe';
      case EventType.PERSONAL:
        return 'Cá nhân';
      case EventType.PURCHASE:
        return 'Mua sắm';
      default:
        return 'Khác';
    }
  };

  const calculateProgress = (actual: number, budget: number) => {
    return budget > 0 ? Math.round((actual / budget) * 100) : 0;
  };

  const handleViewDetails = (event: IEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleEdit = (event: IEvent) => {
    // Navigate to edit form
    console.log('Edit event:', event.id);
  };

  const handleDelete = (event: IEvent) => {
    Modal.confirm({
      title: 'Xóa sự kiện',
      content: `Bạn có chắc chắn muốn xóa sự kiện "${event.name}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: () => {
        message.success('Đã xóa sự kiện');
        loadEvents();
      },
    });
  };

  const columns = [
    {
      title: 'Sự kiện',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IEvent) => (
        <div>
          <div className="event-name">{text}</div>
          {record.description && <div className="event-description">{record.description}</div>}
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: number) => <Tag color="blue">{getTypeText(type)}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: number) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Thời gian',
      key: 'period',
      width: 120,
      render: (record: IEvent) => (
        <div style={{ fontSize: '12px' }}>
          <div>{formatDate(record.startDate, 'DD/MM/YYYY')}</div>
          {record.startDate !== record.endDate && (
            <div style={{ color: '#8c8c8c' }}>đến {formatDate(record.endDate, 'DD/MM/YYYY')}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Ngân sách',
      key: 'budget',
      width: 180,
      render: (record: IEvent) => {
        const progress = calculateProgress(record.actualAmount, record.budgetAmount);
        return (
          <div>
            <div className="budget-amount">{formatCurrency(record.budgetAmount)}</div>
            <Progress
              percent={progress}
              size="small"
              className="budget-progress"
              status={progress > 100 ? 'exception' : 'normal'}
            />
            <div className="actual-amount">Đã chi: {formatCurrency(record.actualAmount)}</div>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (record: IEvent) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate summary statistics
  const totalBudget = events.reduce((sum, event) => sum + event.budgetAmount, 0);
  const totalActual = events.reduce((sum, event) => sum + event.actualAmount, 0);
  const activeEvents = events.filter((event) => event.status === EventStatus.ACTIVE).length;
  const completedEvents = events.filter((event) => event.status === EventStatus.COMPLETED).length;

  return (
    <PageWrapper>
      <div className="page-header">
        <h1>Quản lý Sự kiện & Dự án</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Tạo sự kiện mới
        </Button>
      </div>

      {/* Summary Statistics */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng ngân sách"
              value={totalBudget}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã chi tiêu"
              value={totalActual}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang diễn ra"
              value={activeEvents}
              suffix="sự kiện"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={completedEvents}
              suffix="sự kiện"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Events Table */}
      <Card title="Danh sách sự kiện">
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          className="event-table"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sự kiện`,
          }}
        />
      </Card>

      {/* Event Details Modal */}
      <Modal
        title={selectedEvent?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedEvent && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div>
                  <strong>Loại:</strong> {getTypeText(selectedEvent.type)}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Trạng thái:</strong> {getStatusText(selectedEvent.status)}
                </div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div>
                  <strong>Bắt đầu:</strong> {formatDate(selectedEvent.startDate)}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Kết thúc:</strong> {formatDate(selectedEvent.endDate)}
                </div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div>
                  <strong>Ngân sách:</strong> {formatCurrency(selectedEvent.budgetAmount)}
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Đã chi:</strong> {formatCurrency(selectedEvent.actualAmount)}
                </div>
              </Col>
            </Row>

            {selectedEvent.location && (
              <div style={{ marginBottom: 16 }}>
                <strong>Địa điểm:</strong> {selectedEvent.location}
              </div>
            )}

            {selectedEvent.participants && (
              <div style={{ marginBottom: 16 }}>
                <strong>Số người tham gia:</strong> {selectedEvent.participants}
              </div>
            )}

            {selectedEvent.description && (
              <div style={{ marginBottom: 16 }}>
                <strong>Mô tả:</strong> {selectedEvent.description}
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
};
