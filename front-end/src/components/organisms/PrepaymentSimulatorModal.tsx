/**
 * Prepayment Simulator Modal
 * Simulate prepayment scenarios to show interest savings and new schedule
 */

import { Form, InputNumber, Modal, Radio, Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { useI18n } from '@/hooks/useI18n';
import { IAmortizationScheduleItem, ILoan, IPrepaymentSimulation } from '@/redux/modules/loans';
import { formatCurrency } from '@/utils/formatters';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledFormItem = styled(Form.Item)`
  .ant-form-item-label > label {
    font-weight: 500;
  }
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 24px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ComparisonCard = styled.div<{ $highlight?: boolean }>`
  background: ${(props) => (props.$highlight ? '#f0f9ff' : '#f9fafb')};
  border: 2px solid ${(props) => (props.$highlight ? '#3b82f6' : '#e5e7eb')};
  border-radius: 8px;
  padding: 16px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: ${(props) => (props.$highlight ? '#1e40af' : '#374151')};
  }

  .metric {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
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
        color: #10b981;
        font-size: 16px;
      }

      &.warning {
        color: #ef4444;
      }
    }
  }
`;

const SavingsHighlight = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 24px 0;

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .amount {
    font-size: 32px;
    font-weight: 700;
    margin: 8px 0;
  }

  .subtitle {
    font-size: 14px;
    opacity: 0.9;
  }
`;

// ============================================
// TYPES
// ============================================

export interface IPrepaymentSimulatorFormValues {
  prepaymentAmount: number;
  strategy: 'reduce_term' | 'reduce_payment';
}

interface IPrepaymentSimulatorModalProps {
  visible: boolean;
  loan: ILoan | null;
  simulation: IPrepaymentSimulation | null;
  isLoading?: boolean;
  onSimulate: (values: {
    prepaymentAmount: number;
    strategy: 'reduce_term' | 'reduce_payment';
  }) => void;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

const PrepaymentSimulatorModal: React.FC<IPrepaymentSimulatorModalProps> = ({
  visible,
  loan,
  simulation,
  isLoading = false,
  onSimulate,
  onClose,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm<IPrepaymentSimulatorFormValues>();

  useEffect(() => {
    if (visible && loan) {
      form.setFieldsValue({
        prepaymentAmount: loan.monthlyPayment,
        strategy: 'reduce_term',
      });
    }
  }, [visible, loan, form]);

  const handleSimulate = async () => {
    try {
      const values = await form.validateFields();
      onSimulate(values);
    } catch (error) {
      // Validation failed
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  if (!loan) return null;

  // Schedule columns
  const scheduleColumns: ColumnsType<IAmortizationScheduleItem> = [
    {
      title: t('loans.month'),
      dataIndex: 'month',
      key: 'month',
      width: 80,
      render: (month: number) => <strong>#{month}</strong>,
    },
    {
      title: t('loans.monthlyPayment'),
      dataIndex: 'payment',
      key: 'payment',
      align: 'right',
      render: (payment: number) => formatCurrency(payment),
    },
    {
      title: t('loans.principal'),
      dataIndex: 'principal',
      key: 'principal',
      align: 'right',
      render: (principal: number) => formatCurrency(principal),
    },
    {
      title: t('loans.interest'),
      dataIndex: 'interest',
      key: 'interest',
      align: 'right',
      render: (interest: number) => (
        <span style={{ color: '#ef4444' }}>{formatCurrency(interest)}</span>
      ),
    },
    {
      title: t('loans.balance'),
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance: number) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(balance)}</span>
      ),
    },
  ];

  return (
    <Modal
      title={t('loans.prepaymentSimulator')}
      open={visible}
      onOk={handleSimulate}
      onCancel={handleClose}
      confirmLoading={isLoading}
      okText={t('loans.simulate')}
      cancelText={t('common.close')}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ strategy: 'reduce_term' }}>
        <StyledFormItem
          label={t('loans.prepaymentAmount')}
          name="prepaymentAmount"
          rules={[
            {
              required: true,
              message: t('validation.required', { field: t('loans.prepaymentAmount') }),
            },
            {
              type: 'number',
              min: 1000,
              message: t('validation.min', { field: t('loans.prepaymentAmount'), min: '1,000' }),
            },
            {
              type: 'number',
              max: loan.remainingPrincipal,
              message: t('validation.max', {
                field: t('loans.prepaymentAmount'),
                max: formatCurrency(loan.remainingPrincipal),
              }),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder={t('loans.enterPrepaymentAmount')}
            step={1000000}
            precision={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => (value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0) as any}
            addonAfter="VNĐ"
            min={0}
          />
        </StyledFormItem>

        <StyledFormItem
          label={t('loans.prepaymentStrategy')}
          name="strategy"
          rules={[
            {
              required: true,
              message: t('validation.required', { field: t('loans.prepaymentStrategy') }),
            },
          ]}
        >
          <Radio.Group>
            <Radio value="reduce_term">{t('loans.reduceTerm')}</Radio>
            <Radio value="reduce_payment">{t('loans.reducePayment')}</Radio>
          </Radio.Group>
        </StyledFormItem>
      </Form>

      {simulation && (
        <>
          <SavingsHighlight>
            <h3>{t('loans.totalInterestSaved')}</h3>
            <div className="amount">{formatCurrency(simulation.totalInterestSaved)}</div>
            <div className="subtitle">
              {t('loans.savingMessage', {
                months: simulation.monthsSaved,
                years: Math.floor(simulation.monthsSaved / 12),
              })}
            </div>
          </SavingsHighlight>

          <ComparisonGrid>
            <ComparisonCard>
              <h3>{t('loans.currentPlan')}</h3>
              <div className="metric">
                <span className="label">{t('loans.remainingMonths')}:</span>
                <span className="value">
                  {simulation.originalTermMonths} {t('common.thisMonth').toLowerCase()}
                </span>
              </div>
              <div className="metric">
                <span className="label">{t('loans.monthlyPayment')}:</span>
                <span className="value">{formatCurrency(simulation.originalMonthlyPayment)}</span>
              </div>
              <div className="metric">
                <span className="label">{t('loans.totalInterest')}:</span>
                <span className="value warning">
                  {formatCurrency(simulation.originalTotalInterest)}
                </span>
              </div>
            </ComparisonCard>

            <ComparisonCard $highlight>
              <h3>{t('loans.newPlanWithPrepayment')}</h3>
              <div className="metric">
                <span className="label">{t('loans.remainingMonths')}:</span>
                <span className="value highlight">
                  {simulation.newTermMonths} {t('common.thisMonth').toLowerCase()}
                </span>
              </div>
              <div className="metric">
                <span className="label">{t('loans.monthlyPayment')}:</span>
                <span className="value highlight">
                  {formatCurrency(simulation.newMonthlyPayment)}
                </span>
              </div>
              <div className="metric">
                <span className="label">{t('loans.totalInterest')}:</span>
                <span className="value highlight">
                  {formatCurrency(simulation.newTotalInterest)}
                </span>
              </div>
            </ComparisonCard>
          </ComparisonGrid>

          {simulation.newSchedule && simulation.newSchedule.length > 0 && (
            <Tabs
              items={[
                {
                  key: 'schedule',
                  label: t('loans.newAmortizationSchedule'),
                  children: (
                    <Table
                      bordered
                      size="small"
                      columns={scheduleColumns}
                      dataSource={simulation.newSchedule}
                      rowKey="month"
                      pagination={{
                        pageSize: 12,
                        showSizeChanger: false,
                      }}
                      scroll={{ x: 600 }}
                    />
                  ),
                },
              ]}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default PrepaymentSimulatorModal;
