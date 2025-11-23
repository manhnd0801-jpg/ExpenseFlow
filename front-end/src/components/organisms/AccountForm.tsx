/**
 * Account Form Component
 * Reusable form for creating and editing accounts
 */

import { AccountTypeLabels, CurrencyLabels } from '@/constants/enum-labels';
import { AccountType, Currency } from '@/constants/enums';
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
        label="Tên tài khoản"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập tên tài khoản' },
          { min: 3, message: 'Tên phải có ít nhất 3 ký tự' },
        ]}
      >
        <Input placeholder="Ví dụ: Tài khoản Vietcombank, Ví Momo..." />
      </Form.Item>

      <Form.Item
        label="Loại tài khoản"
        name="type"
        rules={[{ required: true, message: 'Vui lòng chọn loại tài khoản' }]}
      >
        <Select placeholder="Chọn loại" disabled={!!initialValues}>
          {Object.entries(AccountTypeLabels).map(([value, label]) => (
            <Select.Option key={value} value={Number(value)}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Số dư ban đầu"
        name="initialBalance"
        rules={[
          { required: true, message: 'Vui lòng nhập số dư ban đầu' },
          { type: 'number', min: 0, message: 'Số dư phải >= 0' },
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
        label="Đơn vị tiền tệ"
        name="currency"
        rules={[{ required: true, message: 'Vui lòng chọn đơn vị tiền tệ' }]}
      >
        <Select placeholder="Chọn đơn vị" disabled={!!initialValues}>
          <Select.Option value={Currency.VND}>{CurrencyLabels[Currency.VND]}</Select.Option>
          <Select.Option value={Currency.USD}>{CurrencyLabels[Currency.USD]}</Select.Option>
          <Select.Option value={Currency.EUR}>{CurrencyLabels[Currency.EUR]}</Select.Option>
          <Select.Option value={Currency.JPY}>{CurrencyLabels[Currency.JPY]}</Select.Option>
          <Select.Option value={Currency.CNY}>{CurrencyLabels[Currency.CNY]}</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="Màu sắc" name="color">
        <Input type="color" style={{ width: '100px' }} />
      </Form.Item>

      <Form.Item label="Icon" name="icon">
        <Input placeholder="Ví dụ: 💰, 🏦, 💳..." maxLength={2} />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea
          rows={3}
          placeholder="Ghi chú về tài khoản (tùy chọn)"
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Cập nhật' : 'Tạo mới'}
          </Button>
          {onCancel && <Button onClick={onCancel}>Hủy</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};
