/**
 * Loans List Page
 * Displays loans with filters, pagination, and CRUD operations
 */

import { LoanStatusLabels, LoanTypeLabels } from '@/constants/enum-labels';
import { LoanStatus, LoanType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { loanActions, selectIsLoanLoading, selectLoanError } from '@/redux/modules/loans';
import type { ILoan } from '@/types/models';
import { formatCurrency } from '@/utils/formatters';
import {
  BankOutlined,
  CarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
  ReadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  type ColumnsType,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoansListPage: React.FC = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loans = useAppSelector((state) => state.loans.loans);
  const isLoading = useAppSelector(selectIsLoanLoading);
  const error = useAppSelector(selectLoanError);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingLoanId, setDeletingLoanId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loanActions.listLoansRequest({ page: 1, limit: 100 }));
  }, [dispatch]);

  // ============================================
  // SUMMARY CALCULATIONS
  // ============================================

  const summary = React.useMemo(() => {
    const activeLoans = loans.filter((loan) => loan.status === LoanStatus.ACTIVE).length;
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const monthlyPayment = loans
      .filter((loan) => loan.status === LoanStatus.ACTIVE)
      .reduce((sum, loan) => sum + (loan.monthlyPayment || 0), 0);
    const totalInterest = loans.reduce((sum, loan) => sum + loan.interestAmount, 0);

    return {
      activeLoans,
      totalRemaining,
      monthlyPayment,
      totalInterest,
    };
  }, [loans]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreateLoan = () => {
    navigate('/loans/create');
  };

  const handleViewLoan = (loanId: string) => {
    navigate(`/loans/${loanId}`);
  };

  const handleEditLoan = (loanId: string) => {
    navigate(`/loans/${loanId}/edit`);
  };

  const showDeleteConfirm = (loanId: string) => {
    setDeletingLoanId(loanId);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    if (deletingLoanId) {
      dispatch(loanActions.deleteLoanRequest({ id: deletingLoanId }));
      setDeleteModalVisible(false);
      setDeletingLoanId(null);
    }
  };

  // ============================================
  // HELPERS
  // ============================================

  const getLoanTypeIcon = (type: LoanType) => {
    switch (type) {
      case LoanType.HOME:
        return <HomeOutlined style={{ fontSize: '20px', color: '#3b82f6' }} />;
      case LoanType.AUTO:
        return <CarOutlined style={{ fontSize: '20px', color: '#10b981' }} />;
      case LoanType.STUDENT:
        return <ReadOutlined style={{ fontSize: '20px', color: '#f59e0b' }} />;
      case LoanType.BUSINESS:
        return <ShopOutlined style={{ fontSize: '20px', color: '#8b5cf6' }} />;
      case LoanType.PERSONAL:
      default:
        return <BankOutlined style={{ fontSize: '20px', color: '#6366f1' }} />;
    }
  };

  const getStatusColor = (status: LoanStatus): string => {
    const colorMap: Record<LoanStatus, string> = {
      [LoanStatus.ACTIVE]: 'blue',
      [LoanStatus.COMPLETED]: 'green',
      [LoanStatus.DEFAULTED]: 'red',
    };
    return colorMap[status] || 'default';
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns: ColumnsType<ILoan> = [
    {
      title: t('loans.loanName'),
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text: string, record: ILoan) => (
        <Space>
          {getLoanTypeIcon(record.type)}
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{LoanTypeLabels[record.type]}</div>
          </div>
        </Space>
      ),
    },
    {
      title: t('loans.originalAmount'),
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      width: '15%',
      align: 'right',
      render: (amount: number) => <span style={{ fontWeight: 600 }}>{formatCurrency(amount)}</span>,
    },
    {
      title: t('loans.remainingAmount'),
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: '15%',
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(amount)}</span>
      ),
    },
    {
      title: t('loans.progress'),
      key: 'progress',
      width: '15%',
      render: (_: unknown, record: ILoan) => {
        const paidAmount = record.originalAmount - record.remainingAmount;
        const percentage = (paidAmount / record.originalAmount) * 100;
        return (
          <div>
            <Progress
              percent={Number(percentage.toFixed(1))}
              size="small"
              status={record.status === LoanStatus.COMPLETED ? 'success' : 'active'}
            />
          </div>
        );
      },
    },
    {
      title: t('loans.interestRate'),
      dataIndex: 'interestRate',
      key: 'interestRate',
      width: '10%',
      align: 'center',
      render: (rate: number) => <Tag color="orange">{rate}%</Tag>,
    },
    {
      title: t('loans.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: '12%',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status: LoanStatus) => (
        <Tag color={getStatusColor(status)}>{LoanStatusLabels[status]}</Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: '13%',
      render: (_: unknown, record: ILoan) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewLoan(record.id)}
            title={t('common.view')}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditLoan(record.id)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.id)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div>
      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.activeLoans')}
              value={summary.activeLoans}
              suffix={t('loans.loanUnit')}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.totalRemaining')}
              value={summary.totalRemaining}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.monthlyPayment')}
              value={summary.monthlyPayment}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('loans.totalInterest')}
              value={summary.totalInterest}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#6b7280' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Error Message */}
      {error && (
        <Card
          style={{
            marginBottom: 24,
            borderColor: '#fca5a5',
            backgroundColor: '#fee2e2',
          }}
        >
          <span style={{ color: '#dc2626' }}>❌ {error}</span>
        </Card>
      )}

      {/* Main Table */}
      <Card
        title={t('loans.manageLoans')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateLoan}>
            {t('loans.createNewLoan')}
          </Button>
        }
      >
        <Table<ILoan>
          columns={columns}
          dataSource={loans}
          rowKey="id"
          loading={isLoading}
          bordered
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('loans.noLoans')} />
            ),
          }}
          pagination={{
            total: loans?.length || 0,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => t('common.totalItems', { total }),
          }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('common.confirmDelete')}
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingLoanId(null);
        }}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('loans.deleteConfirmation')}</p>
      </Modal>
    </div>
  );
};

export default LoansListPage;
