/**
 * Account List Page
 * Displays accounts with filters and CRUD operations
 */

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import DashboardLayout from '@/components/templates/DashboardLayout';
import { useAppDispatch, useAppSelector, useNotification } from '@/hooks';
import {
  accountActions,
  IAccount,
  selectAccountError,
  selectAccountPagination,
  selectAccounts,
  selectIsAccountLoading,
} from '@/redux/modules/accounts';
import accountService from '@/services/api/accountService';
import { formatCurrency } from '@/utils/formatters';

// ============================================
// STYLED COMPONENTS
// ============================================

const StyledPageWrapper = styled.div`
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .actions-row {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-bottom: 24px;
  }

  .table-wrapper {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const StyledBalanceCell = styled.span`
  font-weight: 600;
  color: #10b981;
`;

const AccountTypeTag = styled(Tag)`
  background-color: #f0f4ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
`;

// ============================================
// COMPONENT
// ============================================

const AccountListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { success, error: showError } = useNotification();

  // Redux state
  const accounts = useAppSelector(selectAccounts);
  const isLoading = useAppSelector(selectIsAccountLoading);
  const error = useAppSelector(selectAccountError);
  const pagination = useAppSelector(selectAccountPagination);

  // Local state
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Load accounts on mount
  useEffect(() => {
    dispatch(accountActions.listAccountsRequest({}));
  }, [dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      showError('Failed to load accounts', { duration: 3 });
    }
  }, [error, showError]);

  // Handle delete account
  const handleDelete = async (accountId: string) => {
    try {
      setDeleteLoading(accountId);
      await accountService.deleteAccount(accountId);
      dispatch(accountActions.deleteAccountSuccess({ id: accountId }));
      success('Account deleted successfully');
      // Reload accounts
      dispatch(accountActions.listAccountsRequest({}));
    } catch (err: any) {
      showError('Failed to delete account', { duration: 3 });
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle edit account
  const handleEdit = (account: IAccount) => {
    navigate(`/accounts/${account.id}/edit`, { state: { account } });
  };

  // Handle add account
  const handleAddAccount = () => {
    navigate('/accounts/new');
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IAccount) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <AccountTypeTag>{type}</AccountTypeTag>,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right' as const,
      render: (balance: number, record: IAccount) => (
        <div>
          <StyledBalanceCell>{formatCurrency(balance, record.currency)}</StyledBalanceCell>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Init: {formatCurrency(record.initialBalance, record.currency)}
          </div>
        </div>
      ),
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: IAccount) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Account"
            description="Are you sure you want to delete this account?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true, loading: deleteLoading === record.id }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <StyledPageWrapper>
        {/* Page Header */}
        <div className="page-header">
          <h1>Accounts</h1>
          <p>Manage your bank accounts and digital wallets</p>
        </div>

        {/* Actions */}
        <div className="actions-row">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAccount}>
            Add Account
          </Button>
        </div>

        {/* Accounts Table */}
        <Card className="table-wrapper">
          <Table
            columns={columns}
            dataSource={
              accounts && accounts.length > 0
                ? accounts.map((acc: IAccount) => ({ ...acc, key: acc.id }))
                : []
            }
            loading={isLoading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} accounts`,
              onChange: (page) => {
                dispatch(accountActions.setAccountPage(page));
              },
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No Accounts"
                  style={{ marginTop: '48px', marginBottom: '48px' }}
                />
              ),
            }}
          />
        </Card>
      </StyledPageWrapper>
    </DashboardLayout>
  );
};

export default AccountListPage;
