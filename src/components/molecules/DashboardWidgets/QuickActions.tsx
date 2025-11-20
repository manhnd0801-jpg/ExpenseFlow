/**
 * Quick Actions Widget
 * Provides shortcuts for common actions
 */
import {
  BankOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  PlusOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface IQuickActionsProps {
  onAddTransaction?: () => void;
  onTransfer?: () => void;
  onViewReports?: () => void;
  onManageAccounts?: () => void;
  onManageCategories?: () => void;
  onViewBudgets?: () => void;
}

const ActionsWrapper = styled.div`
  .quick-actions-header {
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .action-button {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border-radius: 8px;

    .anticon {
      font-size: 20px;
    }

    .action-text {
      font-size: 12px;
      font-weight: 500;
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &.primary {
      background: linear-gradient(
        135deg,
        ${(props) => props.theme?.colors?.primary || '#1890ff'} 0%,
        ${(props) => props.theme?.colors?.primaryDark || '#096dd9'} 100%
      );
      color: white;

      &:hover {
        background: linear-gradient(
          135deg,
          ${(props) => props.theme?.colors?.primaryDark || '#096dd9'} 0%,
          ${(props) => props.theme?.colors?.primary || '#1890ff'} 100%
        );
        color: white;
      }
    }
  }
`;

export const QuickActions: React.FC<IQuickActionsProps> = ({
  onAddTransaction,
  onTransfer,
  onViewReports,
  onManageAccounts,
  onManageCategories,
  onViewBudgets,
}) => {
  const actions = [
    {
      key: 'add-transaction',
      icon: <PlusOutlined />,
      text: 'Thêm giao dịch',
      onClick: onAddTransaction,
      type: 'primary',
    },
    {
      key: 'transfer',
      icon: <SwapOutlined />,
      text: 'Chuyển tiền',
      onClick: onTransfer,
      type: 'default',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      text: 'Báo cáo',
      onClick: onViewReports,
      type: 'default',
    },
    {
      key: 'accounts',
      icon: <BankOutlined />,
      text: 'Tài khoản',
      onClick: onManageAccounts,
      type: 'default',
    },
    {
      key: 'categories',
      icon: <CreditCardOutlined />,
      text: 'Danh mục',
      onClick: onManageCategories,
      type: 'default',
    },
    {
      key: 'budgets',
      icon: <FileTextOutlined />,
      text: 'Ngân sách',
      onClick: onViewBudgets,
      type: 'default',
    },
  ];

  return (
    <ActionsWrapper>
      <Card>
        <div className="quick-actions-header">
          <h4>Thao tác nhanh</h4>
        </div>

        <Row gutter={[12, 12]}>
          {actions.map((action) => (
            <Col span={8} key={action.key}>
              <Button
                className={`action-button ${action.type}`}
                type={action.type as any}
                onClick={action.onClick}
                ghost={action.type !== 'primary'}
              >
                {action.icon}
                <span className="action-text">{action.text}</span>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>
    </ActionsWrapper>
  );
};

export default QuickActions;
