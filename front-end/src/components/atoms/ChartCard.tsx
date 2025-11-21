/**
 * ChartCard Component
 * Wrapper card component for charts with consistent styling
 */

import { Card, Empty, Space, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

interface ChartCardProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
  height?: number;
  emptyText?: string;
  isEmpty?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  extra,
  loading = false,
  children,
  height = 300,
  emptyText = 'Không có dữ liệu',
  isEmpty = false,
}) => {
  return (
    <Card
      loading={loading}
      title={
        <Space direction="vertical" size={0}>
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          {description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {description}
            </Text>
          )}
        </Space>
      }
      extra={extra}
      bordered={false}
    >
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isEmpty ? (
          <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          children
        )}
      </div>
    </Card>
  );
};
