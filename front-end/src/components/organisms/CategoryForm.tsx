/**
 * Category Form Component
 * Reusable form for creating and editing categories
 */

import { CategoryType } from '@/constants/enums';
import { useI18n } from '@/hooks/useI18n';
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
  const { t, getCategoryTypeLabel } = useI18n();
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
        label={t('categories.categoryName')}
        name="name"
        rules={[
          { required: true, message: t('categories.nameRequired') },
          { min: 2, message: t('categories.nameMinLength') },
        ]}
      >
        <Input placeholder={t('categories.namePlaceholder')} />
      </Form.Item>

      <Form.Item
        label={t('categories.categoryType')}
        name="type"
        rules={[{ required: true, message: t('categories.typeRequired') }]}
      >
        <Select placeholder={t('categories.selectType')}>
          {[CategoryType.EXPENSE, CategoryType.INCOME].map((value) => (
            <Select.Option key={value} value={value}>
              {getCategoryTypeLabel(value)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label={t('categories.color')} name="color">
        <Input type="color" style={{ width: '100px' }} />
      </Form.Item>

      <Form.Item label={t('categories.icon')} name="icon">
        <Input placeholder={t('categories.iconPlaceholder')} maxLength={2} />
      </Form.Item>

      <Form.Item label={t('categories.description')} name="description">
        <Input.TextArea
          rows={3}
          placeholder={t('categories.descriptionPlaceholder')}
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
