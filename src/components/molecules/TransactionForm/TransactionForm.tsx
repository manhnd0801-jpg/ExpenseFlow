/**
 * Transaction Form Component
 * For creating and editing transactions
 */
import { CameraOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, Upload } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { TransactionType } from '../../../constants/enums';
import { CurrencyInput } from '../../atoms/CurrencyInput';

interface ITransaction {
  id?: string;
  amount: number;
  type: number;
  categoryId: string;
  accountId: string;
  note?: string;
  date: string;
  location?: string;
  images?: string[];
}

interface ICategory {
  id: string;
  name: string;
  icon?: string;
  type: number;
}

interface IAccount {
  id: string;
  name: string;
  type: number;
  balance: number;
}

interface ITransactionFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: ITransaction) => void;
  initialValues?: Partial<ITransaction>;
  categories: ICategory[];
  accounts: IAccount[];
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
      border-bottom: 1px solid #f0f0f0;
      padding-bottom: 8px;
    }
  }

  .amount-section {
    text-align: center;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    margin-bottom: 20px;

    .amount-label {
      font-size: 14px;
      color: #8c8c8c;
      margin-bottom: 8px;
    }

    .amount-input {
      font-size: 28px;
      font-weight: 700;
      text-align: center;
      border: none;
      background: transparent;

      &:focus,
      &:hover {
        border: none;
        box-shadow: none;
      }
    }
  }

  .type-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;

    .type-button {
      flex: 1;
      height: 40px;

      &.income {
        border-color: #52c41a;
        color: #52c41a;

        &.ant-btn-primary {
          background: #52c41a;
          border-color: #52c41a;
        }
      }

      &.expense {
        border-color: #ff4d4f;
        color: #ff4d4f;

        &.ant-btn-primary {
          background: #ff4d4f;
          border-color: #ff4d4f;
        }
      }

      &.transfer {
        border-color: #1890ff;
        color: #1890ff;

        &.ant-btn-primary {
          background: #1890ff;
          border-color: #1890ff;
        }
      }
    }
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    margin-top: 8px;

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

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
        font-size: 20px;
        margin-bottom: 4px;
      }

      .category-name {
        font-size: 12px;
        text-align: center;
      }
    }
  }

  .upload-section {
    .ant-upload {
      width: 100%;
    }

    .upload-button {
      width: 100%;
      height: 60px;
      border: 2px dashed #d9d9d9;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        border-color: #40a9ff;
        background: #f0f8ff;
      }

      .upload-text {
        margin-top: 4px;
        color: #8c8c8c;
        font-size: 12px;
      }
    }
  }
`;

export const TransactionForm: React.FC<ITransactionFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  categories,
  accounts,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [transactionType, setTransactionType] = useState<number>(TransactionType.EXPENSE);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  // Filter categories by transaction type
  const filteredCategories = categories.filter((cat) => cat.type === transactionType);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : dayjs(),
      });
      setTransactionType(initialValues.type || TransactionType.EXPENSE);
      setSelectedCategory(initialValues.categoryId || '');
      setAmount(initialValues.amount || 0);
    } else {
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
      setTransactionType(TransactionType.EXPENSE);
      setSelectedCategory('');
      setAmount(0);
    }
  }, [initialValues, form, visible]);

  const handleTypeChange = (type: number) => {
    setTransactionType(type);
    setSelectedCategory(''); // Reset category when type changes
    form.setFieldsValue({ categoryId: undefined });
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
        type: transactionType,
        categoryId: selectedCategory,
        amount: amount,
        date: values.date.toISOString(),
      };
      onSubmit(formattedValues);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const typeButtons = [
    {
      key: TransactionType.EXPENSE,
      label: 'Chi tiêu',
      className: 'expense',
    },
    {
      key: TransactionType.INCOME,
      label: 'Thu nhập',
      className: 'income',
    },
    {
      key: TransactionType.TRANSFER,
      label: 'Chuyển khoản',
      className: 'transfer',
    },
  ];

  return (
    <Modal
      title={initialValues?.id ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
      open={visible}
      onCancel={onCancel}
      width={480}
      footer={null}
      destroyOnClose
    >
      <FormWrapper>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Amount Section */}
          <div className="amount-section">
            <div className="amount-label">Số tiền</div>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              className="amount-input"
              placeholder="0"
              size="large"
            />
          </div>

          {/* Transaction Type */}
          <div className="type-buttons">
            {typeButtons.map((button) => (
              <Button
                key={button.key}
                className={`type-button ${button.className}`}
                type={transactionType === button.key ? 'primary' : 'default'}
                onClick={() => handleTypeChange(button.key)}
              >
                {button.label}
              </Button>
            ))}
          </div>

          {/* Category Selection */}
          <div className="form-section">
            <div className="section-title">Danh mục</div>
            <Form.Item
              name="categoryId"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <div className="category-grid">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`category-item ${
                      selectedCategory === category.id ? 'selected' : ''
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="category-icon">{category.icon || '📝'}</div>
                    <div className="category-name">{category.name}</div>
                  </div>
                ))}
              </div>
            </Form.Item>
          </div>

          {/* Basic Information */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tài khoản"
                name="accountId"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản' }]}
              >
                <Select placeholder="Chọn tài khoản">
                  {accounts.map((account) => (
                    <Select.Option key={account.id} value={account.id}>
                      {account.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày giao dịch"
                name="date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea placeholder="Nhập ghi chú (tùy chọn)" rows={3} maxLength={200} />
          </Form.Item>

          <Form.Item label="Địa điểm" name="location">
            <Input placeholder="Nhập địa điểm (tùy chọn)" />
          </Form.Item>

          {/* Image Upload */}
          <Form.Item label="Hình ảnh">
            <div className="upload-section">
              <Upload multiple beforeUpload={() => false} showUploadList={true}>
                <div className="upload-button">
                  <CameraOutlined style={{ fontSize: 20 }} />
                  <div className="upload-text">Thêm hình ảnh</div>
                </div>
              </Upload>
            </div>
          </Form.Item>

          {/* Action Buttons */}
          <Row gutter={12} style={{ marginTop: 24 }}>
            <Col span={12}>
              <Button block onClick={onCancel}>
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block loading={loading} onClick={handleSubmit}>
                {initialValues?.id ? 'Cập nhật' : 'Thêm giao dịch'}
              </Button>
            </Col>
          </Row>
        </Form>
      </FormWrapper>
    </Modal>
  );
};

export default TransactionForm;
