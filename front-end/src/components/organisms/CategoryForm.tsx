/**
 * Category Form Component
 * Reusable form for creating and editing categories
 */

import { CategoryTypeLabels } from '@/constants/enum-labels';
import { CategoryType } from '@/constants/enums';
import type { ICategory, ICreateCategoryPayload } from '@redux/modules/categories/categoryTypes';
import { Button, Form, Input, Select, Space } from 'antd';
import React, { useEffect } from 'react';

interface ICategoryFormProps {
  initialValues?: ICategory;
  onSubmit: (values: ICreateCategoryPayload) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * Category Form Component
 */
export const CategoryForm: React.FC<ICategoryFormProps> = ({
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

  // Handle form submit
  const handleSubmit = (values: any) => {
    const payload: ICreateCategoryPayload = {
      name: values.name,
      type: values.type,
      description: values.description,
      color: values.color,
      icon: values.icon,
    };

    onSubmit(payload);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        type: CategoryType.EXPENSE,
      }}
    >
      <Form.Item
        label="Tên danh mục"
        name="name"
        rules={[
          { required: true, message: 'Vui lòng nhập tên danh mục' },
          { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
        ]}
      >
        <Input placeholder="Ví dụ: Ăn uống, Xăng xe, Lương..." />
      </Form.Item>

      <Form.Item
        label="Loại danh mục"
        name="type"
        rules={[{ required: true, message: 'Vui lòng chọn loại danh mục' }]}
      >
        <Select placeholder="Chọn loại">
          {Object.entries(CategoryTypeLabels).map(([value, label]) => (
            <Select.Option key={value} value={Number(value)}>
              {label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Màu sắc" name="color">
        <Input type="color" style={{ width: '100px' }} />
      </Form.Item>

      <Form.Item label="Icon" name="icon">
        <Input placeholder="Ví dụ: 🍔, ⛽, 💰..." maxLength={2} />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <Input.TextArea
          rows={3}
          placeholder="Ghi chú về danh mục (tùy chọn)"
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
