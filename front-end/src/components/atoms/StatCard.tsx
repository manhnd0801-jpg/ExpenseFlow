/**
 * StatCard Component
 * Reusable card component for displaying statistics on dashboard
 */

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Statistic, StatisticProps } from 'antd';
import React from 'react';

interface StatCardProps extends Omit<StatisticProps, 'title'> {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: number;
  loading?: boolean;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix,
  prefix,
  icon,
  trend,
  trendValue,
  loading = false,
  color,
  ...props
}) => {
  const getTrendColor = () => {
    if (!trend) return undefined;
    return trend === 'up' ? '#3f8600' : '#cf1322';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  return (
    <Card loading={loading} bordered={false}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <Statistic
            title={title}
            value={value}
            suffix={suffix}
            prefix={prefix}
            valueStyle={{ color: color || '#1890ff' }}
            {...props}
          />
          {trendValue !== undefined && trend && (
            <div style={{ marginTop: 8, fontSize: 12, color: getTrendColor() }}>
              {getTrendIcon()}
              <span style={{ marginLeft: 4 }}>{trendValue}% so với tháng trước</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              fontSize: 32,
              color: color || '#1890ff',
              opacity: 0.3,
              marginLeft: 16,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
