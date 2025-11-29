/**
 * Budget Form Component
 * For creating and editing budgets with advanced features
 */
import { useI18n } from '@/hooks/useI18n';
import type { IBudget } from '@/types/models';
import { CalendarOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BudgetPeriod } from '../../../constants/enums';
import { formatCurrency } from '../../../utils/formatters';

const { TextArea } = Input;
const { Option } = Select;

// Local interface for category (simple version for form)
interface ICategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

// Extended interface for form usage
interface IBudgetForm extends IBudget {
  description?: string; // Alias for note field
  spentAmount?: number; // Alias for spent field
}

interface IBudgetFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: IBudgetForm) => void;
  initialValues?: Partial<IBudgetForm>;
  categories: ICategory[];
  loading?: boolean;
  isModal?: boolean; // Control whether to render as Modal or inline form
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

  .amount-section {
    background: linear-gradient(135deg, #f6f9fc 0%, #f1f8ff 100%);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e8f4f8;

    .amount-label {
      font-size: 14px;
      color: #5a6c7d;
      margin-bottom: 8px;
      text-align: center;
    }

    .amount-display {
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      color: #1976d2;
      margin-bottom: 8px;
    }
  }

  .period-selector {
    .ant-radio-group {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 8px;
    }

    .ant-radio-button-wrapper {
      text-align: center;
      height: 40px;
      line-height: 38px;
      border-radius: 6px;
    }
  }

  .threshold-section {
    background: #fff9e6;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid #ffd666;

    .threshold-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: #d48806;
      font-size: 14px;
    }
  }

  .category-selection {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-top: 8px;

    .category-card {
      padding: 12px;
      border: 2px solid #f0f0f0;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #fafafa;

      &:hover {
        border-color: #40a9ff;
        background: #f0f8ff;
      }

      &.selected {
        border-color: #1890ff;
        background: #e6f7ff;
        color: #1890ff;
      }

      .category-icon {
        font-size: 24px;
        margin-bottom: 8px;
        display: block;
      }

      .category-name {
        font-size: 12px;
        font-weight: 500;
      }
    }
  }

  .progress-preview {
    margin-top: 16px;

    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;

      .spent-amount {
        color: #ff4d4f;
        font-weight: 600;
      }

      .remaining-amount {
        color: #52c41a;
        font-weight: 600;
      }
    }
  }
