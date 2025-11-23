/**
 * Debts List Page
 */
import { DebtStatusLabels } from '@/constants/enum-labels';
import { DebtStatus, DebtType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@/hooks';
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
  const dispatch = useAppDispatch();
  const debts = useAppSelector((state) => state.debts.debts);
  const isLoading = useAppSelector((state) => state.debts.loading);

  const [activeTab, setActiveTab] = useState('1');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load debts on mount
  useEffect(() => {
    dispatch(fetchDebtsRequest());
  }, [dispatch]);

  // Filter debts by type
  const lending = useMemo(() => debts.filter((debt) => debt.type === DebtType.LENDING), [debts]);
  const borrowing = useMemo(
    () => debts.filter((debt) => debt.type === DebtType.BORROWING),
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

    return <Tag color={color}>{DebtStatusLabels[status as keyof typeof DebtStatusLabels]}</Tag>;
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
              loading={isLoading}
              locale={{
                emptyText: isLoading ? 'Đang tải...' : 'Chưa có khoản cho vay nào',
              }}
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
              loading={isLoading}
              locale={{
                emptyText: isLoading ? 'Đang tải...' : 'Chưa có khoản đi vay nào',
              }}
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
