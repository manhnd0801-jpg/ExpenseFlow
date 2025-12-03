/**
 * Debts List Page
 */
import { DebtForm, PaymentForm, type IPaymentFormData } from '@/components/molecules';
import { DebtStatus, DebtType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import {
  createDebtPaymentRequest,
  createDebtRequest,
  deleteDebtRequest,
  fetchDebtSummaryRequest,
  fetchDebtsRequest,
  updateDebtRequest,
} from '@/redux/modules/debts';
import type { IDebt } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  BankOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Modal, Row, Space, Statistic, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';

const { TabPane } = Tabs;

const DebtsListPage: React.FC = () => {
  const { t, getDebtStatusLabel } = useI18n();
  const dispatch = useAppDispatch();
  const debts = useAppSelector((state) => state.debts.debts);
  const isLoading = useAppSelector((state) => state.debts.loading);
  // Debts loaded from Redux store

  const [activeTab, setActiveTab] = useState('1');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDebtFormVisible, setIsDebtFormVisible] = useState(false);
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
  const [editingDebt, setEditingDebt] = useState<IDebt | undefined>(undefined);
  const [paymentDebt, setPaymentDebt] = useState<IDebt | undefined>(undefined);

  // Load debts and summary on mount
  useEffect(() => {
    dispatch(fetchDebtsRequest());
    dispatch(fetchDebtSummaryRequest());
  }, [dispatch]);

  // Filter debts by type
  const lending = useMemo(() => debts?.filter((debt) => debt.type === DebtType.LENDING), [debts]);
  const borrowing = useMemo(
    () => debts?.filter((debt) => debt.type === DebtType.BORROWING),
    [debts]
  );

  const handleEdit = (debt: IDebt) => {
    setEditingDebt(debt);
    setIsDebtFormVisible(true);
  };

  const handleCreateLending = () => {
    setEditingDebt(undefined);
    setIsDebtFormVisible(true);
  };

  const handleCreateBorrowing = () => {
    setEditingDebt(undefined);
    setIsDebtFormVisible(true);
  };

  const handleDebtFormSubmit = (values: any) => {
    if (editingDebt) {
      // Update existing debt
      dispatch(
        updateDebtRequest({
          id: editingDebt.id,
          ...values,
        })
      );
    } else {
      // Create new debt
      dispatch(createDebtRequest(values));
    }
    setIsDebtFormVisible(false);
    setEditingDebt(undefined);
  };

  const handleDebtFormCancel = () => {
    setIsDebtFormVisible(false);
    setEditingDebt(undefined);
  };

  const handleDelete = (debtId: string) => {
    setDeleteId(debtId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      dispatch(deleteDebtRequest(deleteId));
      setIsDeleteModalVisible(false);
      setDeleteId(null);
    }
  };

  const handleView = (debt: IDebt) => {
    // Show debt details in a modal
    Modal.info({
      title: `${debt.type === DebtType.LENDING ? t('debts.lending') : t('debts.borrowing')} - ${
        debt.personName
      }`,
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <strong>{t('debts.personName')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>{debt.personName}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>{t('debts.originalAmount')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>{formatCurrency(debt.originalAmount)}</p>
          </div>

          <div style={{ marginBottom: 12 }}>
            <strong>{t('debts.remainingAmount')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>{formatCurrency(debt.remainingAmount)}</p>
          </div>

          {debt.interestRate && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('debts.interestRate')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{debt.interestRate}%/năm</p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <strong>{t('debts.borrowedDate')}:</strong>
            <p style={{ margin: '8px 0', color: '#666' }}>{formatDate(debt.borrowedDate)}</p>
          </div>

          {debt.dueDate && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('debts.dueDate')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{formatDate(debt.dueDate)}</p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <strong>{t('debts.status')}:</strong>
            <div style={{ margin: '8px 0' }}>{renderStatus(debt.status)}</div>
          </div>

          {debt.description && (
            <div style={{ marginBottom: 12 }}>
              <strong>{t('debts.description')}:</strong>
              <p style={{ margin: '8px 0', color: '#666' }}>{debt.description}</p>
            </div>
          )}
        </div>
      ),
      okText: t('common.close'),
    });
  };

  const handlePayment = (debt: IDebt) => {
    setPaymentDebt(debt);
    setIsPaymentFormVisible(true);
  };

  const handlePaymentSubmit = (data: IPaymentFormData) => {
    if (!paymentDebt) return;

    dispatch(
      createDebtPaymentRequest({
        debtId: paymentDebt.id,
        data: {
          amount: data.amount,
          paymentDate: data.paymentDate,
          accountId: data.accountId,
          principalAmount: data.principalAmount,
          interestAmount: data.interestAmount,
        },
      })
    );

    setIsPaymentFormVisible(false);
    setPaymentDebt(undefined);
  };

  const handlePaymentCancel = () => {
    setIsPaymentFormVisible(false);
    setPaymentDebt(undefined);
  };

  const renderStatus = (status: DebtStatus) => {
    let color = 'blue';
    if (status === DebtStatus.COMPLETED) {
      color = 'green';
    } else if (status === DebtStatus.OVERDUE) {
      color = 'red';
    } else if (status === DebtStatus.PARTIAL_PAID) {
      color = 'orange';
    }

    return <Tag color={color}>{getDebtStatusLabel(status)}</Tag>;
  };

  const columns: ColumnsType<IDebt> = [
    {
      title: t('debts.personName'),
      dataIndex: 'personName',
      key: 'personName',
      render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
    },
    {
      title: t('debts.originalAmount'),
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      render: (amount: number, debt: IDebt) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff' }}>{formatCurrency(amount)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Còn lại: {formatCurrency(debt.remainingAmount)}
          </div>
        </div>
      ),
    },
    {
      title: t('debts.account'),
      dataIndex: 'account',
      key: 'account',
      render: (account: any) => (
        <div>
          {account ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BankOutlined style={{ color: '#1890ff' }} />
              <span>{account.name}</span>
            </div>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>Chưa liên kết</span>
          )}
        </div>
      ),
    },
    {
      title: t('debts.interestRate'),
      dataIndex: 'interestRate',
      key: 'interestRate',
      render: (rate?: number) => (rate ? `${rate}%` : t('debts.interestRateNoInterest')),
    },
    {
      title: t('debts.borrowedDate'),
      dataIndex: 'borrowedDate',
      key: 'borrowedDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: t('debts.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date?: string) => {
        if (!date) return t('debts.dueDateUndetermined');

        const dueDate = new Date(date);
        const now = new Date();
        const isOverdue = dueDate < now;

        return (
          <div style={{ color: isOverdue ? '#f5222d' : 'inherit' }}>
            {formatDate(date)}
            {isOverdue && <div style={{ fontSize: '12px' }}>{t('debts.overdue')}</div>}
          </div>
        );
      },
    },
    {
      title: t('debts.status'),
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: t('debts.actions'),
      key: 'actions',
      render: (_, debt) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(debt)}
            title={t('debts.viewDetail')}
          />
          {debt.remainingAmount > 0 && debt.status !== DebtStatus.COMPLETED && (
            <Button
              type="text"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(debt)}
              title={t('debts.recordPayment')}
              style={{ color: '#52c41a' }}
            />
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(debt)}
            title={t('debts.editDebtAction')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(debt.id)}
            title={t('debts.deleteDebtAction')}
          />
        </Space>
      ),
    },
  ];

  const summary = useAppSelector((state) => state.debts.summary);

  return (
    <div>
      {/* Summary Statistics */}
      {summary && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng nợ hiện tại"
                value={summary.totalDebtAmount}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<WalletOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={summary.totalPaidAmount}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng lãi đã trả"
                value={summary.totalInterestPaid}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title={t('debts.title')}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={t('debts.lending')} key="1">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateLending}>
                {t('debts.createLending')}
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              dataSource={lending}
              rowKey="id"
              loading={isLoading}
              locale={{
                emptyText: isLoading ? t('common.loading') : t('debts.noLendingDebts'),
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => t('debts.totalLending', { total }),
              }}
            />
          </TabPane>

          <TabPane tab={t('debts.borrowing')} key="2">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateBorrowing}>
                {t('debts.createBorrowing')}
              </Button>
            </div>
            <Table
              bordered
              columns={columns}
              dataSource={borrowing}
              rowKey="id"
              loading={isLoading}
              locale={{
                emptyText: isLoading ? t('common.loading') : t('debts.noBorrowingDebts'),
              }}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => t('debts.totalBorrowing', { total }),
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('debts.confirmDelete')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
        confirmLoading={isLoading}
      >
        <p>{t('debts.confirmDeleteMessage')}</p>
        <p>{t('debts.deleteWarning')}</p>
      </Modal>

      {/* Debt Form Modal */}
      <DebtForm
        visible={isDebtFormVisible}
        onCancel={handleDebtFormCancel}
        onSubmit={handleDebtFormSubmit}
        initialValues={editingDebt}
        loading={isLoading}
      />

      {/* Payment Form Modal */}
      <Modal
        title={`Ghi nhận thanh toán - ${paymentDebt?.personName}`}
        open={isPaymentFormVisible}
        onCancel={handlePaymentCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        {paymentDebt && (
          <PaymentForm debt={paymentDebt} onSubmit={handlePaymentSubmit} loading={isLoading} />
        )}
      </Modal>
    </div>
  );
};

export default DebtsListPage;
