/**
 * Goal Form Component
 * For creating and editing financial goals
 */
import {
  CalendarOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RocketOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Row,
  Tag,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GoalType } from '../../../constants/enums';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const { TextArea } = Input;
// const { Option } = Select; // Unused - commented out

interface IGoal {
  id?: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  type: number;
  status?: number;
  priority: number;
  isActive: boolean;
  milestones?: IMilestone[];
}

interface IMilestone {
  id?: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
}

interface IGoalFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: IGoal) => void;
  initialValues?: Partial<IGoal>;
  loading?: boolean;
}

const FormWrapper = styled.div`
  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #262626;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .goal-overview {
    background: linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #87e8de;

    .goal-stats {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
      text-align: center;

      .stat-item {
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #13c2c2;
        }

        .stat-label {
          font-size: 12px;
          color: #5a6c7d;
          margin-top: 4px;
        }
      }
    }

    .goal-progress {
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;

        .current-amount {
          color: #13c2c2;
          font-weight: 600;
        }

        .target-amount {
          color: #52c41a;
          font-weight: 600;
        }
      }
    }
  }

  .goal-type-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;

    .type-card {
      padding: 16px 12px;
      border: 2px solid #f0f0f0;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: #fafafa;

      &:hover {
        border-color: #40a9ff;
        background: #f0f8ff;
      }

      &.selected {
        border-color: #13c2c2;
        background: #e6fffb;
        color: #13c2c2;
      }

      .type-icon {
        font-size: 28px;
        margin-bottom: 8px;
        display: block;
      }

      .type-name {
        font-size: 14px;
        font-weight: 500;
      }

      .type-description {
        font-size: 11px;
        color: #8c8c8c;
        margin-top: 4px;
      }
    }
  }

  .priority-selector {
    .ant-radio-group {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .ant-radio-button-wrapper {
      text-align: center;
      height: 40px;
      line-height: 38px;
      border-radius: 6px;

      &.priority-high {
        border-color: #ff7875;
        color: #ff7875;

        &.ant-radio-button-wrapper-checked {
          background: #ff7875;
          border-color: #ff7875;
        }
      }

      &.priority-medium {
        border-color: #ffc069;
        color: #ffc069;

        &.ant-radio-button-wrapper-checked {
          background: #ffc069;
          border-color: #ffc069;
        }
      }

      &.priority-low {
        border-color: #95de64;
        color: #95de64;

        &.ant-radio-button-wrapper-checked {
          background: #95de64;
          border-color: #95de64;
        }
      }
    }
  }

  .milestones-section {
    .milestone-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fafafa;
      border-radius: 6px;
      margin-bottom: 8px;

      .milestone-info {
        flex: 1;

        .milestone-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .milestone-details {
          font-size: 12px;
          color: #8c8c8c;
        }
      }

      .milestone-status {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
`;

