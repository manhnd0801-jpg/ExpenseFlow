/**
 * Transaction Form Component
 * Reusable form for creating and editing transactions
 */

import { TransactionTypeLabels } from '@/constants/enum-labels';
import { CategoryType, TransactionType } from '@/constants/enums';
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
  const canCreateTransaction = hasAccounts && hasCategories;

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
    const payload: ICreateTransactionPayload = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
    };

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
            ? 'Bạn cần tạo tài khoản và danh mục trước khi tạo giao dịch'
            : !hasAccounts
            ? 'Bạn cần tạo tài khoản trước khi tạo giao dịch'
            : 'Bạn cần tạo danh mục trước khi tạo giao dịch'}
        </p>
        <Space>
          {!hasAccounts && (
            <Button type="primary" onClick={() => (window.location.href = '/accounts')}>
              Tạo tài khoản
            </Button>
          )}
          {!hasCategories && (
            <Button type="primary" onClick={() => (window.location.href = '/categories')}>
              Tạo danh mục
            </Button>
          )}
          {onCancel && <Button onClick={onCancel}>Đóng</Button>}
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
        label="Loại giao dịch"
        name="type"
        rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
      >
        <Select placeholder="Chọn loại">
          <Select.Option value={TransactionType.INCOME}>
            {TransactionTypeLabels[TransactionType.INCOME]}
          </Select.Option>
          <Select.Option value={TransactionType.EXPENSE}>
            {TransactionTypeLabels[TransactionType.EXPENSE]}
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Số tiền"
        name="amount"
        rules={[
          { required: true, message: 'Vui lòng nhập số tiền' },
          { type: 'number', min: 0, message: 'Số tiền phải lớn hơn 0' },
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
        label="Tài khoản"
        name="accountId"
        rules={[{ required: true, message: 'Vui lòng chọn tài khoản' }]}
      >
        <Select
          placeholder="Chọn tài khoản"
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
        label="Danh mục"
        name="categoryId"
        rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
      >
        <Select
          placeholder="Chọn danh mục"
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
        label="Ngày giao dịch"
        name="date"
        rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
      >
        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
      </Form.Item>

      <Form.Item
        label="Mô tả"
        name="description"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
      >
        <Input placeholder="Ví dụ: Mua sắm, Ăn trưa, Lương tháng..." />
      </Form.Item>

      <Form.Item label="Ghi chú" name="note">
        <Input.TextArea rows={3} placeholder="Ghi chú thêm (tùy chọn)" maxLength={500} showCount />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
            {initialValues ? 'Cập nhật' : 'Tạo mới'}
          </Button>
          {onCancel && <Button onClick={onCancel}>Hủy</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
