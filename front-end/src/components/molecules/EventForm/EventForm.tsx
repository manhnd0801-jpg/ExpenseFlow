/**
 * Event Form Component
 * For creating and editing events/projects
 */
import { useI18n } from '@/hooks/useI18n';
import { CalendarOutlined, DollarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, InputNumber, Modal, Select, Space, Switch } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { EventStatus, EventType } from '../../../constants/enums';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface IEvent {
  id?: string;
  name: string;
  description?: string;
  type: number;
  budget?: number;
  location?: string;
  startDate: string;
  endDate?: string;
  status: number;
  isActive: boolean;
}

interface IEventFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: IEvent) => void;
  initialValues?: Partial<IEvent>;
  loading?: boolean;
}

const FormWrapper = styled.div`
  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #262626;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
`;

export const EventForm: React.FC<IEventFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues && visible) {
      const formValues = {
        ...initialValues,
        dates:
          initialValues.startDate && initialValues.endDate
            ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
            : initialValues.startDate
            ? [dayjs(initialValues.startDate), dayjs(initialValues.startDate)]
            : undefined,
      };
      form.setFieldsValue(formValues);
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        type: EventType.PERSONAL,
        status: EventStatus.ACTIVE,
        isActive: true,
      });
    }
  }, [initialValues, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formattedValues = {
        ...values,
        startDate: values.dates?.[0]?.toISOString(),
        endDate: values.dates?.[1]?.toISOString() || values.dates?.[0]?.toISOString(),
      };

      // Remove dates field as it's only for form UI
      delete formattedValues.dates;

      onSubmit(formattedValues);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const eventTypeOptions = [
    { value: EventType.TRAVEL, label: t('events.travel') },
    { value: EventType.EDUCATION, label: t('events.education') },
    { value: EventType.HEALTH, label: t('events.health') },
    { value: EventType.PERSONAL, label: t('events.personal') },
    { value: EventType.PURCHASE, label: t('events.purchase') },
    { value: EventType.OTHER, label: t('events.other') },
  ];

  const statusOptions = [
    { value: EventStatus.PLANNED, label: t('events.planned') },
    { value: EventStatus.ACTIVE, label: t('events.active') },
    { value: EventStatus.COMPLETED, label: t('events.completed') },
    { value: EventStatus.CANCELLED, label: t('events.cancelled') },
  ];

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          {initialValues ? t('events.editEvent') : t('events.createEvent')}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={initialValues ? t('common.update') : t('common.create')}
      cancelText={t('common.cancel')}
      width={720}
    >
      <FormWrapper>
        <Form form={form} layout="vertical" autoComplete="off">
          {/* Basic Information */}
          <div className="form-section">
            <div className="section-title">
              <CalendarOutlined />
              {t('events.basicInfo')}
            </div>

            <Form.Item
              name="name"
              label={t('events.eventName')}
              rules={[
                { required: true, message: t('validation.required.eventName') },
                { max: 255, message: t('validation.maxLength', { count: 255 }) },
              ]}
            >
              <Input placeholder={t('events.enterEventName')} />
            </Form.Item>

            <Form.Item name="description" label={t('events.description')}>
              <TextArea
                placeholder={t('events.enterDescription')}
                rows={3}
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="type"
              label={t('events.eventType')}
              rules={[{ required: true, message: t('validation.required.eventType') }]}
            >
              <Select placeholder={t('events.selectEventType')} options={eventTypeOptions} />
            </Form.Item>
          </div>

          {/* Financial Information */}
          <div className="form-section">
            <div className="section-title">
              <DollarOutlined />
              {t('events.budgetInfo')}
            </div>

            <Form.Item
              name="budget"
              label={t('events.budget')}
              rules={[{ type: 'number', min: 0, message: t('validation.min.budget') }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={t('events.enterBudget')}
                formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, '')) as any}
                min={0}
              />
            </Form.Item>
          </div>

          {/* Time & Location */}
          <div className="form-section">
            <div className="section-title">
              <EnvironmentOutlined />
              {t('events.timeAndLocation')}
            </div>

            <Form.Item
              name="dates"
              label={t('events.eventDuration')}
              rules={[{ required: true, message: t('validation.required.eventDates') }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                placeholder={[t('events.startDate'), t('events.endDate')]}
                allowEmpty={[false, true]}
              />
            </Form.Item>

            <Form.Item name="location" label={t('events.location')}>
              <Input placeholder={t('events.enterLocation')} maxLength={255} />
            </Form.Item>
          </div>

          {/* Status & Settings */}
          <div className="form-section">
            <Form.Item name="status" label={t('events.status')}>
              <Select placeholder={t('events.selectStatus')} options={statusOptions} />
            </Form.Item>

            <Form.Item name="isActive" label={t('events.isActive')} valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </FormWrapper>
    </Modal>
  );
};

export default EventForm;
