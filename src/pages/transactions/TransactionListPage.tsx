/**
 * Transaction List Page
 * Displays transactions with filters, pagination, and CRUD operations
 */

import { ClearOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import viLocale from 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';

import DashboardLayout from '@/components/templates/DashboardLayout';
import { useAppDispatch, useAppSelector, useDebounce, useNotification } from '@/hooks';
import {
  ICreateTransactionPayload,
  ITransaction,
  ITransactionFilters,
  selectIsTransactionLoading,
  selectTransactionError,
  selectTransactionPagination,
  transactionActions,
  TransactionType,
} from '@/redux/modules/transactions';

dayjs.extend(relativeTime);
dayjs.locale(viLocale);

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
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .filters-card {
    margin-bottom: 24px;
  }

  .filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .actions-row {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .table-wrapper {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const StyledAmountCell = styled.span<{ type: 'INCOME' | 'EXPENSE' }>`
  font-weight: 600;
  color: ${(props) => (props.type === 'INCOME' ? '#10b981' : '#ef4444')};
`;

const TransactionTypeTag = styled(Tag)<{ type: TransactionType }>`
  background-color: ${(props) => (props.type === 'INCOME' ? '#d1fae5' : '#fee2e2')};
  color: ${(props) => (props.type === 'INCOME' ? '#065f46' : '#7f1d1d')};
  border: none;
`;

// ============================================
// MOCK DATA - For demo purposes
// ============================================

const MOCK_TRANSACTIONS: ITransaction[] = [
  {
    id: '1',
    userId: 'user-1',
    categoryId: 'cat-1',
    accountId: 'acc-1',
    type: TransactionType.INCOME,
    amount: 5000000,
    description: 'Lương tháng 11',
    date: dayjs().subtract(5, 'days').toISOString(),
    status: 'COMPLETED' as any,
    createdAt: dayjs().subtract(5, 'days').toISOString(),
    updatedAt: dayjs().subtract(5, 'days').toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    categoryId: 'cat-2',
    accountId: 'acc-1',
    type: TransactionType.EXPENSE,
    amount: 500000,
    description: 'Ăn trưa',
    date: dayjs().subtract(2, 'days').toISOString(),
    status: 'COMPLETED' as any,
    createdAt: dayjs().subtract(2, 'days').toISOString(),
    updatedAt: dayjs().subtract(2, 'days').toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    categoryId: 'cat-3',
    accountId: 'acc-1',
    type: TransactionType.EXPENSE,
    amount: 1500000,
    description: 'Điện nước tháng 11',
    date: dayjs().subtract(1, 'days').toISOString(),
    status: 'COMPLETED' as any,
    createdAt: dayjs().subtract(1, 'days').toISOString(),
    updatedAt: dayjs().subtract(1, 'days').toISOString(),
  },
  {
    id: '4',
    userId: 'user-1',
    categoryId: 'cat-4',
    accountId: 'acc-1',
    type: TransactionType.INCOME,
    amount: 2000000,
    description: 'Freelance project',
    date: dayjs().toISOString(),
    status: 'COMPLETED' as any,
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
  {
    id: '5',
    userId: 'user-1',
    categoryId: 'cat-5',
    accountId: 'acc-1',
    type: TransactionType.EXPENSE,
    amount: 300000,
    description: 'Xăng xe',
    date: dayjs().toISOString(),
    status: 'COMPLETED' as any,
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
];

// ============================================
// COMPONENT
// ============================================

const TransactionListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const notify = useNotification();

  // Redux selectors
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const isLoading = useAppSelector(selectIsTransactionLoading);
  const pagination = useAppSelector(selectTransactionPagination);
  const error = useAppSelector(selectTransactionError);

  // Local states
  const [filters, setFilters] = React.useState<ITransactionFilters>({});
  const [dateRange, setDateRange] = React.useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [searchText, setSearchText] = React.useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<ITransaction | null>(null);
  const [form] = Form.useForm();

  // Debounce search
  const debouncedSearchText = useDebounce(searchText, 500);

  // Use Redux data (fallback to mock if empty)
  const displayTransactions = useMemo(() => {
    let result = transactions.length > 0 ? transactions : MOCK_TRANSACTIONS;

    // Filter by search text
    if (debouncedSearchText) {
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
          t.id.toLowerCase().includes(debouncedSearchText.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter((t) => {
        const transDate = dayjs(t.date);
        return (
          transDate.isAfter(dateRange[0]?.startOf('day')) &&
          transDate.isBefore(dateRange[1]?.endOf('day'))
        );
      });
    }

    // Filter by type
    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }

    return result;
  }, [debouncedSearchText, dateRange, filters]);

  // Load transactions on mount
  useEffect(() => {
    dispatch(transactionActions.listTransactionsRequest(filters));
  }, []);

  // Handle filters
  const handleFilterChange = (newFilters: ITransactionFilters) => {
    setFilters(newFilters);
    dispatch(transactionActions.listTransactionsRequest(newFilters));
  };

  const handleClearFilters = () => {
    setFilters({});
    setDateRange(null);
    setSearchText('');
    dispatch(transactionActions.clearTransactionFilters());
  };

  // Handle create transaction
  const handleCreateTransaction = async (values: any) => {
    try {
      const payload: ICreateTransactionPayload = {
        categoryId: values.categoryId,
        accountId: values.accountId,
        type: values.type,
        amount: values.amount,
        description: values.description,
        date: values.date?.toISOString() || new Date().toISOString(),
        notes: values.notes,
      };
      dispatch(transactionActions.createTransactionRequest(payload));
      setIsCreateModalVisible(false);
      form.resetFields();
      notify.success('Tạo giao dịch thành công!');
    } catch (err) {
      notify.error('Lỗi khi tạo giao dịch');
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (record: ITransaction) => {
    setEditingTransaction(record);
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date),
    });
    setIsEditModalVisible(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id: string) => {
    dispatch(transactionActions.deleteTransactionRequest({ id }));
    notify.success('Xóa giao dịch thành công!');
  };

  // Table columns
  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      width: 120,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: TransactionType) => (
        <TransactionTypeTag type={type}>
          {type === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
        </TransactionTypeTag>
      ),
      width: 100,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: ITransaction) => (
        <StyledAmountCell type={record.type}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
        </StyledAmountCell>
      ),
      width: 120,
      align: 'right' as const,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_: any, record: ITransaction) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditTransaction(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa giao dịch?"
            description="Bạn có chắc muốn xóa giao dịch này không?"
            onConfirm={() => handleDeleteTransaction(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} danger title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <StyledPageWrapper>
        {/* Page Header */}
        <div className="page-header">
          <h1>Quản lý giao dịch</h1>
          <p>Xem, thêm, sửa, xóa các giao dịch của bạn</p>
        </div>

        {/* Filters */}
        <Card className="filters-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={6}>
              <Input
                placeholder="Tìm kiếm mô tả..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Select
                placeholder="Loại giao dịch"
                allowClear
                onChange={(value) => handleFilterChange({ ...filters, type: value })}
                options={[
                  { label: 'Thu nhập', value: TransactionType.INCOME },
                  { label: 'Chi tiêu', value: TransactionType.EXPENSE },
                ]}
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button icon={<ClearOutlined />} onClick={handleClearFilters} title="Xóa bộ lọc">
                  Xóa
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setIsCreateModalVisible(true);
                  }}
                >
                  Thêm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Error Message */}
        {error && (
          <Card style={{ marginBottom: 24, borderColor: '#fca5a5', backgroundColor: '#fee2e2' }}>
            <span style={{ color: '#dc2626' }}>❌ {error}</span>
          </Card>
        )}

        {/* Transactions Table */}
        <div className="table-wrapper">
          {displayTransactions.length === 0 ? (
            <Empty description="Không có giao dịch nào" style={{ padding: '50px 20px' }} />
          ) : (
            <Table
              columns={columns}
              dataSource={displayTransactions}
              rowKey="id"
              loading={isLoading}
              pagination={{
                current: pagination.page,
                pageSize: pagination.pageSize,
                total: displayTransactions.length,
                onChange: (page, pageSize) => {
                  dispatch(transactionActions.setTransactionPage(page));
                  dispatch(transactionActions.setTransactionPageSize(pageSize));
                },
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} giao dịch`,
              }}
              scroll={{ x: 800 }}
            />
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          title={editingTransaction ? 'Sửa giao dịch' : 'Tạo giao dịch mới'}
          open={isCreateModalVisible || isEditModalVisible}
          onOk={() => form.submit()}
          onCancel={() => {
            setIsCreateModalVisible(false);
            setIsEditModalVisible(false);
            setEditingTransaction(null);
            form.resetFields();
          }}
          okText={editingTransaction ? 'Cập nhật' : 'Tạo'}
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTransaction}
            style={{ marginTop: 16 }}
          >
            <Form.Item
              label="Loại giao dịch"
              name="type"
              rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch' }]}
            >
              <Select
                placeholder="Chọn loại giao dịch"
                options={[
                  { label: 'Thu nhập', value: TransactionType.INCOME },
                  { label: 'Chi tiêu', value: TransactionType.EXPENSE },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select
                placeholder="Chọn danh mục"
                options={[
                  { label: 'Lương', value: 'cat-1' },
                  { label: 'Ăn uống', value: 'cat-2' },
                  { label: 'Điện nước', value: 'cat-3' },
                  { label: 'Freelance', value: 'cat-4' },
                  { label: 'Xăng xe', value: 'cat-5' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Tài khoản"
              name="accountId"
              rules={[{ required: true, message: 'Vui lòng chọn tài khoản' }]}
            >
              <Select
                placeholder="Chọn tài khoản"
                options={[
                  { label: 'Ngân hàng A', value: 'acc-1' },
                  { label: 'Tiền mặt', value: 'acc-2' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Số tiền"
              name="amount"
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền' },
                { pattern: /^\d+$/, message: 'Số tiền phải là số dương' },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="Nhập số tiền"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <Input placeholder="Nhập mô tả giao dịch" />
            </Form.Item>

            <Form.Item
              label="Ngày"
              name="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea placeholder="Ghi chú thêm (không bắt buộc)" rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </StyledPageWrapper>
    </DashboardLayout>
  );
};

export default TransactionListPage;
