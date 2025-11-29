/**
 * Transfer Modal Component
 * Modal for transferring money between accounts
 */

import { CurrencyCodeMap } from '@/constants/enum-labels';
import { Currency } from '@/constants/enums';
import { useI18n } from '@hooks/useI18n';
import type { IAccount } from '@redux/modules/accounts/accountTypes';
import { Form, InputNumber, Modal, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useMemo } from 'react';

interface ITransferModalProps {
  open: boolean;
  accounts: IAccount[];
  onTransfer: (values: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Transfer Modal Component
 */
export const TransferModal: React.FC<ITransferModalProps> = ({
  open,
  accounts,
  onTransfer,
  onCancel,
  loading = false,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm();
  const fromAccountId = Form.useWatch('fromAccountId', form);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // Filter active accounts
  const activeAccounts = useMemo(() => accounts.filter((acc) => acc.isActive), [accounts]);

  // Get available destination accounts (exclude source account)
  const availableToAccounts = useMemo(() => {
    if (!fromAccountId) return [];
    return activeAccounts.filter((acc) => acc.id !== fromAccountId);
  }, [activeAccounts, fromAccountId]);

  // Get selected from account for balance display
  const selectedFromAccount = useMemo(() => {
    return activeAccounts.find((acc) => acc.id === fromAccountId);
  }, [activeAccounts, fromAccountId]);

  // Format currency
  const formatCurrency = (amount: number, currencyEnum: number | string = 1): string => {
    let currencyCode = 'VND';

    if (typeof currencyEnum === 'number') {
      currencyCode = CurrencyCodeMap[currencyEnum as Currency] || 'VND';
    } else if (typeof currencyEnum === 'string' && currencyEnum.length === 3) {
      currencyCode = currencyEnum.toUpperCase();
    }

    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      console.warn(`Invalid currency: ${currencyEnum}, falling back to VND`);
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    }
  };

  // Format number with commas
  const formatNumber = (value: number | undefined): string => {
    if (!value) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse number from string
  const parseNumber = (value: string | undefined): number => {
    if (!value) return 0;
    return Number(value.replace(/\$\s?|(,*)/g, ''));
  };

  // Handle form submit
  const handleSubmit = (values: any) => {
    onTransfer({
      fromAccountId: values.fromAccountId,
      toAccountId: values.toAccountId,
      amount: values.amount,
      description: values.description,
    });
  };

  return (
    <Modal
      title={t('accounts.transfer')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      okText={t('accounts.confirmTransfer')}
      cancelText={t('common.cancel')}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={t('accounts.fromAccount')}
          name="fromAccountId"
          rules={[{ required: true, message: t('accounts.fromAccountRequired') }]}
        >
          <Select
            placeholder={t('accounts.selectFromAccount')}
            showSearch
            optionFilterProp="label"
            onChange={() => form.setFieldValue('toAccountId', undefined)}
          >
            {activeAccounts.map((account) => (
              <Select.Option key={account.id} value={account.id} label={account.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {account.icon && `${account.icon} `}
                    {account.name}
                  </span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedFromAccount && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f3f4f6', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              {t('accounts.availableBalance')}:
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#10b981' }}>
              {formatCurrency(selectedFromAccount.balance, selectedFromAccount.currency)}
            </div>
          </div>
        )}

        <Form.Item
          label={t('accounts.toAccount')}
          name="toAccountId"
          rules={[{ required: true, message: t('accounts.toAccountRequired') }]}
        >
          <Select
            placeholder={t('accounts.selectToAccount')}
            showSearch
            optionFilterProp="label"
            disabled={!fromAccountId}
          >
            {availableToAccounts.map((account) => (
              <Select.Option key={account.id} value={account.id} label={account.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {account.icon && `${account.icon} `}
                    {account.name}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: 12 }}>
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t('accounts.transferAmount')}
          name="amount"
          rules={[
            { required: true, message: t('accounts.amountRequired') },
            {
              type: 'number',
              min: 1,
              message: t('accounts.amountMustBePositive'),
            },
            {
              validator: (_, value) => {
                if (selectedFromAccount && value > selectedFromAccount.balance) {
                  return Promise.reject(new Error(t('accounts.insufficientBalance')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            formatter={formatNumber}
            parser={parseNumber}
            placeholder="0"
            addonAfter={selectedFromAccount ? CurrencyCodeMap[selectedFromAccount.currency] : 'VND'}
          />
        </Form.Item>

        <Form.Item label={t('accounts.transferDescription')} name="description">
          <TextArea
            rows={3}
            placeholder={t('accounts.transferDescriptionPlaceholder')}
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
