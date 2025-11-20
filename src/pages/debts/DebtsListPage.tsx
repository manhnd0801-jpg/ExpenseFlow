/**
 * Debts List Page
 */
import {
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Modal, Space, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { DebtStatusLabels } from '../../constants/enum-labels';
import { DebtStatus, DebtType } from '../../constants/enums';
import { useAppDispatch } from '../../hooks/useRedux';
import type { IDebt } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { TabPane } = Tabs;

const DebtsListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  // const { debts, loading } = useAppSelector((state) => state.debts);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('1'); // 1: Lending, 2: Borrowing

  // Mock data for now
  const mockDebts: IDebt[] = [
    {
      id: '1',
      userId: 'user1',
      type: DebtType.LENDING,
      personName: 'Nguyễn Văn A',
      amount: 5000000,
      interestRate: 5,
      borrowedDate: '2024-01-15',
      dueDate: '2024-12-15',
      status: DebtStatus.ACTIVE,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      userId: 'user1',
      type: DebtType.BORROWING,
      personName: 'Ngân hàng ABC',
      amount: 50000000,
      interestRate: 12,
      borrowedDate: '2023-06-01',
      dueDate: '2025-06-01',
      status: DebtStatus.ACTIVE,
      createdAt: '2023-06-01',
      updatedAt: '2024-01-01',
    },
  ];

  const lending = mockDebts.filter((debt) => debt.type === DebtType.LENDING);
  const borrowing = mockDebts.filter((debt) => debt.type === DebtType.BORROWING);

  const handleEdit = (debt: IDebt) => {
    console.log('Edit debt:', debt);
  };

  const handleDelete = (debtId: string) => {
    setSelectedDebtId(debtId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDebtId) {
      // dispatch(deleteDebtStart({ id: selectedDebtId }));
      setIsDeleteModalVisible(false);
      setSelectedDebtId(null);
    }
  };

  const handleView = (debt: IDebt) => {
    console.log('View debt:', debt);
  };

  const handlePayment = (debt: IDebt) => {
    console.log('Make payment for debt:', debt);
  };

  const renderStatus = (status: number) => {
    let color = 'blue';
    if (status === DebtStatus.COMPLETED) {
      color = 'green';
    } else if (status === DebtStatus.OVERDUE) {
      color = 'red';
    } else if (status === DebtStatus.PARTIAL_PAID) {
      color = 'orange';
    }

    return <Tag color={color}>{DebtStatusLabels[status]}</Tag>;
  };

  const columns: ColumnsType<IDebt> = [
    {
      title: 'Người liên quan',
      dataIndex: 'personName',
      key: 'personName',
      render: (name: string) => <div style={{ fontWeight: 500 }}>{name}</div>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <div style={{ fontWeight: 500, color: '#1890ff' }}>{formatCurrency(amount)}</div>
      ),
    },
    {
      title: 'Lãi suất (%/năm)',
      dataIndex: 'interestRate',
      key: 'interestRate',
      render: (rate?: number) => (rate ? `${rate}%` : 'Không lãi'),
    },
    {
      title: 'Ngày vay',
      dataIndex: 'borrowedDate',
      key: 'borrowedDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Hạn trả',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date?: string) => {
        if (!date) return 'Không xác định';

        const dueDate = new Date(date);
        const now = new Date();
        const isOverdue = dueDate < now;

        return (
          <div style={{ color: isOverdue ? '#f5222d' : 'inherit' }}>
            {formatDate(date)}
            {isOverdue && <div style={{ fontSize: '12px' }}>Quá hạn</div>}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, debt) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(debt)}
            title="Xem chi tiết"
          />
          {debt.status === DebtStatus.ACTIVE && (
            <Button
              type="text"
              icon={<DollarOutlined />}
              onClick={() => handlePayment(debt)}
              title="Ghi nhận thanh toán"
              style={{ color: '#52c41a' }}
            />
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(debt)}
            title="Chỉnh sửa"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(debt.id)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Quản lý Công nợ">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Cho vay" key="1">
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  console.log('Create lending');
                }}
              >
                Tạo khoản cho vay
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={lending}
              rowKey="id"
              loading={false}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng ${total} khoản cho vay`,
              }}
            />
          </TabPane>

          <TabPane tab="Đi vay" key="2">
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  console.log('Create borrowing');
                }}
              >
                Tạo khoản đi vay
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={borrowing}
              rowKey="id"
              loading={false}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng ${total} khoản đi vay`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa công nợ này không?</p>
        <p>Hành động này không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};

export default DebtsListPage;
