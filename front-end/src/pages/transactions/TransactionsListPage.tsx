/**
 * Transactions Page
 * Manages transaction list with CRUD operations
 */

import { TransactionForm } from '@/components/organisms/TransactionForm';
import { TransactionType } from '@/constants/enums';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useI18n } from '@hooks/useI18n';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { transactionActions } from '@redux/modules/transactions';
import type { ITransaction } from '@redux/modules/transactions/transactionTypes';
import { Button, Card, Col, Empty, Input, Modal, Row, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

/**
 * Transactions Page Component
 */
export const TransactionsPage: React.FC = () => {
  const { t, getTransactionTypeLabel } = useI18n();
  const dispatch = useAppDispatch();

  // Redux state
  const transactions = useAppSelector((state) => state.transactions.transactions) || [];
  const pagination = useAppSelector((state) => state.transactions.pagination);
  const isLoading = useAppSelector((state) => state.transactions.isLoading);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | undefined>();
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | undefined>();

  // Load transactions on mount
  useEffect(() => {
    dispatch(
      transactionActions.listTransactionsRequest({
        page: 1,
        limit: 10,
      })
    );
  }, [dispatch]);

  // Handle search/filter
  const handleSearch = () => {
    dispatch(
      transactionActions.listTransactionsRequest({
        page: 1,
        limit: pagination.limit,
        search: searchText || undefined,
        type: filterType,
      })
    );
  };

  // Handle pagination change
  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(
      transactionActions.listTransactionsRequest({
        page,
        limit: pageSize,
        search: searchText || undefined,
        type: filterType,
      })
    );
  };

  // Handle create new
  const handleCreate = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (record: ITransaction) => {
    setEditingTransaction(record);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: t('transactions.deleteTransaction'),
      content: t('transactions.deleteConfirmation'),
      okText: t('common.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: () => {
        dispatch(transactionActions.deleteTransactionRequest({ id }));
      },
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
  };

  // Handle form success
  const handleFormSuccess = () => {
    handleModalClose();
    // Reload transactions
    dispatch(
      transactionActions.listTransactionsRequest({
        page: pagination.page,
        limit: pagination.limit,
        search: searchText || undefined,
        type: filterType,
      })
    );
  };

  // Table columns
  const columns: ColumnsType<ITransaction> = [
    {
      title: t('transactions.date'),
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD-MM-YYYY HH:mm'),
    },
    {
      title: t('transactions.account'),
      dataIndex: 'account',
      key: 'account',
      width: 130,
      render: (account: any) => (account?.name ? account.name : '-'),
    },
    {
      title: t('transactions.category'),
      dataIndex: 'category',
      key: 'category',
      width: 180,
      render: (category: any, record: ITransaction) => {
        // For TRANSFER type, show destination account instead of category
        if (record.type === TransactionType.TRANSFER) {
          return record.toAccount ? (
            <Space>
              <span>→ {record.toAccount.name}</span>
            </Space>
          ) : (
            <span>Transfer</span>
          );
        }

        return category ? (
          <Space>
            {category.icon && <span style={{ color: category.color }}>{category.icon}</span>}
            <span>{category.name}</span>
          </Space>
        ) : (
          '-'
        );
      },
    },
    {
      title: t('transactions.type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: TransactionType) => {
        let color = 'blue';
        if (type === TransactionType.INCOME) color = 'green';
        else if (type === TransactionType.EXPENSE) color = 'red';
        else if (type === TransactionType.TRANSFER) color = 'orange';

        return <Tag color={color}>{getTransactionTypeLabel(type)}</Tag>;
      },
    },
    {
      title: t('transactions.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number, record: ITransaction) => {
        let color = '#1890ff'; // blue for transfer
        let prefix = '';

        if (record.type === TransactionType.INCOME) {
          color = '#52c41a'; // green
          prefix = '+';
        } else if (record.type === TransactionType.EXPENSE) {
          color = '#ff4d4f'; // red
          prefix = '-';
        } else if (record.type === TransactionType.TRANSFER) {
          color = '#fa8c16'; // orange
          prefix = '→'; // arrow for transfer
        }

        return (
          <span style={{ color, fontWeight: 500 }}>
            {prefix}{' '}
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(amount)}
          </span>
        );
      },
    },
    {
      title: t('transactions.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_: any, record: ITransaction) => (
        <Space>
          {/* Don't allow editing TRANSFER transactions */}
          {record.type !== TransactionType.TRANSFER && (
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              title={t('common.edit')}
            />
          )}
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('transactions.manageTransactions')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('transactions.addTransaction')}
          </Button>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder={t('transactions.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              placeholder={t('transactions.transactionType')}
              style={{ width: '100%' }}
              value={filterType}
              onChange={setFilterType}
              allowClear
            >
              <Select.Option value={TransactionType.INCOME}>
                {getTransactionTypeLabel(TransactionType.INCOME)}
              </Select.Option>
              <Select.Option value={TransactionType.EXPENSE}>
                {getTransactionTypeLabel(TransactionType.EXPENSE)}
              </Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Button type="primary" onClick={handleSearch} block>
              {t('common.search')}
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          bordered
          dataSource={transactions}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('transactions.totalTransactions', { total }),
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          locale={{
            emptyText: <Empty description={t('transactions.noTransactions')} />,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingTransaction
            ? t('transactions.editTransaction')
            : t('transactions.addNewTransaction')
        }
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <TransactionForm
          initialValues={editingTransaction}
          onSuccess={handleFormSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};