export const GoalForm: React.FC<IGoalFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [goalType, setGoalType] = useState<number>(GoalType.SAVING);
  const [priority, setPriority] = useState<number>(2); // Medium priority

  const currentAmount = initialValues?.currentAmount || 0;
  const progressPercent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  // const remainingAmount = Math.max(0, targetAmount - currentAmount); // Unused but kept for reference

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        targetDate: initialValues.targetDate
          ? dayjs(initialValues.targetDate)
          : dayjs().add(1, 'year'),
      });
      setTargetAmount(initialValues.targetAmount || 0);
      setGoalType(initialValues.type || GoalType.SAVING);
      setPriority(initialValues.priority || 2);
    } else {
      form.resetFields();
      form.setFieldsValue({
        targetDate: dayjs().add(1, 'year'),
        isActive: true,
      });
      setTargetAmount(0);
      setGoalType(GoalType.SAVING);
      setPriority(2);
    }
  }, [initialValues, form, visible]);

  const handleGoalTypeSelect = (type: number) => {
    setGoalType(type);
    form.setFieldsValue({ type });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        targetAmount,
        type: goalType,
        priority,
        targetDate: values.targetDate.toISOString(),
      };
      onSubmit(formattedValues);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const getGoalTypeInfo = (type: number) => {
    switch (type) {
      case GoalType.SAVING:
        return { icon: '💰', name: 'Tiết kiệm', description: 'Tích lũy tiền cho tương lai' };
      case GoalType.PURCHASE:
        return { icon: '🛍️', name: 'Mua sắm', description: 'Tiết kiệm để mua một món đồ' };
      case GoalType.INVESTMENT:
        return { icon: '📈', name: 'Đầu tư', description: 'Mục tiêu đầu tư tài chính' };
      case GoalType.DEBT_PAYOFF:
        return { icon: '💳', name: 'Trả nợ', description: 'Thanh toán khoản nợ' };
      case GoalType.EMERGENCY:
        return { icon: '🚨', name: 'Khẩn cấp', description: 'Quỹ dự phòng khẩn cấp' };
      default:
        return { icon: '🎯', name: 'Khác', description: 'Mục tiêu tài chính khác' };
    }
  };

  const goalTypes = [
    GoalType.SAVING,
    GoalType.PURCHASE,
    GoalType.INVESTMENT,
    GoalType.DEBT_PAYOFF,
    GoalType.EMERGENCY,
    GoalType.OTHER,
  ];

  // Helper function for priority text (currently unused but kept for reference)
  // const getPriorityText = (priorityValue: number) => {
  //   switch (priorityValue) {
  //     case 1:
  //       return 'Thấp';
  //     case 2:
  //       return 'Trung bình';
  //     case 3:
  //       return 'Cao';
  //     default:
  //       return 'Trung bình';
  //   }
  // };

  // Calculate time remaining
  const targetDate = form.getFieldValue('targetDate') || dayjs().add(1, 'year');
  const daysRemaining = targetDate.diff(dayjs(), 'days');
  const monthsRemaining = Math.round(daysRemaining / 30);

  return (
    <Modal
      title={initialValues?.id ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu mới'}
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={null}
      destroyOnClose
    >
      <FormWrapper>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Goal Overview (for edit mode) */}
          {initialValues?.id && (
            <div className="goal-overview">
              <div className="goal-stats">
                <div className="stat-item">
                  <div className="stat-value">{formatCurrency(currentAmount)}</div>
                  <div className="stat-label">Hiện tại</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{Math.round(progressPercent)}%</div>
                  <div className="stat-label">Tiến độ</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {monthsRemaining > 0 ? `${monthsRemaining} tháng` : 'Quá hạn'}
                  </div>
                  <div className="stat-label">Thời gian còn lại</div>
                </div>
              </div>
              <div className="goal-progress">
                <div className="progress-info">
                  <span>
                    Hiện tại:{' '}
                    <span className="current-amount">{formatCurrency(currentAmount)}</span>
                  </span>
                  <span>
                    Mục tiêu: <span className="target-amount">{formatCurrency(targetAmount)}</span>
                  </span>
                </div>
                <Progress
                  percent={Math.round(progressPercent)}
                  status={progressPercent >= 100 ? 'success' : 'normal'}
                  strokeColor={{
                    '0%': '#13c2c2',
                    '100%': '#52c41a',
                  }}
                />
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="form-section">
            <div className="section-title">
              <TrophyOutlined />
              Thông tin cơ bản
            </div>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Tên mục tiêu"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu' }]}
                >
                  <Input placeholder="VD: Tiết kiệm mua nhà" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả (tùy chọn)" name="description">
              <TextArea placeholder="Mô tả chi tiết về mục tiêu này..." rows={3} maxLength={300} />
            </Form.Item>
          </div>

          {/* Goal Type Selection */}
          <div className="form-section">
            <div className="section-title">Loại mục tiêu</div>
            <Form.Item name="type">
              <div className="goal-type-selector">
                {goalTypes.map((type) => {
                  const typeInfo = getGoalTypeInfo(type);
                  return (
                    <div
                      key={type}
                      className={`type-card ${goalType === type ? 'selected' : ''}`}
                      onClick={() => handleGoalTypeSelect(type)}
                    >
                      <span className="type-icon">{typeInfo.icon}</span>
                      <div className="type-name">{typeInfo.name}</div>
                      <div className="type-description">{typeInfo.description}</div>
                    </div>
                  );
                })}
              </div>
            </Form.Item>
          </div>

          {/* Target Amount */}
          <div className="form-section">
            <div className="section-title">
              <DollarOutlined />
              Số tiền mục tiêu
            </div>
            <Form.Item
              label={`Số tiền bạn muốn ${goalType === GoalType.DEBT_PAYOFF ? 'trả' : 'tiết kiệm'}`}
              required
            >
              <InputNumber
                value={targetAmount}
                onChange={(value) => setTargetAmount(value || 0)}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => {
                  const parsed = value?.replace(/\$\s?|(,*)/g, '');
                  return parsed ? Number(parsed) : 0;
                }}
                placeholder="Nhập số tiền"
                size="large"
                min={1000}
              />
            </Form.Item>
          </div>

          {/* Target Date & Priority */}
          <Row gutter={16}>
            <Col span={12}>
              <div className="section-title">
                <CalendarOutlined />
                Thời hạn
              </div>
              <Form.Item
                label="Ngày hoàn thành mục tiêu"
                name="targetDate"
                rules={[{ required: true, message: 'Vui lòng chọn thời hạn' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  size="large"
                  disabledDate={(current) => current && current < dayjs()}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div className="section-title">
                <RocketOutlined />
                Độ ưu tiên
              </div>
              <Form.Item label="Mức độ quan trọng" name="priority">
                <Radio.Group
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="priority-selector"
                >
                  <Radio.Button value={1} className="priority-low">
                    Thấp
                  </Radio.Button>
                  <Radio.Button value={2} className="priority-medium">
                    Trung bình
                  </Radio.Button>
                  <Radio.Button value={3} className="priority-high">
                    Cao
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* Milestones (for existing goals) */}
          {initialValues?.id && initialValues.milestones && initialValues.milestones.length > 0 && (
            <div className="form-section">
              <Card title="Các cột mốc" size="small">
                <div className="milestones-section">
                  {initialValues.milestones.map((milestone, index) => (
                    <div key={index} className="milestone-item">
                      <div className="milestone-info">
                        <div className="milestone-name">{milestone.name}</div>
                        <div className="milestone-details">
                          {formatCurrency(milestone.targetAmount)} -{' '}
                          {formatDate(milestone.targetDate)}
                        </div>
                      </div>
                      <div className="milestone-status">
                        {milestone.isCompleted ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            Hoàn thành
                          </Tag>
                        ) : (
                          <Tag color="processing">Đang thực hiện</Tag>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          <Divider />

          {/* Action Buttons */}
          <Row gutter={12}>
            <Col span={12}>
              <Button block size="large" onClick={onCancel}>
                Hủy
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block size="large" loading={loading} onClick={handleSubmit}>
                {initialValues?.id ? 'Cập nhật mục tiêu' : 'Tạo mục tiêu'}
              </Button>
            </Col>
          </Row>
        </Form>
      </FormWrapper>
    </Modal>
  );
};

export default GoalForm;
