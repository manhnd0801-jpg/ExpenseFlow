/**
 * Transactions Page
 * Manages transaction list with CRUD operations
 */

import { TransactionForm } from '@/components/organisms/TransactionForm';
import { TransactionTypeLabels } from '@/constants/enum-labels';
import { TransactionType } from '@/constants/enums';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { transactionActions } from '@redux/modules/transactions';
import type { ITransaction } from '@redux/modules/transactions/transactionTypes';
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Title } = Typography;

/**
 * Transactions Page Component
 */
export const TransactionsPage: React.FC = () => {
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
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc muốn xóa giao dịch này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
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
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: true,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) =>
        category ? (
          <Space>
            {category.icon && <span style={{ color: category.color }}>{category.icon}</span>}
            <span>{category.name}</span>
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'account',
      key: 'account',
      render: (account: any) => account?.name || '-',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: TransactionType) => {
        const color = type === TransactionType.INCOME ? 'green' : 'red';
        return <Tag color={color}>{TransactionTypeLabels[type]}</Tag>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number, record: ITransaction) => {
        const color = record.type === TransactionType.INCOME ? '#52c41a' : '#ff4d4f';
        const prefix = record.type === TransactionType.INCOME ? '+' : '-';
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
      sorter: true,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: ITransaction) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Quản lý giao dịch
              </Title>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Thêm giao dịch
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={16}>
            <Col xs={24} sm={12} md={10}>
              <Input
                placeholder="Tìm kiếm theo mô tả, ghi chú..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={12} sm={6} md={6}>
              <Select
                placeholder="Loại giao dịch"
                style={{ width: '100%' }}
                value={filterType}
                onChange={setFilterType}
                allowClear
              >
                <Select.Option value={TransactionType.INCOME}>
                  {TransactionTypeLabels[TransactionType.INCOME]}
                </Select.Option>
                <Select.Option value={TransactionType.EXPENSE}>
                  {TransactionTypeLabels[TransactionType.EXPENSE]}
                </Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Button type="primary" onClick={handleSearch} block>
                Tìm kiếm
              </Button>
            </Col>
          </Row>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            scroll={{ x: 1000 }}
          />

          {/* Pagination */}
          <Row justify="end">
            <Pagination
              current={pagination.page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showTotal={(total) => `Tổng ${total} giao dịch`}
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </Row>
        </Space>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingTransaction ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
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
