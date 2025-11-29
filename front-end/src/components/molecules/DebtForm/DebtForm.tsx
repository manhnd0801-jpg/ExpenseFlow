/**
 * Debt Form Component
 * For creating and editing lending/borrowing debts
 */
import { useI18n } from '@/hooks/useI18n';
import { DollarOutlined, UserOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { DebtStatus, DebtType } from '../../../constants/enums';

const { TextArea } = Input;

interface IDebt {
  id?: string;
  type: number;
  personName: string;
  originalAmount: number;
  remainingAmount?: number;
  interestRate?: number;
  borrowedDate: string;
  dueDate?: string;
  status: number;
  note?: string;
}

interface IDebtFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: IDebt) => void;
  initialValues?: Partial<IDebt>;
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

  .debt-type-selector {
    .ant-radio-group {
      display: flex;
      gap: 16px;

      .ant-radio-button-wrapper {
        flex: 1;
        text-align: center;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px !important;
        font-weight: 500;

        &:first-child {
          border-radius: 8px !important;
        }

        &:last-child {
          border-radius: 8px !important;
        }

        &.ant-radio-button-wrapper-checked {
          background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
          border-color: #1890ff;
          color: #1890ff;
        }
      }
    }
  }
`;

export const DebtForm: React.FC<IDebtFormProps> = ({
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
        borrowedDate: initialValues.borrowedDate ? dayjs(initialValues.borrowedDate) : undefined,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
      };
      form.setFieldsValue(formValues);
    } else if (visible) {
      form.resetFields();
      form.setFieldsValue({
        type: DebtType.LENDING,
        status: DebtStatus.ACTIVE,
        borrowedDate: dayjs(),
      });
    }
  }, [initialValues, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formattedValues = {
        ...values,
        borrowedDate: values.borrowedDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
      };

      onSubmit(formattedValues);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const statusOptions = [
    { value: DebtStatus.ACTIVE, label: t('debts.active') },
    { value: DebtStatus.PARTIAL_PAID, label: t('debts.partialPaid') },
    { value: DebtStatus.COMPLETED, label: t('debts.completed') },
    { value: DebtStatus.OVERDUE, label: t('debts.overdue') },
  ];

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined />
          {initialValues ? t('debts.editDebt') : t('debts.addDebt')}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={initialValues ? t('common.update') : t('common.create')}
      cancelText={t('common.cancel')}
      width={680}
    >
      <FormWrapper>
        <Form form={form} layout="vertical" autoComplete="off">
          {/* Debt Type */}
          <div className="form-section">
            <div className="section-title">
              <DollarOutlined />
              {t('debts.debtType')}
            </div>

            <Form.Item
              name="type"
              rules={[{ required: true, message: t('validation.required.debtType') }]}
            >
              <Radio.Group className="debt-type-selector" buttonStyle="solid">
                <Radio.Button value={DebtType.LENDING}>📤 {t('debts.lending')}</Radio.Button>
                <Radio.Button value={DebtType.BORROWING}>📥 {t('debts.borrowing')}</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Person & Amount Information */}
          <div className="form-section">
            <div className="section-title">
              <UserOutlined />
              {t('debts.personAndAmount')}
            </div>

            <Form.Item
              name="personName"
              label={t('debts.personName')}
              rules={[
                { required: true, message: t('validation.required.personName') },
                { max: 255, message: t('validation.maxLength', { count: 255 }) },
              ]}
            >
              <Input placeholder={t('debts.enterPersonName')} />
            </Form.Item>

            <Form.Item
              name="originalAmount"
              label={t('debts.originalAmount')}
              rules={[
                { required: true, message: t('validation.required.originalAmount') },
                { type: 'number', min: 1000, message: t('validation.min.originalAmount') },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={t('debts.enterOriginalAmount')}
                formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, '')) as any}
                min={1000}
              />
            </Form.Item>

            <Form.Item name="interestRate" label={t('debts.interestRate')}>
              <InputNumber
                style={{ width: '100%' }}
                placeholder={t('debts.enterInterestRate')}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value!.replace('%', '')) as any}
                min={0}
                max={100}
                step={0.1}
              />
            </Form.Item>
          </div>

          {/* Dates */}
          <div className="form-section">
            <Form.Item
              name="borrowedDate"
              label={t('debts.borrowedDate')}
              rules={[{ required: true, message: t('validation.required.borrowedDate') }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder={t('debts.selectBorrowedDate')} />
            </Form.Item>

            <Form.Item name="dueDate" label={t('debts.dueDate')}>
              <DatePicker style={{ width: '100%' }} placeholder={t('debts.selectDueDate')} />
            </Form.Item>
          </div>

          {/* Status & Notes */}
          <div className="form-section">
            <Form.Item name="status" label={t('debts.status')}>
              <Select placeholder={t('debts.selectStatus')} options={statusOptions} />
            </Form.Item>

            <Form.Item name="note" label={t('debts.note')}>
              <TextArea placeholder={t('debts.enterNote')} rows={3} maxLength={1000} showCount />
            </Form.Item>
          </div>
        </Form>
      </FormWrapper>
    </Modal>
  );
};

export default DebtForm;
