/**
 * Debts List Page
 */
import { DebtStatus, DebtType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useI18n } from '@/hooks/useI18n';
import { deleteDebtRequest, fetchDebtsRequest } from '@/redux/modules/debts';
import { IDebt } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Modal, Space, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';

const { TabPane } = Tabs;

const DebtsListPage: React.FC = () => {
  const { t, getDebtStatusLabel } = useI18n();
  const dispatch = useAppDispatch();
  const debts = useAppSelector((state) => state.debts.debts);
  const isLoading = useAppSelector((state) => state.debts.loading);
  console.log(debts, 'debts');

  const [activeTab, setActiveTab] = useState('1');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load debts on mount
  useEffect(() => {
    dispatch(fetchDebtsRequest());
  }, [dispatch]);

  // Filter debts by type
  const lending = useMemo(() => debts?.filter((debt) => debt.type === DebtType.LENDING), [debts]);
  const borrowing = useMemo(
    () => debts?.filter((debt) => debt.type === DebtType.BORROWING),
    [debts]
  );

  const handleEdit = (debt: IDebt) => {
    console.log('Edit debt:', debt);
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
    console.log('View debt:', debt);
  };

  const handlePayment = (debt: IDebt) => {
    console.log('Make payment for debt:', debt);
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
      title: t('debts.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <div style={{ fontWeight: 500, color: '#1890ff' }}>{formatCurrency(amount)}</div>
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
          {debt.status === DebtStatus.ACTIVE && (
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

  return (
    <div>
      <Card title={t('debts.title')}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={t('debts.lending')} key="1">
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  console.log('Create lending');
                }}
              >
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
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  console.log('Create borrowing');
                }}
              >
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

      <Modal
        title={t('debts.confirmDelete')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('debts.confirmDeleteMessage')}</p>
        <p>{t('debts.deleteWarning')}</p>
      </Modal>
    </div>
  );
};

export default DebtsListPage;
