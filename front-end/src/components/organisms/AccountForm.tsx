/**
 * Account Form Component
 * Reusable form for creating and editing accounts
 */

import { AccountType, Currency } from '@/constants/enums';
import { useI18n } from '@/hooks/useI18n';
import type { IAccount, ICreateAccountPayload } from '@redux/modules/accounts/accountTypes';
import { Button, Form, Input, InputNumber, Select, Space } from 'antd';
import React, { useEffect } from 'react';

interface IAccountFormProps {
  initialValues?: IAccount;
  onSubmit: (values: ICreateAccountPayload) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Account Form Component
 */
export const AccountForm: React.FC<IAccountFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t, getAccountTypeLabel, getCurrencyLabel } = useI18n();
  const [form] = Form.useForm();

  // Set initial values if editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    }
  }, [initialValues, form]);

  // Format currency
  const formatCurrency = (value: number | undefined): string => {
    if (!value) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse currency
  const parseCurrency = (value: string | undefined): number => {
    if (!value) return 0;
    return Number(value.replace(/\$\s?|(,*)/g, ''));
  };

  // Handle form submit
  const handleSubmit = (values: any) => {
    if (initialValues) {
      // UPDATE mode - only send mutable fields
      const payload: any = {
        name: values.name,
        color: values.color,
        icon: values.icon,
        description: values.description,
      };
      onSubmit(payload);
    } else {
      // CREATE mode - send all fields
      const payload: ICreateAccountPayload = {
        name: values.name,
        type: values.type,
        initialBalance: values.initialBalance,
        currency: values.currency || Currency.VND,
        color: values.color,
        icon: values.icon,
        description: values.description,
      };
      onSubmit(payload);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        type: AccountType.BANK,
        currency: Currency.VND,
        initialBalance: 0,
      }}
    >
      <Form.Item
        label={t('accounts.accountName')}
        name="name"
        rules={[
          { required: true, message: t('accounts.nameRequired') },
          { min: 3, message: t('accounts.nameMinLength') },
        ]}
      >
        <Input placeholder={t('accounts.namePlaceholder')} />
      </Form.Item>
      {!initialValues && (
        <>
          <Form.Item
            label={t('accounts.accountType')}
            name="type"
            rules={[{ required: true, message: t('accounts.typeRequired') }]}
          >
            <Select placeholder={t('accounts.selectType')} disabled={!!initialValues}>
              {[
                AccountType.CASH,
                AccountType.BANK,
                AccountType.CREDIT_CARD,
                AccountType.DIGITAL_WALLET,
              ].map((value) => (
                <Select.Option key={value} value={value}>
                  {getAccountTypeLabel(value)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t('accounts.initialBalance')}
            name="initialBalance"
            rules={[
              { required: true, message: t('accounts.balanceRequired') },
              { type: 'number', min: 0, message: t('accounts.balanceMinimum') },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={formatCurrency}
              parser={parseCurrency}
              placeholder="0"
              addonAfter="VND"
              disabled={!!initialValues}
            />
          </Form.Item>

          <Form.Item
            label={t('accounts.currency')}
            name="currency"
            rules={[{ required: true, message: t('accounts.currencyRequired') }]}
          >
            <Select placeholder={t('accounts.selectCurrency')} disabled={!!initialValues}>
              {[Currency.VND, Currency.USD, Currency.EUR, Currency.JPY, Currency.CNY].map(
                (value) => (
                  <Select.Option key={value} value={value}>
                    {getCurrencyLabel(value)}
                  </Select.Option>
                )
              )}
            </Select>
          </Form.Item>
        </>
      )}

      <Form.Item label={t('accounts.color')} name="color">
        <Input type="color" style={{ width: '100px' }} />
      </Form.Item>

      <Form.Item label={t('accounts.icon')} name="icon">
        <Input placeholder={t('accounts.iconPlaceholder')} maxLength={2} />
      </Form.Item>

      <Form.Item label={t('accounts.description')} name="description">
        <Input.TextArea
          rows={3}
          placeholder={t('accounts.descriptionPlaceholder')}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? t('common.update') : t('common.create')}
          </Button>
          {onCancel && <Button onClick={onCancel}>{t('common.cancel')}</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
