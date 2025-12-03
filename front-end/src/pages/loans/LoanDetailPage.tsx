/**
 * Loan Detail Page
 * Display loan details with amortization schedule, payment history, and prepayment simulator
 */

import {
  ArrowLeftOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  DeleteOutlined,
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
  Popconfirm,
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

import ExtraPrincipalPaymentModal, {
  IExtraPrincipalPaymentFormData,
} from '@/components/organisms/ExtraPrincipalPaymentModal';
import PrepaymentSimulatorModal from '@/components/organisms/PrepaymentSimulatorModal';
import RecordPaymentModal from '@/components/organisms/RecordPaymentModal';
import { LoanStatusLabels, LoanTypeLabels } from '@/constants/enum-labels';
import { LoanStatus } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { accountActions, selectAccounts } from '@/redux/modules/accounts';
import { categoryActions, selectCategories } from '@/redux/modules/categories';
import {
  IExtraPrincipalTransaction,
  IPaymentScheduleWithStatus,
  loanActions,
  selectCurrentLoan,
  selectExtraPrincipalTransactions,
  selectIsLoanLoading,
  selectPaymentScheduleWithStatus,
  selectPrepaymentSimulation,
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
  const { t } = useI18n();

  // Redux selectors
  const loan = useAppSelector(selectCurrentLoan);
  const paymentScheduleWithStatus = useAppSelector(selectPaymentScheduleWithStatus);
  const extraPrincipalTransactions = useAppSelector(selectExtraPrincipalTransactions);
  const prepaymentSimulation = useAppSelector(selectPrepaymentSimulation);
  const isLoading = useAppSelector(selectIsLoanLoading);
  const accounts = useAppSelector(selectAccounts);
  const categories = useAppSelector(selectCategories);

  // Payment history: all transactions (paid + extra principal)
  const paymentHistory = [...extraPrincipalTransactions]
    .filter((tx) => !tx.description?.includes('disbursement'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Local state
  const [activeTab, setActiveTab] = useState('status');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isSimulatorModalVisible, setIsSimulatorModalVisible] = useState(false);
  const [isExtraPrincipalModalVisible, setIsExtraPrincipalModalVisible] = useState(false);

  // Load loan detail, accounts, and categories
  useEffect(() => {
    dispatch(accountActions.listAccountsRequest({}));
    dispatch(categoryActions.listCategoriesRequest({}));

    if (id) {
      dispatch(loanActions.getLoanDetailRequest(id));
      dispatch(loanActions.getPaymentScheduleWithStatusRequest(id));
      dispatch(loanActions.getExtraPrincipalTransactionsRequest(id));
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
            {isLoading ? t('loans.loading') : t('loans.notFound')}
          </div>
        </Card>
      </StyledPageWrapper>
    );
  }

  // Calculate progress
  const paidAmount = loan.originalAmount - loan.remainingPrincipal;
  const paidPercentage = (paidAmount / loan.originalAmount) * 100;

  // Check if overdue - only for active loans with remaining payments
  const isOverdue =
    loan.status === 1 && // LoanStatus.ACTIVE = 1
    loan.remainingMonths > 0 &&
    dayjs(loan.nextPaymentDate).isBefore(dayjs(), 'day');

  const progressColor =
    paidPercentage === 100
      ? '#10b981' // Green - completed
      : isOverdue
      ? '#f59e0b' // Orange - overdue
      : '#3b82f6'; // Blue - on track

  // Find disbursement account
  const disbursementAccount = loan.accountId
    ? accounts.find((acc: any) => acc.id === loan.accountId)
    : null;

  // Handlers
  const handleRecordPayment = (values: {
    accountId: string;
    amount: number;
    paymentDate: string;
    note?: string;
    categoryId?: string;
    principalCategoryId?: string;
    interestCategoryId?: string;
  }) => {
    if (!loan?.id) return;
    dispatch(
      loanActions.recordLoanPaymentRequest({
        loanId: loan.id,
        accountId: values.accountId,
        amount: values.amount,
        paymentDate: values.paymentDate,
        note: values.note,
        categoryId: values.categoryId,
        principalCategoryId: values.principalCategoryId,
        interestCategoryId: values.interestCategoryId,
      })
    );
    setIsPaymentModalVisible(false);
  };

  const handleDeleteExtraPrincipalTransaction = (transactionId: string) => {
    if (!loan?.id) return;
    dispatch(
      loanActions.deleteExtraPrincipalTransactionRequest({
        loanId: loan.id,
        transactionId,
      })
    );
  };

  const handleSimulatePrepayment = (values: {
    prepaymentAmount: number;
    strategy: 'reduce_term' | 'reduce_payment';
  }) => {
    if (!loan?.id) return;
    dispatch(
      loanActions.simulatePrepaymentRequest({
        loanId: loan.id,
        prepaymentAmount: values.prepaymentAmount,
        prepaymentDate: new Date().toISOString().split('T')[0],
        strategy: values.strategy,
      })
    );
  };

  const handleExtraPrincipalPayment = (values: IExtraPrincipalPaymentFormData) => {
    if (!loan?.id) return;
    dispatch(
      loanActions.extraPrincipalPaymentRequest({
        loanId: loan.id,
        amount: values.amount,
        paymentDate: values.paymentDate.toISOString(),
        accountId: values.accountId,
        categoryId: values.categoryId,
        note: values.note,
        // Strategy removed: always reduces monthly payment, keeps term unchanged
      })
    );
    setIsExtraPrincipalModalVisible(false);
  };

  // Payment Schedule with Status columns
  const paymentScheduleColumns: ColumnsType<IPaymentScheduleWithStatus> = [
    {
      title: 'Tháng',
      dataIndex: 'month',
      key: 'month',
      width: 80,
      align: 'center',
      render: (month: number) => <strong>#{month}</strong>,
    },
    {
      title: 'Ngày đến hạn',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số tiền phải trả',
      dataIndex: 'payment',
      key: 'payment',
      width: 140,
      align: 'right',
      render: (principal: number, record: IPaymentScheduleWithStatus) => {
        if (record.payment === 0 && loan.status === LoanStatus.PAID_OFF) {
          return '-';
        }
        return <span style={{ fontWeight: 600 }}>{formatCurrency(principal)}</span>;
      },
    },
    {
      title: 'Gốc',
      dataIndex: 'principal',
      key: 'principal',
      width: 120,
      align: 'right',
      render: (principal: number, record: IPaymentScheduleWithStatus) => {
        if (record.payment === 0 && loan.status === LoanStatus.PAID_OFF) {
          return '-';
        }
        return formatCurrency(principal);
      },
    },
    {
      title: 'Lãi',
      dataIndex: 'interest',
      key: 'interest',
      width: 120,
      align: 'right',
      render: (amount: number, record: IPaymentScheduleWithStatus) => {
        if (record.payment === 0 && loan.status === LoanStatus.PAID_OFF) {
          return '-';
        }
        return <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(amount)}</span>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: 'paid' | 'unpaid', record: IPaymentScheduleWithStatus) => {
        if (status === 'paid') {
          return <Tag color="success">Đã thanh toán</Tag>;
        }
        if (status === 'unpaid' && record.principal < 0 && loan.status === LoanStatus.PAID_OFF) {
          return '-';
        }
        return <Tag color="default">Chưa thanh toán</Tag>;
      },
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'actualPaymentDate',
      key: 'actualPaymentDate',
      width: 140,
      render: (date: string | null) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 150,
      render: (note: string | null) => note || '-',
    },
  ];

  // Payment History columns (transaction records)
  const paymentHistoryColumns: ColumnsType<IExtraPrincipalTransaction> = [
    {
      title: t('loans.paymentDate'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: t('transactions.type'),
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => {
        if (description?.includes('Trả nợ gốc (ngoài lịch)')) {
          return <Tag color="orange">Trả gốc tự do</Tag>;
        }
        if (description?.includes('Trả nợ gốc')) {
          return <Tag color="blue">Trả gốc</Tag>;
        }
        if (description?.includes('Lãi vay')) {
          return <Tag color="red">Trả lãi</Tag>;
        }
        return <Tag>Khác</Tag>;
      },
    },
    {
      title: t('transactions.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number) => (
        <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: t('accounts.account'),
      dataIndex: 'accountName',
      key: 'accountName',
      render: (accountName: string) => <Tag color="green">{accountName}</Tag>,
    },
    {
      title: t('categories.category'),
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (categoryName: string) => <Tag>{categoryName}</Tag>,
    },
    {
      title: t('transactions.note'),
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      align: 'center',
      width: 120,
      render: (_: any, record: IExtraPrincipalTransaction) => {
        // Show delete button for transactions within the last 7 days
        const transactionDate = dayjs(record.date);
        const daysSinceTransaction = dayjs().diff(transactionDate, 'day');
        const canDelete = daysSinceTransaction <= 7;

        if (!canDelete) return null;

        return (
          <Popconfirm
            title="Xóa giao dịch thanh toán?"
            description="Bạn có chắc chắn muốn xóa giao dịch này không?"
            onConfirm={() => handleDeleteExtraPrincipalTransaction(record.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} loading={isLoading}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <StyledPageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/loans')}>
            {t('common.back')}
          </Button>
          {loan.status !== LoanStatus.PAID_OFF && (
            <>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/loans/${id}/edit`)}>
                {t('common.edit')}
              </Button>
              <Button
                icon={<CalculatorOutlined />}
                onClick={() => setIsSimulatorModalVisible(true)}
              >
                {t('loans.prepaymentSimulator')}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsPaymentModalVisible(true)}
              >
                {t('debts.recordPayment')}
              </Button>
              <Button
                type="default"
                icon={<DollarOutlined />}
                onClick={() => setIsExtraPrincipalModalVisible(true)}
                style={{ borderColor: '#10b981', color: '#10b981' }}
              >
                {t('loans.extraPrincipalPayment')}
              </Button>
            </>
          )}
        </Space>

        <h1>
          {loan.name}
          <LoanStatusTag $status={loan.status}>{LoanStatusLabels[loan.status]}</LoanStatusTag>
        </h1>
        <p>
          {t('loans.loanDetails')} {t('loans.amortizationSchedule').toLowerCase()}
        </p>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="summary-cards">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.remainingBalance')}
              value={loan.remainingPrincipal}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#ef4444' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.monthlyPayment')}
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
              title={t('loans.totalInterest')}
              value={loan.totalInterestPaid}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#f59e0b' }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.paid')}
              value={paidPercentage.toFixed(1)}
              suffix="%"
              valueStyle={{ color: progressColor }}
            />
            <div className="progress-section">
              <Progress
                percent={paidPercentage}
                showInfo={false}
                strokeColor={progressColor}
                status={isOverdue && paidPercentage < 100 ? 'exception' : 'normal'}
              />
              {isOverdue && paidPercentage < 100 && (
                <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                  ⚠️ {t('loans.overdue')}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Loan Details */}
      <Card className="details-card" title={t('loans.loanInformation')}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label={t('loans.loanType')}>
            <Tag color="blue">{LoanTypeLabels[loan.type]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('loans.loanAmount')}>
            <strong>{formatCurrency(loan.originalAmount)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={t('loans.interestRate')}>
            <strong>
              {loan.interestRate}% / {t('common.thisYear').toLowerCase()}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label={t('loans.term')}>
            <strong>
              {loan.termMonths} {t('common.thisMonth').toLowerCase()}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label={t('loans.startDate')}>
            {dayjs(loan.startDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label={t('loans.dueDate')}>
            {dayjs(loan.startDate).add(loan.termMonths, 'month').format('DD/MM/YYYY')}
          </Descriptions.Item>
          {disbursementAccount && (
            <Descriptions.Item label="Tài khoản nhận tiền">
              <Tag color="green">{disbursementAccount.name}</Tag>
              {loan.disbursementDate && (
                <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>
                  (Giải ngân: {dayjs(loan.disbursementDate).format('DD/MM/YYYY HH:mm')})
                </span>
              )}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('loans.totalPayment')}>
            <strong style={{ color: '#ef4444' }}>
              {formatCurrency(loan.monthlyPayment * loan.termMonths)}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label={t('loans.paid')}>
            <strong style={{ color: '#10b981' }}>{formatCurrency(paidAmount)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={t('budgets.remaining')}>
            <strong style={{ color: '#ef4444' }}>{formatCurrency(loan.remainingPrincipal)}</strong>
          </Descriptions.Item>
          {loan.lender && (
            <Descriptions.Item label={t('loans.lenderName')} span={3}>
              {loan.lender}
            </Descriptions.Item>
          )}
          {loan.description && (
            <Descriptions.Item label={t('transactions.note')} span={3}>
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
              key: 'status',
              label: `Trạng thái thanh toán (${loan.termMonths} ${t(
                'common.thisMonth'
              ).toLowerCase()})`,
              children: (
                <Table
                  bordered
                  columns={paymentScheduleColumns}
                  dataSource={paymentScheduleWithStatus}
                  rowKey="month"
                  loading={isLoading}
                  pagination={{
                    pageSize: 12,
                    showSizeChanger: false,
                    showTotal: (total) => `Tổng ${total} tháng`,
                  }}
                  rowClassName={(record) => (record.status === 'paid' ? 'row-paid' : 'row-unpaid')}
                />
              ),
            },
            {
              key: 'payments',
              label: `${t('loans.paymentHistory')} (${paymentHistory.length})`,
              children: (
                <Table
                  bordered
                  columns={paymentHistoryColumns}
                  dataSource={paymentHistory}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => t('loans.totalTransactions', { total }),
                  }}
                  locale={{
                    emptyText: t('loans.noPayments'),
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        visible={isPaymentModalVisible}
        loan={loan}
        isLoading={isLoading}
        onSubmit={handleRecordPayment}
        onCancel={() => setIsPaymentModalVisible(false)}
      />

      {/* Prepayment Simulator Modal */}
      <PrepaymentSimulatorModal
        visible={isSimulatorModalVisible}
        loan={loan}
        simulation={prepaymentSimulation}
        isLoading={isLoading}
        onSimulate={handleSimulatePrepayment}
        onClose={() => setIsSimulatorModalVisible(false)}
      />

      {/* Extra Principal Payment Modal */}
      <ExtraPrincipalPaymentModal
        visible={isExtraPrincipalModalVisible}
        loan={loan}
        accounts={accounts}
        categories={categories}
        isLoading={isLoading}
        onSubmit={handleExtraPrincipalPayment}
        onCancel={() => setIsExtraPrincipalModalVisible(false)}
      />
    </StyledPageWrapper>
  );
};

export default LoanDetailPage;
