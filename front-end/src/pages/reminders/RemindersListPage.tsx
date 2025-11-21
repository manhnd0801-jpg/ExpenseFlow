/**
 * Reminders List Page
 * Manage reminders and scheduled notifications
 */

import { ReminderTypeLabels } from '@/constants/enum-labels';
import { ReminderType } from '@/constants/enums';
import type { ICreateReminderRequest, IReminder } from '@/types/models';
import {
  BellOutlined,
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { EnumSelect } from '@components/atoms';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import {
  createReminderRequest,
  deleteReminderRequest,
  fetchRemindersRequest,
  fetchUpcomingRemindersRequest,
  markReminderCompleteRequest,
  updateReminderRequest,
} from '@redux/modules/reminders';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ============================================
// STYLED COMPONENTS
// ============================================

const PageWrapper = styled.div`
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
`;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const UpcomingSection = styled.div`
  margin-bottom: 24px;
`;

const ReminderCard = styled(Card)<{ $borderColor?: string }>`
  margin-bottom: 12px;
  border-left: 4px solid ${(props) => props.$borderColor || '#1890ff'};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

// ============================================
// MAIN COMPONENT
// ============================================

const RemindersListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { reminders, upcomingReminders, loading } = useAppSelector((state) => state.reminders);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<IReminder | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchRemindersRequest());
    dispatch(fetchUpcomingRemindersRequest());
  }, [dispatch]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreate = () => {
    setEditingReminder(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (reminder: IReminder) => {
    setEditingReminder(reminder);
    form.setFieldsValue({
      ...reminder,
      reminderDate: dayjs(reminder.dueDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteReminderRequest(id));
  };

  const handleComplete = (id: string) => {
    dispatch(markReminderCompleteRequest(id));
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const payload: ICreateReminderRequest = {
        ...values,
        dueDate: values.reminderDate.toISOString(),
      };
      delete (payload as any).reminderDate;

      if (editingReminder) {
        dispatch(updateReminderRequest({ id: editingReminder.id, data: payload }));
      } else {
        dispatch(createReminderRequest(payload));
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getReminderTypeColor = (type: ReminderType): string => {
    const colors: Record<ReminderType, string> = {
      [ReminderType.PAYMENT]: '#f5222d',
      [ReminderType.BUDGET]: '#fa8c16',
      [ReminderType.DEBT]: '#eb2f96',
      [ReminderType.CUSTOM]: '#8c8c8c',
    };
    return colors[type] || '#1890ff';
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: IReminder) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && <Text type="secondary">{record.description}</Text>}
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: ReminderType) => (
        <Tag color={getReminderTypeColor(type)}>{ReminderTypeLabels[type]}</Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: IReminder, b: IReminder) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
    },
    {
      title: 'Lặp lại',
      dataIndex: 'isRecurring',
      key: 'isRecurring',
      render: (isRecurring: boolean, record: IReminder) => (
        <Space>
          {isRecurring ? <Tag color="blue">Có</Tag> : <Tag>Không</Tag>}
          {isRecurring && record.frequency && <Text type="secondary">({record.frequency})</Text>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      render: (isCompleted: boolean) =>
        isCompleted ? (
          <Tag color="success" icon={<CheckOutlined />}>
            Hoàn thành
          </Tag>
        ) : (
          <Tag color="warning">Chưa hoàn thành</Tag>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: unknown, record: IReminder) => (
        <Space>
          {!record.isCompleted && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleComplete(record.id)}
              size="small"
            >
              Hoàn thành
            </Button>
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhắc nhở này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <PageWrapper>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>
              <BellOutlined /> Nhắc nhở
            </Title>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
              Tạo nhắc nhở
            </Button>
          </Col>
        </Row>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <UpcomingSection>
            <Title level={4}>
              <CalendarOutlined /> Sắp tới (7 ngày)
            </Title>
            <Row gutter={[16, 16]}>
              {upcomingReminders.map((reminder) => (
                <Col xs={24} sm={12} lg={8} key={reminder.id}>
                  <ReminderCard
                    size="small"
                    $borderColor={getReminderTypeColor(reminder.type)}
                    extra={
                      <Tag color={getReminderTypeColor(reminder.type)}>
                        {ReminderTypeLabels[reminder.type]}
                      </Tag>
                    }
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text strong>{reminder.title}</Text>
                      <Text type="secondary">
                        <CalendarOutlined /> {dayjs(reminder.dueDate).format('DD/MM/YYYY HH:mm')}
                      </Text>
                      {reminder.description && (
                        <Text type="secondary" ellipsis>
                          {reminder.description}
                        </Text>
                      )}
                    </Space>
                  </ReminderCard>
                </Col>
              ))}
            </Row>
          </UpcomingSection>
        )}

        {/* All Reminders Table */}
        <StyledCard title="Tất cả nhắc nhở" bordered={false}>
          <Table
            columns={columns}
            dataSource={reminders}
            rowKey="id"
            loading={loading}
            locale={{
              emptyText: (
                <Empty description="Chưa có nhắc nhở nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ),
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nhắc nhở`,
            }}
          />
        </StyledCard>
      </Space>

      {/* Create/Edit Modal */}
      <Modal
        title={editingReminder ? 'Sửa nhắc nhở' : 'Tạo nhắc nhở mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={editingReminder ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề nhắc nhở" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại nhắc nhở"
                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              >
                <EnumSelect enumLabels={ReminderTypeLabels} placeholder="Chọn loại nhắc nhở" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reminderDate"
                label="Thời gian nhắc"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn thời gian"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isRecurring"
            label="Lặp lại"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.isRecurring !== currentValues.isRecurring
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('isRecurring') ? (
                <Form.Item name="frequency" label="Tần suất">
                  <Select placeholder="Chọn tần suất">
                    <Select.Option value="daily">Hàng ngày</Select.Option>
                    <Select.Option value="weekly">Hàng tuần</Select.Option>
                    <Select.Option value="monthly">Hàng tháng</Select.Option>
                    <Select.Option value="yearly">Hàng năm</Select.Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </PageWrapper>
  );
};

export default RemindersListPage;
