/**
 * ProgressCard Component
 * Card component for displaying budget/goal progress with progress bar
 */

import { Card, Progress, Space, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface ProgressCardProps {
  title: string;
  current: number;
  target: number;
  currency?: string;
  color?: string;
  description?: string;
  extra?: React.ReactNode;
  onClick?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  current,
  target,
  currency = 'VND',
  color,
  description,
  extra,
  onClick,
}) => {
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0;
  const isOverBudget = current > target;

  const formatAmount = (amount: number): string => {
    if (currency === 'VND') {
      return `${amount.toLocaleString()} ₫`;
    } else if (currency === 'USD') {
      return `$ ${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getProgressColor = (): string => {
    if (color) return color;
    if (isOverBudget) return '#cf1322';
    if (percentage >= 80) return '#faad14';
    return '#52c41a';
  };

  return (
    <Card hoverable={!!onClick} onClick={onClick} extra={extra} style={{ height: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          {description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {description}
            </Text>
          )}
        </div>

        <Progress
          percent={percentage}
          strokeColor={getProgressColor()}
          status={isOverBudget ? 'exception' : 'active'}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiện tại
            </Text>
            <div>
              <Text strong style={{ fontSize: 16, color: getProgressColor() }}>
                {formatAmount(current)}
              </Text>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mục tiêu
            </Text>
            <div>
              <Text style={{ fontSize: 16 }}>{formatAmount(target)}</Text>
            </div>
          </div>
        </div>
      </Space>
    </Card>
  );
};
