/**
 * Loan Form Page
 * Create or edit loan with amortization calculation
 */

import { ArrowLeftOutlined, CalculatorOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { LoanTypeLabels } from '@/constants/enum-labels';
import { LoanType } from '@/constants/enums';
import { useAppDispatch, useAppSelector, useNotification } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { accountActions, selectAccounts } from '@/redux/modules/accounts';
import {
  ICreateLoanPayload,
  loanActions,
  selectCurrentLoan,
  selectIsLoanLoading,
} from '@/redux/modules/loans';
import { formatCurrency } from '@/utils/formatters';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledPageWrapper = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .form-card {
    margin-bottom: 24px;
  }

  .calculator-card {
    position: sticky;
    top: 24px;

    .calculator-result {
      padding: 16px;
      background: #f9fafb;
      border-radius: 8px;
      margin-top: 16px;

      .result-title {
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 16px;
      }

      .result-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #6b7280;
          font-size: 14px;
        }

        .value {
          font-weight: 600;
          font-size: 14px;
          color: #1f2937;

          &.highlight {
            color: #3b82f6;
            font-size: 16px;
          }

          &.danger {
            color: #ef4444;
          }
        }
      }
    }
  }
`;

// ============================================
// INTERFACES
// ============================================

interface ILoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
}

// ============================================
// COMPONENT
// ============================================

const LoanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notify = useNotification();
  const [form] = Form.useForm();

  const isEditMode = !!id;

  // Redux selectors
  const currentLoan = useAppSelector(selectCurrentLoan);
  const isLoading = useAppSelector(selectIsLoanLoading);
  const accounts = useAppSelector(selectAccounts);

  // Local state
  const [calculation, setCalculation] = useState<ILoanCalculation | null>(null);

  // Load loan detail if editing
  useEffect(() => {
    // Load accounts for dropdown
    dispatch(accountActions.listAccountsRequest({}));

    if (isEditMode && id) {
      dispatch(loanActions.getLoanDetailRequest(id));
    }

    return () => {
      dispatch(loanActions.clearCurrentLoan());
    };
  }, [isEditMode, id, dispatch]);

  // Populate form when loan is loaded
  useEffect(() => {
    if (currentLoan && isEditMode) {
      form.setFieldsValue({
        name: currentLoan.name,
        type: currentLoan.type,
        originalAmount: currentLoan.originalAmount,
        interestRate: currentLoan.interestRate,
        termMonths: currentLoan.termMonths,
        startDate: dayjs(currentLoan.startDate),
        description: currentLoan.description,
        lender: currentLoan.lender,
        accountId: currentLoan.accountId, // Populate accountId if exists
      });

      // Calculate initial values
      calculateLoan({
        originalAmount: currentLoan.originalAmount,
        interestRate: currentLoan.interestRate,
        termMonths: currentLoan.termMonths,
      });
    }
  }, [currentLoan, isEditMode, form]);

  // Calculate loan amortization
  const calculateLoan = (values: {
    originalAmount?: number;
    interestRate?: number;
    termMonths?: number;
  }) => {
    const { originalAmount, interestRate, termMonths } = values;

    if (!originalAmount || !interestRate || !termMonths) {
      setCalculation(null);
      return;
    }

    // Monthly interest rate (decimal)
    const monthlyRate = interestRate / 100 / 12;

    // Calculate monthly payment using formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment =
      (originalAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);

    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - originalAmount;
    const effectiveRate = (totalInterest / originalAmount) * 100;

    setCalculation({
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      effectiveRate: Number(effectiveRate.toFixed(2)),
    });
  };

  // Handle form values change
  const handleValuesChange = (_: any, allValues: any) => {
    calculateLoan({
      originalAmount: allValues.originalAmount,
      interestRate: allValues.interestRate,
      termMonths: allValues.termMonths,
    });
  };

  // Handle form submit
  const handleSubmit = async (values: any) => {
    try {
      const payload: ICreateLoanPayload = {
        accountId: values.accountId,
        name: values.name,
        type: values.type,
        originalAmount: values.originalAmount,
        interestRate: values.interestRate,
        termMonths: values.termMonths,
        startDate: values.startDate?.toISOString() || new Date().toISOString(),
        description: values.description,
        lender: values.lender,
      };

      if (isEditMode && id) {
        dispatch(
          loanActions.updateLoanRequest({
            id,
            name: payload.name,
            description: payload.description,
            lender: payload.lender,
            accountId: payload.accountId,
          })
        );
      } else {
        dispatch(loanActions.createLoanRequest(payload));
      }

      notify.success(isEditMode ? 'Cập nhật khoản vay thành công!' : 'Tạo khoản vay thành công!');
      navigate('/loans');
    } catch (error) {
      notify.error('Có lỗi xảy ra');
    }
  };

  return (
    <StyledPageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/loans')}>
            Quay lại
          </Button>
        </Space>
        <h1>{isEditMode ? 'Chỉnh sửa khoản vay' : 'Thêm khoản vay mới'}</h1>
        <p>{isEditMode ? 'Cập nhật thông tin khoản vay' : 'Tính toán và tạo khoản vay mới'}</p>
      </div>

      <Row gutter={24}>
        {/* Form Section */}
        <Col xs={24} lg={14}>
          <Card className="form-card" title="Thông tin khoản vay">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              onValuesChange={handleValuesChange}
              initialValues={{
                type: LoanType.PERSONAL,
                startDate: dayjs(),
                termMonths: 12,
                interestRate: 12,
              }}
            >
              <Form.Item
                label="Tên khoản vay"
                name="name"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên khoản vay' },
                  { max: 100, message: 'Tên khoản vay tối đa 100 ký tự' },
                ]}
              >
                <Input placeholder="VD: Vay mua nhà, Vay mua xe..." />
              </Form.Item>

              <Form.Item
                label="Loại khoản vay"
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại khoản vay' }]}
              >
                <Select placeholder="Chọn loại khoản vay">
                  {Object.entries(LoanTypeLabels).map(([key, label]) => (
                    <Select.Option key={key} value={Number(key)}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Tài khoản nhận tiền (tùy chọn)"
                name="accountId"
                tooltip={
                  isEditMode && currentLoan?.disbursementDate
                    ? 'Khoản vay đã được giải ngân, không thể thay đổi tài khoản'
                    : 'Chọn tài khoản để ghi nhận số tiền vay vào. Nếu không chọn, chỉ tạo khoản vay không tạo giao dịch.'
                }
              >
                <Select
                  placeholder="Chọn tài khoản nhận tiền"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  disabled={isEditMode && !!currentLoan?.disbursementDate}
                >
                  {accounts.map((account: any) => (
                    <Select.Option key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số tiền vay (VND)"
                    name="originalAmount"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số tiền vay' },
                      {
                        type: 'number',
                        min: 1000000,
                        message: 'Số tiền vay tối thiểu 1,000,000 VND',
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="VD: 100000000"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      disabled={isEditMode}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      t('loans.interestRate') + ' (%/' + t('common.thisYear').toLowerCase() + ')'
                    }
                    name="interestRate"
                    rules={[
                      {
                        required: true,
                        message: t('validationMessages.required', {
                          field: t('loans.interestRate'),
                        }),
                      },
                      {
                        type: 'number',
                        min: 0.1,
                        max: 100,
                        message: t('loans.validation.interestRateRange'),
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="VD: 12"
                      step={0.1}
                      precision={2}
                      disabled={isEditMode}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('loans.term') + ' (' + t('common.thisMonth').toLowerCase() + ')'}
                    name="termMonths"
                    rules={[
                      {
                        required: true,
                        message: t('validationMessages.required', { field: t('loans.term') }),
                      },
                      {
                        type: 'number',
                        min: 1,
                        max: 360,
                        message: t('loans.validation.termRange'),
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="VD: 12"
                      disabled={isEditMode}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={t('loans.startDate')}
                    name="startDate"
                    rules={[
                      {
                        required: true,
                        message: t('validationMessages.required', { field: t('loans.startDate') }),
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder={t('common.selectDate')}
                      disabled={isEditMode}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Người/Tổ chức cho vay" name="lender">
                <Input placeholder="VD: Ngân hàng ABC, Công ty XYZ..." />
              </Form.Item>

              <Form.Item label="Ghi chú" name="description">
                <Input.TextArea rows={3} placeholder="Ghi chú về khoản vay..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={isLoading}>
                    {isEditMode ? 'Cập nhật' : 'Tạo khoản vay'}
                  </Button>
                  <Button onClick={() => navigate('/loans')}>Hủy</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Calculator Section */}
        <Col xs={24} lg={10}>
          <Card
            className="calculator-card"
            title={
              <Space>
                <CalculatorOutlined />
                Kết quả tính toán
              </Space>
            }
          >
            {calculation ? (
              <>
                <Row gutter={16}>
                  <Col span={24}>
                    <Statistic
                      title={t('loans.monthlyPayment')}
                      value={calculation.monthlyPayment}
                      formatter={(value) => formatCurrency(Number(value))}
                      valueStyle={{ color: '#3b82f6', fontSize: '28px' }}
                    />
                  </Col>
                </Row>

                <div className="calculator-result">
                  <div className="result-title">{t('loans.loanDetails')}</div>

                  <div className="result-item">
                    <span className="label">{t('loans.totalPayment')}:</span>
                    <span className="value danger">{formatCurrency(calculation.totalPayment)}</span>
                  </div>

                  <div className="result-item">
                    <span className="label">{t('loans.totalInterest')}:</span>
                    <span className="value">{formatCurrency(calculation.totalInterest)}</span>
                  </div>

                  <div className="result-item">
                    <span className="label">{t('loans.effectiveRate')}:</span>
                    <span className="value">{calculation.effectiveRate}%</span>
                  </div>

                  <div className="result-item">
                    <span className="label">{t('loans.loanAmount')}:</span>
                    <span className="value">
                      {formatCurrency(form.getFieldValue('originalAmount') || 0)}
                    </span>
                  </div>

                  <div className="result-item">
                    <span className="label">{t('loans.term')}:</span>
                    <span className="value">
                      {form.getFieldValue('termMonths') || 0} {t('common.thisMonth').toLowerCase()}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 16, fontSize: '12px', color: '#6b7280' }}>
                  💡 <strong>Lưu ý:</strong> Đây là kết quả tính toán dự kiến. Số tiền thực tế có
                  thể khác tùy theo chính sách của người cho vay.
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <CalculatorOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <p>Nhập thông tin khoản vay để xem kết quả tính toán</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </StyledPageWrapper>
  );
};

export default LoanForm;
