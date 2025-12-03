/**
 * Record Payment Modal
 * SIMPLIFIED: Form to record scheduled monthly loan payment (no prepayment option)
 */

import { Collapse, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { CategoryType } from '@/constants/enums';
import { useAppSelector } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { selectAccounts } from '@/redux/modules/accounts';
import { selectCategories } from '@/redux/modules/categories';
import type { ILoan } from '@/redux/modules/loans';
import { formatCurrency } from '@/utils/formatters';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    font-weight: 500;
  }
`;

const PaymentInfo = styled.div`
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;

  .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #6b7280;
      font-size: 14px;
    }

    .value {
      font-weight: 600;
      color: #1f2937;
      font-size: 14px;

      &.total {
        color: #3b82f6;
        font-size: 16px;
      }

      &.prepayment {
        color: #10b981;
      }
    }
  }

  .divider {
    border-top: 1px solid #d1d5db;
    margin: 12px 0;
  }
`;

// ============================================
// TYPES
// ============================================

export interface IRecordPaymentFormValues {
  accountId: string;
  amount: number;
  paymentDate: Dayjs;
  note?: string;
  // Category selection (hybrid approach)
  categoryId?: string; // Common category for both principal and interest
  principalCategoryId?: string; // Specific category for principal payment
  interestCategoryId?: string; // Specific category for interest payment
}

interface IRecordPaymentModalProps {
  visible: boolean;
  loan: ILoan | null;
  isLoading?: boolean;
  onSubmit: (values: {
    accountId: string;
    amount: number;
    paymentDate: string;
    note?: string;
    categoryId?: string;
    principalCategoryId?: string;
    interestCategoryId?: string;
  }) => void;
  onCancel: () => void;
}

// ============================================
// COMPONENT
// ============================================

const RecordPaymentModal: React.FC<IRecordPaymentModalProps> = ({
  visible,
  loan,
  isLoading = false,
  onSubmit,
  onCancel,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm<IRecordPaymentFormValues>();
  const accounts = useAppSelector(selectAccounts);
  const categories = useAppSelector(selectCategories);

  // Filter expense categories only
  const expenseCategories = categories.filter((cat: any) => cat.type === CategoryType.EXPENSE);

  const paymentAmount = Form.useWatch('amount', form);

  // Calculate principal and interest breakdown
  const calculatePaymentBreakdown = () => {
    if (!loan || !paymentAmount) {
      return { principal: 0, interest: 0 };
    }

    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const interestAmount = loan.remainingPrincipal * monthlyInterestRate;
    const principalAmount = Math.max(0, paymentAmount - interestAmount);

    return {
      interest: interestAmount,
      principal: principalAmount,
    };
  };

  const paymentBreakdown = calculatePaymentBreakdown();

  // Reset form when modal opens
  useEffect(() => {
    if (visible && loan) {
      form.setFieldsValue({
        accountId: undefined,
        amount: loan.monthlyPayment, // Default to monthly payment
        paymentDate: dayjs(),
        note: undefined,
      });
    }
  }, [visible, loan, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        accountId: values.accountId,
        amount: values.amount,
        paymentDate: values.paymentDate.toISOString(),
        note: values.note,
        categoryId: values.categoryId,
        principalCategoryId: values.principalCategoryId,
        interestCategoryId: values.interestCategoryId,
      });
    } catch (error) {
      // Validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!loan) return null;

  return (
    <Modal
      title={t('debts.recordPayment')}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      width={600}
      destroyOnClose
    >
      <PaymentInfo>
        <div className="info-row">
          <span className="label">{t('loans.loanName')}:</span>
          <span className="value">{loan.name}</span>
        </div>
        <div className="info-row">
          <span className="label">{t('loans.remainingBalance')}:</span>
          <span className="value" style={{ color: '#ef4444' }}>
            {formatCurrency(loan.remainingPrincipal)}
          </span>
        </div>

        <div className="divider" />

        <div className="info-row">
          <span className="label">{t('loans.principal')}:</span>
          <span className="value" style={{ color: '#3b82f6' }}>
            {formatCurrency(paymentBreakdown.principal)}
          </span>
        </div>
        <div className="info-row">
          <span className="label">{t('loans.interest')}:</span>
          <span className="value" style={{ color: '#f59e0b' }}>
            {formatCurrency(paymentBreakdown.interest)}
          </span>
        </div>
        <div className="info-row">
          <span className="label">
            <strong>{t('transactions.total')}:</strong>
          </span>
          <span className="value total">{formatCurrency(paymentAmount || 0)}</span>
        </div>
      </PaymentInfo>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          amount: loan.monthlyPayment,
          paymentDate: dayjs(),
        }}
      >
        <StyledFormItem
          label={t('accounts.selectAccount')}
          name="accountId"
          rules={[
            {
              required: true,
              message: t('validation.required', { field: t('accounts.account') }),
            },
          ]}
          tooltip={t('loans.paymentAccountTooltip')}
        >
          <Select
            placeholder={t('accounts.selectAccount')}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={accounts.map((acc: any) => ({
              value: acc.id,
              label: `${acc.name} (${formatCurrency(acc.balance)})`,
            }))}
          />
        </StyledFormItem>

        {/* Category Selection Section */}
        <StyledFormItem
          label={t('categories.commonCategory')}
          name="categoryId"
          tooltip={t('loans.categoryTooltip')}
          extra={t('loans.categoryExtra')}
        >
          <Select
            placeholder={t('categories.selectCategory')}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={expenseCategories.map((cat: any) => ({
              value: cat.id,
              label: `${cat.icon || '📁'} ${cat.name}`,
            }))}
          />
        </StyledFormItem>

        <Collapse
          ghost
          size="small"
          items={[
            {
              key: 'advanced',
              label: (
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {t('common.advancedOptions')}
                </span>
              ),
              children: (
                <>
                  <StyledFormItem
                    label={t('loans.principalCategory')}
                    name="principalCategoryId"
                    tooltip={t('loans.principalCategoryTooltip')}
                    extra={t('loans.principalCategoryExtra')}
                  >
                    <Select
                      placeholder={t('categories.selectCategory')}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={expenseCategories.map((cat: any) => ({
                        value: cat.id,
                        label: `${cat.icon || '📁'} ${cat.name}`,
                      }))}
                    />
                  </StyledFormItem>

                  <StyledFormItem
                    label={t('loans.interestCategory')}
                    name="interestCategoryId"
                    tooltip={t('loans.interestCategoryTooltip')}
                    extra={t('loans.interestCategoryExtra')}
                  >
                    <Select
                      placeholder={t('categories.selectCategory')}
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        String(option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={expenseCategories.map((cat: any) => ({
                        value: cat.id,
                        label: `${cat.icon || '📁'} ${cat.name}`,
                      }))}
                    />
                  </StyledFormItem>
                </>
              ),
            },
          ]}
        />

        <StyledFormItem
          label={t('loans.paymentAmount')}
          name="amount"
          rules={[
            {
              required: true,
              message: t('validation.required', { field: t('loans.paymentAmount') }),
            },
            {
              type: 'number',
              min: 0.01,
              message: t('validation.min', { field: t('loans.paymentAmount'), min: '0.01' }),
            },
          ]}
          tooltip={t('loans.scheduledPaymentTooltip')}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder={t('loans.paymentAmount')}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0) as any}
            addonAfter="VNĐ"
            min={0}
          />
        </StyledFormItem>

        <StyledFormItem
          label={t('loans.paymentDate')}
          name="paymentDate"
          rules={[
            {
              required: true,
              message: t('validation.required', { field: t('loans.paymentDate') }),
            },
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={t('common.selectDate')}
            disabledDate={(current) => current && current > dayjs().endOf('day')}
          />
        </StyledFormItem>

        <StyledFormItem label={t('transactions.note')} name="note">
          <Input.TextArea
            rows={3}
            placeholder={t('transactions.enterNote')}
            maxLength={500}
            showCount
          />
        </StyledFormItem>
      </Form>
    </Modal>
  );
};

export default RecordPaymentModal;
