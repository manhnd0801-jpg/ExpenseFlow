/**
 * Payment Form Component for Debt Payments
 */

import { AccountSelect } from '@/components/atoms/AccountSelect';
import type { IDebt } from '@/types/models';
import { BankOutlined, DollarOutlined, PercentageOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, InputNumber, Row, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Item: FormItem } = Form;

export interface IPaymentFormData {
  amount: number;
  paymentDate: string;
  accountId: string;
  principalAmount?: number;
  interestAmount?: number;
}

interface IPaymentFormProps {
  debt: IDebt;
  onSubmit: (data: IPaymentFormData) => void;
  loading?: boolean;
  initialValues?: Partial<IPaymentFormData>;
}

export const PaymentForm: React.FC<IPaymentFormProps> = ({
  debt,
  onSubmit,
  loading = false,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [principalAmount, setPrincipalAmount] = useState<number>(0);
  const [interestAmount, setInterestAmount] = useState<number>(0);

  // Calculate remaining debt amount
  const remainingAmount = debt.remainingAmount || debt.originalAmount - (debt.paidAmount || 0);

  // Handle total amount change to auto-calculate principal/interest split
  const handleAmountChange = useCallback(
    (value: number | null) => {
      if (!value || value <= 0) {
        setTotalAmount(0);
        setPrincipalAmount(0);
        setInterestAmount(0);
        form.setFieldsValue({
          principalAmount: 0,
          interestAmount: 0,
        });
        return;
      }

      setTotalAmount(value);

      // Auto-calculate interest based on debt interest rate
      if (debt.interestRate && debt.interestRate > 0) {
        // Simple interest calculation for demonstration
        // In a real app, this would be more sophisticated
        const interest = Math.min(value * 0.1, value); // Max 10% of payment as interest
        const principal = value - interest;

        setPrincipalAmount(Math.max(0, principal));
        setInterestAmount(interest);

        form.setFieldsValue({
          principalAmount: Math.max(0, principal),
          interestAmount: interest,
        });
      } else {
        // No interest, all goes to principal
        setPrincipalAmount(value);
        setInterestAmount(0);
        form.setFieldsValue({
          principalAmount: value,
          interestAmount: 0,
        });
      }
    },
    [debt.interestRate, form]
  );

  // Handle manual principal/interest adjustment
  const handlePrincipalChange = useCallback(
    (value: number | null) => {
      const principal = value || 0;
      const interest = Math.max(0, totalAmount - principal);

      setPrincipalAmount(principal);
      setInterestAmount(interest);

      form.setFieldsValue({
        interestAmount: interest,
      });
    },
    [totalAmount, form]
  );

  const handleInterestChange = useCallback(
    (value: number | null) => {
      const interest = value || 0;
      const principal = Math.max(0, totalAmount - interest);

      setInterestAmount(interest);
      setPrincipalAmount(principal);

      form.setFieldsValue({
        principalAmount: principal,
      });
    },
    [totalAmount, form]
  );

  // Form submission
  const handleSubmit = useCallback(
    (values: any) => {
      const formData: IPaymentFormData = {
        amount: values.amount,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        accountId: values.accountId,
        principalAmount: values.principalAmount || 0,
        interestAmount: values.interestAmount || 0,
      };

      onSubmit(formData);
    },
    [onSubmit]
  );

  // Initialize form with default values
  useEffect(() => {
    form.setFieldsValue({
      paymentDate: dayjs(),
      ...initialValues,
    });
  }, [form, initialValues]);

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit} className="payment-form">
      <Row gutter={16}>
        <Col span={24}>
          <Title level={5}>Thông tin thanh toán</Title>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <FormItem
            label="Tài khoản thanh toán"
            name="accountId"
            rules={[{ required: true, message: 'Vui lòng chọn tài khoản thanh toán' }]}
          >
            <AccountSelect placeholder="Chọn tài khoản" prefix={<BankOutlined />} />
          </FormItem>
        </Col>

        <Col xs={24} sm={12}>
          <FormItem
            label="Ngày thanh toán"
            name="paymentDate"
            rules={[{ required: true, message: 'Vui lòng chọn ngày thanh toán' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
          </FormItem>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <FormItem
            label="Tổng số tiền thanh toán"
            name="amount"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền thanh toán' },
              { type: 'number', min: 0.01, message: 'Số tiền phải lớn hơn 0' },
              {
                type: 'number',
                max: remainingAmount,
                message: `Số tiền không được vượt quá ${remainingAmount.toLocaleString()} VNĐ`,
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số tiền"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              onChange={handleAmountChange}
            />
          </FormItem>
        </Col>
      </Row>

      {totalAmount > 0 && (
        <>
          <Row gutter={16}>
            <Col span={24}>
              <Title level={5}>Phân bổ thanh toán</Title>
              <Text type="secondary">
                Điều chỉnh phân bổ giữa gốc và lãi (tổng: {totalAmount.toLocaleString()} VNĐ)
              </Text>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <FormItem
                label="Tiền gốc"
                name="principalAmount"
                rules={[{ type: 'number', min: 0, message: 'Tiền gốc phải ≥ 0' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Tiền gốc"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                  onChange={handlePrincipalChange}
                />
              </FormItem>
            </Col>

            <Col xs={24} sm={12}>
              <FormItem
                label="Tiền lãi"
                name="interestAmount"
                rules={[{ type: 'number', min: 0, message: 'Tiền lãi phải ≥ 0' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Tiền lãi"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
                  prefix={<PercentageOutlined />}
                  suffix="VNĐ"
                  onChange={handleInterestChange}
                />
              </FormItem>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">
                  • Còn lại cần thanh toán: {(remainingAmount - totalAmount).toLocaleString()} VNĐ
                </Text>
                {debt.interestRate && (
                  <Text type="secondary">• Lãi suất nợ: {debt.interestRate}%/năm</Text>
                )}
              </Space>
            </Col>
          </Row>
        </>
      )}

      <Row>
        <Col span={24}>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              Ghi nhận thanh toán
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
};
