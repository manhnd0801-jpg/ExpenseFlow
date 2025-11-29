/**
 * Goal Detail Modal Component
 * Professional modal for displaying goal details
 */
import { useI18n } from '@/hooks/useI18n';
import { CalendarOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import { Modal, Progress, Tag, Typography } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { GoalStatus } from '../../../constants/enums';
import type { IGoal } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const { Title, Text } = Typography;

interface IGoalDetailModalProps {
  visible: boolean;
  goal: IGoal | null;
  onClose: () => void;
}

const DetailModalWrapper = styled.div`
  .goal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .goal-icon {
      font-size: 32px;
      color: #1890ff;
    }

    .goal-info {
      flex: 1;

      .goal-name {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }

      .goal-meta {
        margin: 4px 0 0 0;
        color: #6b7280;
        font-size: 14px;
      }
    }

    .goal-status {
      .ant-tag {
        margin: 0;
        padding: 4px 12px;
        font-weight: 500;
      }
    }
  }

  .progress-section {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    border: 1px solid #bae6fd;

    .progress-title {
      font-size: 16px;
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-stats {
      margin-bottom: 16px;
    }

    .progress-bar {
      .ant-progress-text {
        font-weight: 600;
        color: #0369a1;
      }
    }

    .amount-breakdown {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-top: 16px;

      .amount-item {
        text-align: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
        border: 1px solid #e0f2fe;

        .amount-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          display: block;
        }

        .amount-value {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }

        &.current {
          border-color: #22c55e;
          .amount-value {
            color: #22c55e;
          }
        }

        &.target {
          border-color: #3b82f6;
          .amount-value {
            color: #3b82f6;
          }
        }

        &.remaining {
          border-color: #f97316;
          .amount-value {
            color: #f97316;
          }
        }
      }
    }
  }

  .details-section {
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        font-weight: 500;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 8px;

        .anticon {
          color: #6b7280;
        }
      }

      .detail-value {
        color: #1f2937;
        font-weight: 500;
      }
    }
  }

  .description-section {
    margin-top: 20px;

    .description-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .description-content {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      color: #6b7280;
      font-style: italic;
      text-align: center;

      &.has-content {
        background: #fff;
        color: #374151;
        font-style: normal;
        text-align: left;
        line-height: 1.6;
      }
    }
  }
`;

export const GoalDetailModal: React.FC<IGoalDetailModalProps> = ({ visible, goal, onClose }) => {
  const { t, getGoalStatusLabel } = useI18n();

  if (!goal) return null;

  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isCompleted = goal.status === GoalStatus.COMPLETED;
  const isCancelled = goal.status === GoalStatus.CANCELLED;

  const progressStatus = isCompleted ? 'success' : isCancelled ? 'exception' : 'active';

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return 'success';
      case GoalStatus.CANCELLED:
        return 'error';
      default:
        return 'processing';
    }
  };

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const isOverdue = deadlineDate < now && !isCompleted;

    return {
      formatted: formatDate(deadline),
      isOverdue,
      color: isOverdue ? '#ef4444' : '#6b7280',
    };
  };

  const deadlineInfo = formatDeadline(goal.deadline);

  return (
    <Modal title={null} open={visible} onCancel={onClose} footer={null} width={680} centered>
      <DetailModalWrapper>
        {/* Goal Header */}
        <div className="goal-header">
          <div className="goal-icon">
            <TrophyOutlined />
          </div>
          <div className="goal-info">
            <Title level={4} className="goal-name">
              {goal.name}
            </Title>
            <Text className="goal-meta">
              {t('goals.created')}: {formatDate(goal.createdAt)}
            </Text>
          </div>
          <div className="goal-status">
            <Tag color={getStatusColor(goal.status)}>{getGoalStatusLabel(goal.status)}</Tag>
          </div>
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-title">
            <DollarOutlined />
            {t('goals.progress')}
          </div>

          <div className="progress-bar">
            <Progress
              percent={percentage}
              status={progressStatus}
              strokeWidth={12}
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
          </div>

          <div className="amount-breakdown">
            <div className="amount-item current">
              <span className="amount-label">{t('goals.currentAmount')}</span>
              <div className="amount-value">{formatCurrency(goal.currentAmount)}</div>
            </div>
            <div className="amount-item target">
              <span className="amount-label">{t('goals.targetAmount')}</span>
              <div className="amount-value">{formatCurrency(goal.targetAmount)}</div>
            </div>
            <div className="amount-item remaining">
              <span className="amount-label">{t('goals.remainingAmount')}</span>
              <div className="amount-value">{formatCurrency(remainingAmount)}</div>
            </div>
          </div>
        </div>

        {/* Goal Details */}
        <div className="details-section">
          <div className="detail-row">
            <div className="detail-label">
              <CalendarOutlined />
              {t('goals.deadline')}
            </div>
            <div className="detail-value" style={{ color: deadlineInfo.color }}>
              {deadlineInfo.formatted}
              {deadlineInfo.isOverdue && (
                <Tag color="error" style={{ marginLeft: 8 }}>
                  {t('goals.overdue')}
                </Tag>
              )}
            </div>
            . Khi
          </div>
        </div>

        {/* Description Section */}
        <div className="description-section">
          <div className="description-title">{t('goals.description')}</div>
          <div className={`description-content ${goal.description ? 'has-content' : ''}`}>
            {goal.description || t('goals.noDescription')}
          </div>
        </div>
      </DetailModalWrapper>
    </Modal>
  );
};

export default GoalDetailModal;
