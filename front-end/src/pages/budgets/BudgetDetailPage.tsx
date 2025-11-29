/**
 * Budget Detail Page
 * Page for viewing budget details, progress, and transactions
 */

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DollarOutlined,
  EditOutlined,
  PercentageOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { deleteBudgetStart } from '@redux/modules/budgets/budgetSlice';
import type { RootState } from '@redux/store';
import { budgetService } from '@services/budgetService';
import { formatCurrency, formatDate } from '@utils/formatters';
import {
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Modal,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { BudgetPeriodLabels } from '../../constants/enum-labels';

const BudgetDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Redux state
  const { loading: deleteLoading } = useSelector((state: RootState) => state.budgets);

  // Load budget data on mount
  useEffect(() => {
    const loadBudget = async () => {
      if (!id) {
        message.error('ID ngân sách không hợp lệ');
        navigate('/budgets');
        return;
      }

      try {
        setLoading(true);
        const budget = await budgetService.getBudgetById(id);
        setBudgetData(budget);
      } catch (error: any) {
        message.error(error.message || 'Không thể tải thông tin ngân sách');
        navigate('/budgets');
      } finally {
        setLoading(false);
      }
    };

    loadBudget();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/budgets/${id}/edit`);
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (id) {
      dispatch(deleteBudgetStart({ id }));
      setDeleteModalVisible(false);
      // Navigate back after delete
      setTimeout(() => {
        navigate('/budgets');
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin ngân sách...</p>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Không tìm thấy ngân sách</p>
        <Button onClick={() => navigate('/budgets')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const spentAmount = budgetData.spentAmount || budgetData.spent || 0;
  const progressPercent = budgetData.amount > 0 ? (spentAmount / budgetData.amount) * 100 : 0;
  const remainingAmount = Math.max(0, budgetData.amount - spentAmount);
  const isOverBudget = spentAmount > budgetData.amount;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/budgets')}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Chi tiết ngân sách</h1>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              Thông tin chi tiết và tiến độ ngân sách
            </p>
          </div>
          <div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              style={{ marginRight: 8 }}
            >
              Chỉnh sửa
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng ngân sách"
              value={budgetData.amount}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã chi tiêu"
              value={spentAmount}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: isOverBudget ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Còn lại"
              value={remainingAmount}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: remainingAmount > 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiến độ"
              value={Math.round(progressPercent)}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: isOverBudget ? '#ff4d4f' : '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Card style={{ marginBottom: 24 }}>
        <h3>Tiến độ ngân sách</h3>
        <Progress
          percent={Math.round(progressPercent)}
          status={isOverBudget ? 'exception' : 'active'}
          strokeColor={isOverBudget ? '#ff4d4f' : progressPercent > 80 ? '#faad14' : '#52c41a'}
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span>Đã sử dụng: {formatCurrency(spentAmount)}</span>
          <span>
            {isOverBudget ? (
              <Tag color="red">
                Vượt ngân sách {formatCurrency(spentAmount - budgetData.amount)}
              </Tag>
            ) : (
              <Tag color="green">Trong ngân sách</Tag>
            )}
          </span>
        </div>
      </Card>

      {/* Budget Information */}
      <Card style={{ marginBottom: 24 }}>
        <h3>Thông tin ngân sách</h3>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Tên ngân sách" span={2}>
            {budgetData.name || 'Chưa đặt tên'}
          </Descriptions.Item>
          <Descriptions.Item label="Danh mục">
            {budgetData.category?.name || budgetData.categoryId || 'Tổng ngân sách'}
          </Descriptions.Item>
          <Descriptions.Item label="Chu kỳ">
            {BudgetPeriodLabels[budgetData.period as keyof typeof BudgetPeriodLabels] ||
              budgetData.period}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {formatDate(budgetData.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">
            {formatDate(budgetData.endDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Tạo lúc" span={2}>
            {formatDate(budgetData.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Related Transactions - Placeholder */}
      <Card>
        <h3>Giao dịch liên quan</h3>
        <Table
          bordered
          columns={[
            {
              title: 'Ngày',
              dataIndex: 'date',
              key: 'date',
              render: (date) => formatDate(date),
            },
            {
              title: 'Mô tả',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: 'Số tiền',
              dataIndex: 'amount',
              key: 'amount',
              render: (amount) => formatCurrency(amount),
            },
          ]}
          dataSource={[]}
          locale={{ emptyText: 'Chưa có giao dịch nào cho ngân sách này' }}
          pagination={false}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa ngân sách"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: deleteLoading }}
      >
        <p>
          Bạn có chắc chắn muốn xóa ngân sách <strong>{budgetData.name}</strong> không?
        </p>
        <p style={{ color: '#ff4d4f' }}>
          Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.
        </p>
      </Modal>
    </div>
  );
};

export default BudgetDetailPage;
