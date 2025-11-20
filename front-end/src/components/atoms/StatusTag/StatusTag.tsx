/**
 * StatusTag Component
 * Displays status with appropriate colors based on enum values
 */
import { Tag } from 'antd';
import React from 'react';
import {
  BudgetPeriodLabels,
  DebtStatusLabels,
  GoalStatusLabels,
  LoanStatusLabels,
  PaymentStatusLabels,
  TransactionTypeLabels,
} from '../../../constants/enum-labels';
import {
  DebtStatus,
  GoalStatus,
  LoanStatus,
  PaymentStatus,
  TransactionType,
} from '../../../constants/enums';

export interface IStatusTagProps {
  type: 'goal' | 'debt' | 'loan' | 'payment' | 'budget-period' | 'transaction-type';
  value: number;
  className?: string;
}

/**
 * Get color for status based on type and value
 */
const getStatusColor = (type: IStatusTagProps['type'], value: number): string => {
  switch (type) {
    case 'goal':
      switch (value) {
        case GoalStatus.ACTIVE:
          return 'blue';
        case GoalStatus.COMPLETED:
          return 'green';
        case GoalStatus.CANCELLED:
          return 'red';
        default:
          return 'default';
      }

    case 'debt':
      switch (value) {
        case DebtStatus.ACTIVE:
          return 'blue';
        case DebtStatus.PARTIAL_PAID:
          return 'orange';
        case DebtStatus.COMPLETED:
          return 'green';
        case DebtStatus.OVERDUE:
          return 'red';
        default:
          return 'default';
      }

    case 'loan':
      switch (value) {
        case LoanStatus.ACTIVE:
          return 'blue';
        case LoanStatus.COMPLETED:
          return 'green';
        case LoanStatus.DEFAULTED:
          return 'red';
        case LoanStatus.REFINANCED:
          return 'purple';
        default:
          return 'default';
      }

    case 'payment':
      switch (value) {
        case PaymentStatus.PENDING:
          return 'orange';
        case PaymentStatus.COMPLETED:
          return 'green';
        case PaymentStatus.FAILED:
          return 'red';
        case PaymentStatus.SKIPPED:
          return 'gray';
        default:
          return 'default';
      }

    case 'transaction-type':
      switch (value) {
        case TransactionType.INCOME:
          return 'green';
        case TransactionType.EXPENSE:
          return 'red';
        case TransactionType.TRANSFER:
          return 'blue';
        default:
          return 'default';
      }

    case 'budget-period':
      return 'geekblue';

    default:
      return 'default';
  }
};

/**
 * Get label for status based on type and value
 */
const getStatusLabel = (type: IStatusTagProps['type'], value: number): string => {
  const labelMap = {
    goal: GoalStatusLabels,
    debt: DebtStatusLabels,
    loan: LoanStatusLabels,
    payment: PaymentStatusLabels,
    'budget-period': BudgetPeriodLabels,
    'transaction-type': TransactionTypeLabels,
  };

  const labels = labelMap[type] as Record<number, string>;
  return labels[value] || `Unknown (${value})`;
};

export const StatusTag: React.FC<IStatusTagProps> = ({ type, value, className }) => {
  const color = getStatusColor(type, value);
  const label = getStatusLabel(type, value);

  return (
    <Tag color={color} className={className}>
      {label}
    </Tag>
  );
};

export default StatusTag;
