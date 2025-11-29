/**
 * DashboardLayout Component
 * Template layout for dashboard and main application pages
 * Includes header, sidebar, and footer
 */

import {
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  SwapOutlined,
  TagsOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { NotificationDropdown } from '@components/molecules';
import { useI18n } from '@hooks';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { authActions, selectUser } from '@redux/modules/auth';
import { ROUTES } from '@utils/constants';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface IDashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Styled Components
 */
const DashboardContainer = styled(Layout)`
  min-height: 100vh;
`;

const AppHeader = styled(Layout.Header)`
  background: white;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary-color);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

const AppSider = styled(Layout.Sider)`
  background: #001529;

  .ant-layout-sider-children {
    background: #001529;
  }

  .ant-menu {
    background: #001529 !important;
    border-right: 1px solid #1890ff;
  }

  .ant-menu-item {
    color: rgba(255, 255, 255, 0.65) !important;

    &:hover {
      color: #1890ff !important;
    }

    &.ant-menu-item-selected {
      background-color: #1890ff !important;
      color: white !important;
    }
  }
`;

const AppContent = styled(Layout.Content)`
  margin: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
`;

const AppFooter = styled(Layout.Footer)`
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
`;

/**
 * DashboardLayout Component
 */
export const DashboardLayout: React.FC<IDashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { t } = useI18n();

  /**
   * Menu items for sidebar
   */
  const menuItems = [
    {
      key: ROUTES.DASHBOARD,
      icon: <HomeOutlined />,
      label: t('navigation.dashboard'),
    },
    {
      key: ROUTES.TRANSACTIONS,
      icon: <SwapOutlined />,
      label: t('navigation.transactions'),
    },
    {
      key: ROUTES.ACCOUNTS,
      icon: <WalletOutlined />,
      label: t('navigation.accounts'),
    },
    {
      key: ROUTES.CATEGORIES,
      icon: <TagsOutlined />,
      label: t('navigation.categories'),
    },
    {
      key: ROUTES.BUDGETS,
      icon: <DollarOutlined />,
      label: t('navigation.budgets'),
    },
    {
      key: ROUTES.GOALS,
      icon: <TrophyOutlined />,
      label: t('navigation.goals'),
    },
    {
      key: ROUTES.DEBTS,
      icon: <BankOutlined />,
      label: t('navigation.debts'),
    },
    {
      key: ROUTES.EVENTS,
      icon: <CalendarOutlined />,
      label: t('navigation.events'),
    },
    {
      key: ROUTES.LOANS,
      icon: <TeamOutlined />,
      label: t('navigation.loans'),
    },
    {
      key: ROUTES.REMINDERS,
      icon: <BellOutlined />,
      label: t('navigation.reminders'),
    },
    {
      key: ROUTES.REPORTS,
      icon: <BarChartOutlined />,
      label: t('navigation.reports'),
    },
    {
      key: ROUTES.SETTINGS,
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
    },
  ];

  /**
   * User menu items
   */
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('settings.profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('auth.logout'),
      onClick: () => {
        dispatch(authActions.logout());
        navigate(ROUTES.LOGIN);
      },
    },
  ] as any[];

  return (
    <DashboardContainer>
      {/* Header */}
      <AppHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="logo">💰 ExpenseFlow</div>
        </div>

        <div className="header-right">
          <NotificationDropdown />
          <Dropdown menu={{ items: userMenuItems } as any}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: 'var(--primary-color)', cursor: 'pointer' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </Dropdown>
        </div>
      </AppHeader>

      {/* Main Layout */}
      <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <AppSider collapsible collapsedWidth={80} collapsed={collapsed} width={200} theme="dark">
          <Menu
            mode="inline"
            defaultSelectedKeys={[window.location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </AppSider>

        {/* Content */}
        <Layout>
          <AppContent>{children}</AppContent>

          {/* Footer */}
          <AppFooter>
            <p>&copy; 2024 Expense Flow. Quản lý chi tiêu của bạn một cách thông minh.</p>
          </AppFooter>
        </Layout>
      </Layout>
    </DashboardContainer>
  );
};

export default DashboardLayout;
