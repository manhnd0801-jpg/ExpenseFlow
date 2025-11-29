/**
 * Reminders List Page
 * Manage reminders and scheduled notifications
 */

import { ReminderType } from '@/constants/enums';
import { useI18n } from '@/hooks/useI18n';
import type { ICreateReminderRequest, IReminder } from '@/types/models';
import {
  BellOutlined,
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
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
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;
const { TextArea } = Input;

const RemindersListPage: React.FC = () => {
  const { t, getReminderTypeLabel } = useI18n();
  const dispatch = useAppDispatch();
  const { reminders, upcomingReminders, loading } = useAppSelector((state) => state.reminders);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingReminder, setEditingReminder] = useState<IReminder | null>(null);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchRemindersRequest());
    dispatch(fetchUpcomingRemindersRequest());
  }, [dispatch]);

  // ============================================
  // HANDLERS
  // ============================================

  const showCreateModal = () => {
    setEditingReminder(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (reminder: IReminder) => {
    setEditingReminder(reminder);
    form.setFieldsValue({
      title: reminder.title,
      description: reminder.description,
      type: reminder.type,
      dueDate: dayjs(reminder.dueDate),
      isRecurring: reminder.isRecurring,
      frequency: reminder.frequency,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingReminder(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: ICreateReminderRequest = {
        ...values,
        dueDate: values.dueDate.toISOString(),
      };

      if (editingReminder) {
        dispatch(updateReminderRequest({ id: editingReminder.id, data: payload }));
      } else {
        dispatch(createReminderRequest(payload));
      }

      handleCancel();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const showDeleteConfirm = (id: string) => {
    setDeletingReminderId(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    if (deletingReminderId) {
      dispatch(deleteReminderRequest(deletingReminderId));
      setDeleteModalVisible(false);
      setDeletingReminderId(null);
    }
  };

  const handleMarkComplete = (id: string) => {
    dispatch(markReminderCompleteRequest(id));
  };

  // ============================================
  // HELPERS
  // ============================================

  const getReminderTypeColor = (type: ReminderType): string => {
    const colorMap: Record<ReminderType, string> = {
      [ReminderType.PAYMENT]: '#ff4d4f',
      [ReminderType.BUDGET]: '#faad14',
      [ReminderType.DEBT]: '#f759ab',
      [ReminderType.CUSTOM]: '#1890ff',
    };
    return colorMap[type] || '#1890ff';
  };

  const isOverdue = (reminderDate: string): boolean => {
    return dayjs(reminderDate).isBefore(dayjs());
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns: ColumnsType<IReminder> = [
    {
      title: t('reminders.title'),
      dataIndex: 'title',
      key: 'title',
      width: '25%',
      render: (text: string, record: IReminder) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: t('reminders.type'),
      dataIndex: 'type',
      key: 'type',
      width: '15%',
      render: (type: ReminderType) => (
        <Tag color={getReminderTypeColor(type)}>{getReminderTypeLabel(type)}</Tag>
      ),
    },
    {
      title: t('reminders.reminderDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: '20%',
      sorter: (a: IReminder, b: IReminder) => dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix(),
      render: (date: string) => {
        const isLate = isOverdue(date);
        return (
          <Space>
            <CalendarOutlined style={{ color: isLate ? '#ff4d4f' : '#1890ff' }} />
            <Text type={isLate ? 'danger' : undefined}>
              {dayjs(date).format('DD/MM/YYYY HH:mm')}
            </Text>
          </Space>
        );
      },
    },
    {
      title: t('reminders.recurring'),
      dataIndex: 'isRecurring',
      key: 'isRecurring',
      width: '15%',
      render: (isRecurring: boolean, record: IReminder) =>
        isRecurring ? (
          <Tag color="blue">
            {t(`reminders.frequency.${record.frequency}` as keyof typeof t) || record.frequency}
          </Tag>
        ) : (
          <Tag>{t('reminders.oneTime')}</Tag>
        ),
    },
    {
      title: t('common.status'),
      dataIndex: 'isCompleted',
      key: 'isCompleted',
      width: '10%',
      render: (isCompleted: boolean) =>
        isCompleted ? (
          <Tag icon={<CheckOutlined />} color="success">
            {t('reminders.completed')}
          </Tag>
        ) : (
          <Tag color="default">{t('reminders.pending')}</Tag>
        ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: '15%',
      render: (_: unknown, record: IReminder) => (
        <Space>
          {!record.isCompleted && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleMarkComplete(record.id)}
              title={t('reminders.markComplete')}
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.id)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div>
      {/* Upcoming Reminders Section */}
      {upcomingReminders && upcomingReminders.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Card
            title={
              <Space>
                <BellOutlined />
                {t('reminders.upcomingReminders')}
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              {upcomingReminders.map((reminder) => (
                <Col key={reminder.id} xs={24} sm={12} lg={8}>
                  <Card
                    size="small"
                    style={{ borderLeft: `4px solid ${getReminderTypeColor(reminder.type)}` }}
                    hoverable
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text strong>{reminder.title}</Text>
                      {reminder.description && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {reminder.description}
                        </Text>
                      )}
                      <Space size={4}>
                        <CalendarOutlined style={{ fontSize: '12px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(reminder.dueDate).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
                      <Tag color={getReminderTypeColor(reminder.type)} style={{ marginTop: 4 }}>
                        {getReminderTypeLabel(reminder.type)}
                      </Tag>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      )}

      {/* Main Table Section */}
      <Card
        title={t('reminders.manageReminders')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
            {t('reminders.createNewReminder')}
          </Button>
        }
      >
        <Table<IReminder>
          columns={columns}
          dataSource={reminders}
          rowKey="id"
          loading={loading}
          bordered
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t('reminders.noReminders')}
              />
            ),
          }}
          pagination={{
            total: reminders?.length || 0,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.totalItems', { total }),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingReminder ? t('reminders.editReminder') : t('reminders.createNewReminder')}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText={editingReminder ? t('common.update') : t('common.create')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label={t('reminders.title')}
            rules={[{ required: true, message: t('reminders.validation.titleRequired') }]}
          >
            <Input placeholder={t('reminders.placeholder.title')} />
          </Form.Item>

          <Form.Item name="description" label={t('reminders.description')}>
            <TextArea rows={3} placeholder={t('reminders.placeholder.description')} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('reminders.type')}
            rules={[{ required: true, message: t('reminders.validation.typeRequired') }]}
          >
            <Select placeholder={t('reminders.placeholder.type')}>
              <Select.Option value={ReminderType.PAYMENT}>
                {getReminderTypeLabel(ReminderType.PAYMENT)}
              </Select.Option>
              <Select.Option value={ReminderType.BUDGET}>
                {getReminderTypeLabel(ReminderType.BUDGET)}
              </Select.Option>
              <Select.Option value={ReminderType.DEBT}>
                {getReminderTypeLabel(ReminderType.DEBT)}
              </Select.Option>
              <Select.Option value={ReminderType.CUSTOM}>
                {getReminderTypeLabel(ReminderType.CUSTOM)}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label={t('reminders.reminderDate')}
            rules={[{ required: true, message: t('reminders.validation.dateRequired') }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={t('reminders.placeholder.date')}
            />
          </Form.Item>

          <Form.Item name="isRecurring" label={t('reminders.recurring')} valuePropName="checked">
            <Space>
              <Form.Item name="isRecurring" valuePropName="checked" noStyle>
                <Switch />
              </Form.Item>
              <Text type="secondary">{t('reminders.recurringDescription')}</Text>
            </Space>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isRecurring !== curr.isRecurring}>
            {({ getFieldValue }) =>
              getFieldValue('isRecurring') ? (
                <Form.Item
                  name="frequency"
                  label={t('reminders.frequency.label')}
                  rules={[{ required: true, message: t('reminders.validation.frequencyRequired') }]}
                >
                  <Select placeholder={t('reminders.placeholder.frequency')}>
                    <Select.Option value="daily">{t('reminders.frequency.daily')}</Select.Option>
                    <Select.Option value="weekly">{t('reminders.frequency.weekly')}</Select.Option>
                    <Select.Option value="monthly">
                      {t('reminders.frequency.monthly')}
                    </Select.Option>
                    <Select.Option value="yearly">{t('reminders.frequency.yearly')}</Select.Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('common.confirmDelete')}
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingReminderId(null);
        }}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('reminders.deleteConfirmation')}</p>
      </Modal>
    </div>
  );
};

export default RemindersListPage;