`;

export const BudgetForm: React.FC<IBudgetFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  categories,
  loading = false,
  isModal = true,
}) => {
  const { t, getBudgetPeriodLabel } = useI18n();
  const [form] = Form.useForm();
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [period, setPeriod] = useState<number>(BudgetPeriod.MONTHLY);

  const spentAmount = initialValues?.spentAmount || initialValues?.spent || 0;
  const progressPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  const remainingAmount = Math.max(0, budgetAmount - spentAmount);

  useEffect(() => {
    if (initialValues) {
      // Map backend fields to form fields
      const formData = {
        ...initialValues,
        description: initialValues.note, // Map 'note' to 'description' for form
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : dayjs(),
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : dayjs().add(1, 'month'),
      };

      form.setFieldsValue(formData);
      setBudgetAmount(initialValues.amount || 0);
      setSelectedCategory(initialValues.categoryId || '');
      setAlertThreshold(initialValues.alertThreshold || 80);
      setPeriod(initialValues.period || BudgetPeriod.MONTHLY);
    } else {
      form.resetFields();
      form.setFieldsValue({
        startDate: dayjs(),
        endDate: dayjs().add(1, 'month'),
        isActive: true,
      });
      setBudgetAmount(0);
      setSelectedCategory('');
      setAlertThreshold(80);
      setPeriod(BudgetPeriod.MONTHLY);
    }
  }, [initialValues, form, visible]);

  const handlePeriodChange = (newPeriod: number) => {
    setPeriod(newPeriod);
    form.setFieldsValue({ period: newPeriod });

    // Auto-adjust end date based on period
    const startDate = form.getFieldValue('startDate') || dayjs();
    let endDate;

    switch (newPeriod) {
      case BudgetPeriod.WEEKLY:
        endDate = startDate.add(1, 'week');
        break;
      case BudgetPeriod.MONTHLY:
        endDate = startDate.add(1, 'month');
        break;
      case BudgetPeriod.QUARTERLY:
        endDate = startDate.add(3, 'months');
        break;
      case BudgetPeriod.YEARLY:
        endDate = startDate.add(1, 'year');
        break;
      default:
        endDate = startDate.add(1, 'month');
    }

    form.setFieldsValue({ endDate });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    form.setFieldsValue({ categoryId });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Safe date formatting - handle both dayjs objects and Date objects
      const formatDate = (dateValue: any) => {
        if (!dateValue) return null;

        // If it's a dayjs object
        if (dateValue && typeof dateValue.format === 'function') {
          return dateValue.format('YYYY-MM-DD');
        }

        // If it's a Date object or ISO string
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }

        // If it's already a string (ISO format)
        if (typeof dateValue === 'string') {
          return dateValue.split('T')[0];
        }

        return null;
      };

      const formattedValues = {
        ...values,
        amount: budgetAmount,
        categoryId: selectedCategory,
        alertThreshold,
        period,
        note: values.description, // Map 'description' back to 'note' for backend
        startDate: formatDate(values.startDate),
        endDate: formatDate(values.endDate),
      };

      console.log('Formatted values for submission:', formattedValues);
      onSubmit(formattedValues);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  // Helper function to get period text (currently unused but kept for future use)
  // const getPeriodText = (periodValue: number) => {
  //   switch (periodValue) {
  //     case BudgetPeriod.WEEKLY:
  //       return 'Hàng tuần';
  //     case BudgetPeriod.MONTHLY:
  //       return 'Hàng tháng';
  //     case BudgetPeriod.QUARTERLY:
  //       return 'Hàng quý';
  //     case BudgetPeriod.YEARLY:
  //       return 'Hàng năm';
  //     default:
  //       return 'Hàng tháng';
  //   }
  // };

  const periodOptions = [
    { value: BudgetPeriod.WEEKLY, label: getBudgetPeriodLabel(BudgetPeriod.WEEKLY) },
    { value: BudgetPeriod.MONTHLY, label: getBudgetPeriodLabel(BudgetPeriod.MONTHLY) },
    { value: BudgetPeriod.QUARTERLY, label: getBudgetPeriodLabel(BudgetPeriod.QUARTERLY) },
    { value: BudgetPeriod.YEARLY, label: getBudgetPeriodLabel(BudgetPeriod.YEARLY) },
  ];

  // Form content component
  const formContent = (
    <FormWrapper>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Budget Amount Section */}
        <div className="form-section">
          <div className="section-title">
            <DollarOutlined />
            {t('budgets.budgetAmount')}
          </div>
          <div className="amount-section">
            <div className="amount-label">{t('budgets.expectedSpending')}</div>
            <div className="amount-display">{formatCurrency(budgetAmount)}</div>
            <Form.Item name="amount">
              <InputNumber
                value={budgetAmount}
                onChange={(value) => setBudgetAmount(value || 0)}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value?.replace(/\$\s?|(,*)/g, '');
                  return parsed ? Number(parsed) : 0;
                }}
                placeholder={t('budgets.enterAmount')}
                size="large"
              />
            </Form.Item>
          </div>
        </div>

        {/* Basic Information */}
        <div className="form-section">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('budgets.budgetName')}
                name="name"
                rules={[{ required: true, message: t('budgets.nameRequired') }]}
              >
                <Input placeholder={t('budgets.namePlaceholder')} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('budgets.descriptionOptional')} name="description">
            <TextArea placeholder={t('budgets.descriptionPlaceholder')} rows={3} maxLength={200} />
          </Form.Item>
        </div>

        {/* Period Selection */}
        <div className="form-section">
          <div className="section-title">
            <CalendarOutlined />
            {t('budgets.budgetPeriod')}
          </div>
          <div className="period-selector">
            <Select
              value={period}
              onChange={handlePeriodChange}
              style={{ width: '100%' }}
              size="large"
            >
              {periodOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('budgets.startDate')}
              name="startDate"
              rules={[{ required: true, message: t('budgets.startDateRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('budgets.endDate')}
              name="endDate"
              rules={[{ required: true, message: t('budgets.endDateRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
            </Form.Item>
          </Col>
        </Row>

        {/* Category Selection */}
        <div className="form-section">
          <div className="section-title">{t('budgets.categoryOptional')}</div>
          <Form.Item name="categoryId">
            <div className="category-selection">
              <div
                className={`category-card ${!selectedCategory ? 'selected' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                <span className="category-icon">📊</span>
                <div className="category-name">{t('budgets.allCategories')}</div>
              </div>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <span className="category-icon">{category.icon || '📝'}</span>
                  <div className="category-name">{category.name}</div>
                </div>
              ))}
            </div>
          </Form.Item>
        </div>

        {/* Alert Threshold */}
        <div className="form-section">
          <div className="threshold-section">
            <div className="threshold-info">
              <WarningOutlined />
              {t('budgets.alertWhenReaching', { threshold: alertThreshold })}
            </div>
            <Form.Item label={t('budgets.alertThreshold')} name="alertThreshold">
              <InputNumber
                value={alertThreshold}
                onChange={(value) => setAlertThreshold(value || 80)}
                min={1}
                max={100}
                style={{ width: '100%' }}
                formatter={(value) => `${value}%`}
                parser={(value) => {
                  const parsed = value?.replace('%', '');
                  return parsed ? Number(parsed) : 0;
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* Active Status */}
        <Form.Item label={t('common.status')} name="isActive" valuePropName="checked">
          <Switch
            checkedChildren={t('budgets.activated')}
            unCheckedChildren={t('budgets.paused')}
          />
        </Form.Item>

        {/* Progress Preview (for edit mode) */}
        {initialValues?.id && (
          <div className="form-section">
            <Card title={t('budgets.currentBudgetStatus')} size="small">
              <div className="progress-preview">
                <div className="progress-info">
                  <span>
                    {t('budgets.spent')}:{' '}
                    <span className="spent-amount">{formatCurrency(spentAmount)}</span>
                  </span>
                  <span>
                    {t('budgets.remaining')}:{' '}
                    <span className="remaining-amount">{formatCurrency(remainingAmount)}</span>
                  </span>
                </div>
                <Progress
                  percent={Math.round(progressPercent)}
                  status={progressPercent > alertThreshold ? 'exception' : 'normal'}
                  strokeColor={{
                    '0%': '#52c41a',
                    '70%': '#faad14',
                    '90%': '#ff7875',
                    '100%': '#ff4d4f',
                  }}
                />
              </div>
            </Card>
          </div>
        )}

        <Divider />

        {/* Action Buttons */}
        <Row gutter={12}>
          <Col span={12}>
            <Button block size="large" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </Col>
          <Col span={12}>
            <Button type="primary" block size="large" loading={loading} onClick={handleSubmit}>
              {initialValues?.id ? t('budgets.updateBudget') : t('budgets.createBudget')}
            </Button>
          </Col>
        </Row>
      </Form>
    </FormWrapper>
  );

  // Conditional rendering based on isModal prop
  if (isModal) {
    return (
      <Modal
        title={initialValues?.id ? t('budgets.editBudget') : t('budgets.createNewBudget')}
        open={visible}
        onCancel={onCancel}
        width={600}
        footer={null}
        destroyOnClose
      >
        {formContent}
      </Modal>
    );
  }

  return formContent;
};

export default BudgetForm;
