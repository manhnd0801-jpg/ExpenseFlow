/**
 * Budget Form Component
 * For creating and editing budgets with advanced features
 */
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

interface IBudget {
  id?: string;
  name: string;
  description?: string;
  amount: number;
  period: number;
  categoryId?: string;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  isActive: boolean;
  spentAmount?: number;
}

interface ICategory {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface IBudgetFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: IBudget) => void;
  initialValues?: Partial<IBudget>;
  categories: ICategory[];
  loading?: boolean;
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
}) => {
  const [form] = Form.useForm();
  const [budgetAmount, setBudgetAmount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);
  const [period, setPeriod] = useState<number>(BudgetPeriod.MONTHLY);

  const spentAmount = initialValues?.spentAmount || 0;
  const progressPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  const remainingAmount = Math.max(0, budgetAmount - spentAmount);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : dayjs(),
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : dayjs().add(1, 'month'),
      });
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
      const formattedValues = {
        ...values,
        amount: budgetAmount,
        categoryId: selectedCategory,
        alertThreshold,
        period,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };
      onSubmit(formattedValues);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const getPeriodText = (periodValue: number) => {
    switch (periodValue) {
      case BudgetPeriod.WEEKLY:
        return 'Hàng tuần';
      case BudgetPeriod.MONTHLY:
        return 'Hàng tháng';
      case BudgetPeriod.QUARTERLY:
        return 'Hàng quý';
      case BudgetPeriod.YEARLY:
        return 'Hàng năm';
      default:
        return 'Hàng tháng';
    }
  };

  const periodOptions = [
    { value: BudgetPeriod.WEEKLY, label: 'Tuần' },
    { value: BudgetPeriod.MONTHLY, label: 'Tháng' },
    { value: BudgetPeriod.QUARTERLY, label: 'Quý' },
    { value: BudgetPeriod.YEARLY, label: 'Năm' },
  ];

  return (
    <Modal
      title={initialValues?.id ? 'Chỉnh sửa ngân sách' : 'Tạo ngân sách mới'}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={null}
      destroyOnClose
    >
      <FormWrapper>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Budget Amount Section */}
          <div className="form-section">
            <div className="section-title">
              <DollarOutlined />
              Số tiền ngân sách
            </div>
            <div className="amount-section">
              <div className="amount-label">Số tiền dự kiến chi tiêu</div>
              <div className="amount-display">{formatCurrency(budgetAmount)}</div>
              <InputNumber
                value={budgetAmount}
                onChange={(value) => setBudgetAmount(value || 0)}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập số tiền"
                size="large"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Tên ngân sách"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên ngân sách' }]}
                >
                  <Input placeholder="VD: Ngân sách ăn uống tháng 12" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả (tùy chọn)" name="description">
              <TextArea placeholder="Mô tả chi tiết về ngân sách này..." rows={3} maxLength={200} />
            </Form.Item>
          </div>

          {/* Period Selection */}
          <div className="form-section">
            <div className="section-title">
              <CalendarOutlined />
              Chu kỳ ngân sách
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
                label="Ngày bắt đầu"
                name="startDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày kết thúc"
                name="endDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
              </Form.Item>
            </Col>
          </Row>

          {/* Category Selection */}
          <div className="form-section">
            <div className="section-title">Danh mục (tùy chọn)</div>
            <Form.Item name="categoryId">
              <div className="category-selection">
                <div
                  className={`category-card ${!selectedCategory ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect('')}
                >
                  <span className="category-icon">📊</span>
                  <div className="category-name">Tất cả</div>
                </div>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-card ${
                      selectedCategory === category.id ? 'selected' : ''
                    }`}
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
                Cảnh báo khi đạt {alertThreshold}% ngân sách
              </div>
              <Form.Item label="Ngưỡng cảnh báo (%)" name="alertThreshold">
                <InputNumber
                  value={alertThreshold}
                  onChange={(value) => setAlertThreshold(value || 80)}
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}%`}
                  parser={(value) => value!.replace('%', '')}
                />
              </Form.Item>
            </div>
          </div>

          {/* Active Status */}
          <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          {/* Progress Preview (for edit mode) */}
          {initialValues?.id && (
            <div className="form-section">
              <Card title="Tình trạng ngân sách hiện tại" size="small">
                <div className="progress-preview">
                  <div className="progress-info">
                    <span>
                      Đã chi: <span className="spent-amount">{formatCurrency(spentAmount)}</span>
                    </span>
                    <span>
                      Còn lại:{' '}
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
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block size="large" loading={loading} onClick={handleSubmit}>
                {initialValues?.id ? 'Cập nhật ngân sách' : 'Tạo ngân sách'}
              </Button>
            </Col>
          </Row>
        </Form>
      </FormWrapper>
    </Modal>
  );
};

export default BudgetForm;
