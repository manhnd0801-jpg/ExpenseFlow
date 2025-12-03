/**
 * Debt Form Component
 * For creating and editing lending/borrowing debts
 */
import { AccountSelect } from '@/components/atoms/AccountSelect';
import { CategorySelect } from '@/components/atoms/CategorySelect';
import { useI18n } from '@/hooks/useI18n';
import { BankOutlined, DollarOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { CategoryType, DebtStatus, DebtType } from '../../../constants/enums';

const { TextArea } = Input;

interface IDebt {
  id?: string;
  type: number;
  personName: string;
  amount: number;
  remainingAmount?: number;
  interestRate?: number;
  borrowedDate: string;
  dueDate?: string;
  status?: number;
  description?: string;
  contactInfo?: string;
  accountId?: string; // Account to use for automatic transaction creation
  categoryId?: string; // Category for transaction classification
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
              name="amount"
              label={t('debts.amount')}
              rules={[
                { required: true, message: t('validation.required.amount') },
                { type: 'number', min: 1000, message: t('validation.min.amount') },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder={t('debts.enterAmount')}
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

          {/* Account Selection */}
          <div className="form-section">
            <div className="section-title">
              <BankOutlined />
              {t('debts.accountIntegration')}
            </div>

            <Form.Item name="accountId" label={t('debts.account')} help={t('debts.accountHelp')}>
              <AccountSelect placeholder={t('debts.selectAccount')} allowClear showBalance />
            </Form.Item>

            <Form.Item name="categoryId" label={t('debts.category')} help={t('debts.categoryHelp')}>
              <CategorySelect
                placeholder={t('debts.selectCategory')}
                categoryType={CategoryType.EXPENSE} // Debts are typically expense-related
                allowClear
                prefix={<TagOutlined />}
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
          {initialValues?.id && (
            <div className="form-section">
              <Form.Item name="status" label={t('debts.status')}>
                <Select placeholder={t('debts.selectStatus')} options={statusOptions} />
              </Form.Item>
            </div>
          )}

          <div className="form-section">
            <Form.Item name="description" label={t('debts.description')}>
              <TextArea
                placeholder={t('debts.enterDescription')}
                rows={3}
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item name="contactInfo" label={t('debts.contactInfo')}>
              <Input placeholder={t('debts.enterContactInfo')} maxLength={255} />
            </Form.Item>
          </div>
        </Form>
      </FormWrapper>
    </Modal>
  );
};

export default DebtForm;
