/**
 * Loan Detail Page
 * Display loan details with amortization schedule, payment history, and prepayment simulator
 */

import {
  ArrowLeftOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
  PercentageOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { LoanStatusLabels, LoanTypeLabels } from '@/constants/enum-labels';
import { LoanStatus } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  IAmortizationScheduleItem,
  ILoanPayment,
  loanActions,
  selectAmortizationSchedule,
  selectCurrentLoan,
  selectIsLoanLoading,
  selectLoanPayments,
} from '@/redux/modules/loans';
import { formatCurrency } from '@/utils/formatters';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledPageWrapper = styled.div`
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .summary-cards {
    margin-bottom: 24px;
  }

  .details-card {
    margin-bottom: 24px;
  }

  .progress-section {
    margin-top: 16px;

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: #6b7280;
    }
  }
`;

const LoanStatusTag = styled(Tag)<{ $status: LoanStatus }>`
  background-color: ${(props) => {
    switch (props.$status) {
      case LoanStatus.ACTIVE:
        return '#d1fae5';
      case LoanStatus.PAID_OFF:
        return '#dbeafe';
      case LoanStatus.DEFAULTED:
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case LoanStatus.ACTIVE:
        return '#065f46';
      case LoanStatus.PAID_OFF:
        return '#1e40af';
      case LoanStatus.DEFAULTED:
        return '#7f1d1d';
      default:
        return '#374151';
    }
  }};
  border: none;
  font-weight: 500;
  font-size: 14px;
`;

// ============================================
// COMPONENT
// ============================================

const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux selectors
  const loan = useAppSelector(selectCurrentLoan);
  const amortizationSchedule = useAppSelector(selectAmortizationSchedule);
  const payments = useAppSelector(selectLoanPayments);
  const isLoading = useAppSelector(selectIsLoanLoading);

  // Local state
  const [activeTab, setActiveTab] = useState('schedule');

  // Load loan detail
  useEffect(() => {
    if (id) {
      dispatch(loanActions.getLoanDetailRequest(id));
      dispatch(loanActions.getAmortizationScheduleRequest(id));
      dispatch(loanActions.getLoanPaymentsRequest(id));
    }

    return () => {
      dispatch(loanActions.clearCurrentLoan());
    };
  }, [id, dispatch]);

  if (!loan) {
    return (
      <StyledPageWrapper>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            {isLoading ? 'Đang tải...' : 'Không tìm thấy khoản vay'}
          </div>
        </Card>
      </StyledPageWrapper>
    );
  }

  // Calculate progress
  const paidAmount = loan.principal - loan.remainingBalance;
  const paidPercentage = (paidAmount / loan.principal) * 100;

  // Amortization schedule columns
  const scheduleColumns: ColumnsType<IAmortizationScheduleItem> = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
      width: 80,
      render: (month: number) => <strong>#{month}</strong>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trả hàng tháng',
      dataIndex: 'payment',
      key: 'payment',
      align: 'right',
      render: (payment: number) => (
        <span style={{ fontWeight: 600, color: '#3b82f6' }}>{formatCurrency(payment)}</span>
      ),
    },
    {
      title: 'Gốc',
      dataIndex: 'principal',
      key: 'principal',
      align: 'right',
      render: (principal: number) => formatCurrency(principal),
    },
    {
      title: 'Lãi',
      dataIndex: 'interest',
      key: 'interest',
      align: 'right',
      render: (interest: number) => (
        <span style={{ color: '#ef4444' }}>{formatCurrency(interest)}</span>
      ),
    },
    {
      title: 'Số dư còn lại',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance: number) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(balance)}</span>
      ),
    },
  ];

  // Payment history columns
  const paymentColumns: ColumnsType<ILoanPayment> = [
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Gốc',
      dataIndex: 'principal',
      key: 'principal',
      align: 'right',
      render: (principal: number) => formatCurrency(principal),
    },
    {
      title: 'Lãi',
      dataIndex: 'interest',
      key: 'interest',
      align: 'right',
      render: (interest: number) => formatCurrency(interest),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
  ];

  return (
    <StyledPageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/loans')}>
            Quay lại
          </Button>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/loans/${id}/edit`)}>
            Chỉnh sửa
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Ghi nhận thanh toán
          </Button>
        </Space>

        <h1>
          {loan.name}
          <LoanStatusTag $status={loan.status}>{LoanStatusLabels[loan.status]}</LoanStatusTag>
        </h1>
        <p>Chi tiết khoản vay và lịch trả nợ</p>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-cards">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số dư còn lại"
              value={loan.remainingBalance}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#ef4444' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trả hàng tháng"
              value={loan.monthlyPayment}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#3b82f6' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng tiền lãi"
              value={loan.totalInterest}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#f59e0b' }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã trả"
              value={paidPercentage.toFixed(1)}
              suffix="%"
              valueStyle={{ color: '#10b981' }}
            />
            <div className="progress-section">
              <Progress
                percent={paidPercentage}
                showInfo={false}
                strokeColor={paidPercentage === 100 ? '#10b981' : '#3b82f6'}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Loan Details */}
      <Card className="details-card" title="Thông tin khoản vay">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="Loại khoản vay">
            <Tag color="blue">{LoanTypeLabels[loan.type]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Số tiền vay">
            <strong>{formatCurrency(loan.principal)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Lãi suất">
            <strong>{loan.interestRate}% / năm</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Kỳ hạn">
            <strong>{loan.termMonths} tháng</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {dayjs(loan.startDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc dự kiến">
            {dayjs(loan.startDate).add(loan.termMonths, 'month').format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng phải trả">
            <strong style={{ color: '#ef4444' }}>{formatCurrency(loan.totalPayment)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Đã trả">
            <strong style={{ color: '#10b981' }}>{formatCurrency(paidAmount)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Còn lại">
            <strong style={{ color: '#ef4444' }}>{formatCurrency(loan.remainingBalance)}</strong>
          </Descriptions.Item>
          {loan.lender && (
            <Descriptions.Item label="Người cho vay" span={3}>
              {loan.lender}
            </Descriptions.Item>
          )}
          {loan.description && (
            <Descriptions.Item label="Ghi chú" span={3}>
              {loan.description}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Amortization Schedule & Payments */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'schedule',
              label: `Lịch trả nợ (${amortizationSchedule.length} tháng)`,
              children: (
                <Table
                  bordered
                  columns={scheduleColumns}
                  dataSource={amortizationSchedule}
                  rowKey="month"
                  loading={isLoading}
                  pagination={{
                    pageSize: 12,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} kỳ`,
                  }}
                  scroll={{ x: 800 }}
                />
              ),
            },
            {
              key: 'payments',
              label: `Lịch sử thanh toán (${payments.length})`,
              children: (
                <Table
                  bordered
                  columns={paymentColumns}
                  dataSource={payments}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `Tổng ${total} giao dịch`,
                  }}
                  locale={{
                    emptyText: 'Chưa có thanh toán nào',
                  }}
                />
              ),
            },
          ]}
        />
      </Card>
    </StyledPageWrapper>
  );
};

export default LoanDetailPage;
