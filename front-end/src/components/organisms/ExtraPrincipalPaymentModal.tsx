/**
 * Extra Principal Payment Modal
 * Modal for making extra principal payments outside regular schedule
 */

import { DollarOutlined } from '@ant-design/icons';
import { DatePicker, Form, Input, InputNumber, Modal, Select, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect } from 'react';

import { useI18n } from '@/hooks/useI18n';
import { IAccount } from '@/redux/modules/accounts';
import { ICategory } from '@/redux/modules/categories';
import { ILoan } from '@/redux/modules/loans';
import { formatCurrency } from '@/utils/formatters';

const { Text } = Typography;

export interface IExtraPrincipalPaymentFormData {
  amount: number;
  paymentDate: Dayjs;
  accountId: string;
  categoryId?: string;
  note?: string;
  // Removed: strategy is no longer needed (always reduce monthly payment, keep term unchanged)
}

interface IExtraPrincipalPaymentModalProps {
  visible: boolean;
  loan: ILoan | null;
  accounts: IAccount[];
  categories: ICategory[];
  isLoading: boolean;
  onSubmit: (data: IExtraPrincipalPaymentFormData) => void;
  onCancel: () => void;
}

const ExtraPrincipalPaymentModal: React.FC<IExtraPrincipalPaymentModalProps> = ({
  visible,
  loan,
  accounts,
  categories,
  isLoading,
  onSubmit,
  onCancel,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && loan) {
      form.setFieldsValue({
        paymentDate: dayjs(),
        accountId: undefined,
        categoryId: undefined,
        amount: undefined,
        note: undefined,
      });
    }
  }, [visible, loan, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      // Validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!loan) return null;

  const expenseCategories = categories.filter((cat) => cat.type === 2); // EXPENSE = 2

  return (
    <Modal
      title={
        <span>
          <DollarOutlined style={{ marginRight: 8, color: '#10b981' }} />
          {t('loans.extraPrincipalPayment')}
        </span>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={isLoading}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      width={600}
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#f3f4f6', borderRadius: 8 }}>
        <Text strong>{loan.name}</Text>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">{t('loans.remainingPrincipal')}: </Text>
          <Text strong style={{ color: '#ef4444', fontSize: '16px' }}>
            {formatCurrency(loan.remainingPrincipal)}
          </Text>
        </div>
        <div style={{ marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 {t('loans.extraPrincipalInfo')}
          </Text>
        </div>
      </div>

      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="amount"
          label={t('loans.extraPrincipalAmount')}
          rules={[
            { required: true, message: t('validation.required') },
            { type: 'number', min: 1000, message: t('validation.minAmount', { min: '1,000' }) },
            {
              validator: (_, value) => {
                if (value && value > loan.remainingPrincipal) {
                  return Promise.reject(
                    new Error(
                      t('loans.amountExceedsRemaining', {
                        max: formatCurrency(loan.remainingPrincipal),
                      })
                    )
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          tooltip={t('loans.extraPrincipalTooltip')}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder={t('loans.enterExtraPrincipalAmount')}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            addonAfter="₫"
          />
        </Form.Item>

        <Form.Item
          name="paymentDate"
          label={t('loans.paymentDate')}
          rules={[{ required: true, message: t('validation.required') }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="accountId"
          label={t('transactions.account')}
          rules={[{ required: true, message: t('validation.required') }]}
          tooltip={t('loans.paymentAccountTooltip')}
        >
          <Select
            placeholder={t('transactions.selectAccount')}
            showSearch
            optionFilterProp="children"
          >
            {accounts.map((account) => (
              <Select.Option key={account.id} value={account.id}>
                {account.name} ({formatCurrency(account.balance)})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="categoryId"
          label={t('transactions.category')}
          tooltip={t('loans.extraPrincipalCategoryTooltip')}
          extra={t('loans.categoryExtra')}
        >
          <Select
            placeholder={t('transactions.selectCategory')}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {expenseCategories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="note" label={t('transactions.note')}>
          <Input.TextArea
            rows={3}
            placeholder={t('loans.extraPrincipalNote')}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExtraPrincipalPaymentModal;
