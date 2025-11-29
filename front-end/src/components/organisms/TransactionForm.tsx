/**
 * Transaction Form Component
 * Reusable form for creating and editing transactions
 */

import { CategoryType, TransactionType } from '@/constants/enums';
import { useI18n } from '@/hooks/useI18n';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { accountActions } from '@redux/modules/accounts';
import { categoryActions } from '@redux/modules/categories';
import { transactionActions } from '@redux/modules/transactions';
import type {
  ICreateTransactionPayload,
  ITransaction,
} from '@redux/modules/transactions/transactionTypes';
import { Button, DatePicker, Form, Input, InputNumber, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

interface ITransactionFormProps {
  initialValues?: ITransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Transaction Form Component
 */
export const TransactionForm: React.FC<ITransactionFormProps> = ({
  initialValues,
  onSuccess,
  onCancel,
}) => {
  const { t, getTransactionTypeLabel } = useI18n();
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  // Redux state
  const accounts = useAppSelector((state) => state.accounts.accounts) || [];
  const categories = useAppSelector((state) => state.categories.categories) || [];
  const isCreating = useAppSelector((state) => state.transactions.isCreating);
  const isUpdating = useAppSelector((state) => state.transactions.isUpdating);

  // Watch transaction type to filter categories
  const transactionType = Form.useWatch('type', form);

  // Load accounts and categories on mount
  useEffect(() => {
    dispatch(accountActions.listAccountsRequest({}));
    dispatch(categoryActions.listCategoriesRequest({}));
  }, [dispatch]);

  // Check if user has accounts and categories
  const hasAccounts = accounts && accounts.length > 0;
  const hasCategories = categories && categories.length > 0;

  // Set initial values if editing
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: dayjs(initialValues.date),
      });
    }
  }, [initialValues, form]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter((cat) => {
    if (!transactionType) return true;
    if (transactionType === TransactionType.INCOME) {
      return cat.type === CategoryType.INCOME;
    }
    if (transactionType === TransactionType.EXPENSE) {
      return cat.type === CategoryType.EXPENSE;
    }
    return true;
  });

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
    console.log('values', values);

    const payload: ICreateTransactionPayload = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
    };
    console.log(initialValues, 'initialValues');

    if (initialValues) {
      // Update existing transaction
      dispatch(
        transactionActions.updateTransactionRequest({
          id: initialValues.id,
          ...payload,
        })
      );
    } else {
      // Create new transaction
      dispatch(transactionActions.createTransactionRequest(payload));
    }

    // TODO: Handle success in saga and call onSuccess callback
    // For now, we'll call it immediately
    if (onSuccess) {
      setTimeout(onSuccess, 500);
    }
  };

  // Show warning if no accounts or categories
  if (!hasAccounts || !hasCategories) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ marginBottom: '16px', fontSize: '16px', color: 'rgba(0,0,0,0.65)' }}>
          {!hasAccounts && !hasCategories
            ? t('transactions.needAccountAndCategory')
            : !hasAccounts
            ? t('transactions.needAccount')
            : t('transactions.needCategory')}
        </p>
        <Space>
          {!hasAccounts && (
            <Button type="primary" onClick={() => (window.location.href = '/accounts')}>
              {t('accounts.createAccount')}
            </Button>
          )}
          {!hasCategories && (
            <Button type="primary" onClick={() => (window.location.href = '/categories')}>
              {t('categories.createCategory')}
            </Button>
          )}
          {onCancel && <Button onClick={onCancel}>{t('common.close')}</Button>}
        </Space>
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        type: TransactionType.EXPENSE,
        date: dayjs(),
      }}
    >
      <Form.Item
        label={t('transactions.transactionType')}
        name="type"
        rules={[{ required: true, message: t('transactions.typeRequired') }]}
      >
        <Select placeholder={t('transactions.selectType')}>
          <Select.Option value={TransactionType.INCOME}>
            {getTransactionTypeLabel(TransactionType.INCOME)}
          </Select.Option>
          <Select.Option value={TransactionType.EXPENSE}>
            {getTransactionTypeLabel(TransactionType.EXPENSE)}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={t('transactions.amount')}
        name="amount"
        rules={[
          { required: true, message: t('transactions.amountRequired') },
          { type: 'number', min: 0, message: t('transactions.amountMinimum') },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          formatter={formatCurrency}
          parser={parseCurrency}
          placeholder="0"
          addonAfter="VND"
        />
      </Form.Item>

      <Form.Item
        label={t('transactions.account')}
        name="accountId"
        rules={[{ required: true, message: t('transactions.accountRequired') }]}
      >
        <Select
          placeholder={t('transactions.selectAccount')}
          loading={!accounts.length}
          showSearch
          optionFilterProp="children"
        >
          {accounts.map((acc) => (
            <Select.Option key={acc.id} value={acc.id}>
              {acc.name} -{' '}
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(acc.balance)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={t('transactions.category')}
        name="categoryId"
        rules={[{ required: true, message: t('transactions.categoryRequired') }]}
      >
        <Select
          placeholder={t('transactions.selectCategory')}
          loading={!categories.length}
          showSearch
          optionFilterProp="children"
        >
          {filteredCategories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id}>
              <Space>
                {cat.icon && <span style={{ color: cat.color }}>{cat.icon}</span>}
                <span>{cat.name}</span>
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={t('transactions.date')}
        name="date"
        rules={[{ required: true, message: t('transactions.dateRequired') }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD/MM/YYYY"
          placeholder={t('transactions.selectDate')}
        />
      </Form.Item>

      <Form.Item
        label={t('transactions.description')}
        name="description"
        rules={[{ required: true, message: t('transactions.descriptionRequired') }]}
      >
        <Input placeholder={t('transactions.descriptionPlaceholder')} />
      </Form.Item>

      <Form.Item label={t('transactions.note')} name="note">
        <Input.TextArea
          rows={3}
          placeholder={t('transactions.notePlaceholder')}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
            {initialValues ? t('common.update') : t('common.create')}
          </Button>
          {onCancel && <Button onClick={onCancel}>{t('common.cancel')}</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
