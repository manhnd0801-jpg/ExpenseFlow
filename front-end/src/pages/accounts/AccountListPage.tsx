/**
 * Account List Page
 * Displays accounts with filters and CRUD operations
 */

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Modal, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { AccountForm } from '@/components/organisms/AccountForm';
import { AccountTypeLabels, CurrencyCodeMap } from '@/constants/enum-labels';
import { AccountType, Currency } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { accountActions } from '@redux/modules/accounts';
import type { IAccount } from '@redux/modules/accounts/accountTypes';

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
  const dispatch = useAppDispatch();

  // Redux state
  const accounts = useAppSelector((state) => state.accounts.accounts) || [];
  const isLoading = useAppSelector((state) => state.accounts.isLoading);
  const pagination = useAppSelector((state) => state.accounts.pagination);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);

  // Load accounts on mount
  useEffect(() => {
    dispatch(accountActions.listAccountsRequest({}));
  }, [dispatch]);

  // Handle create account
  const handleCreate = (values: any) => {
    dispatch(accountActions.createAccountRequest(values));
    setIsModalOpen(false);
  };

  // Handle update account
  const handleUpdate = (values: any) => {
    if (editingAccount) {
      dispatch(
        accountActions.updateAccountRequest({
          id: editingAccount.id,
          ...values,
        })
      );
      setEditingAccount(null);
      setIsModalOpen(false);
    }
  };

  // Handle delete account
  const handleDelete = (accountId: string) => {
    dispatch(accountActions.deleteAccountRequest({ id: accountId }));
  };

  // Handle open modal
  const handleOpenModal = (account?: IAccount) => {
    if (account) {
      setEditingAccount(account);
    } else {
      setEditingAccount(null);
    }
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  // Format currency
  const formatCurrency = (amount: number, currencyEnum: number | string = 1): string => {
    // Convert enum number to currency code string
    let currencyCode = 'VND'; // Default

    if (typeof currencyEnum === 'number') {
      // It's a Currency enum value - convert to string code
      currencyCode = CurrencyCodeMap[currencyEnum as Currency] || 'VND';
    } else if (typeof currencyEnum === 'string' && currencyEnum.length === 3) {
      // Already a valid currency code string
      currencyCode = currencyEnum.toUpperCase();
    }

    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      // Fallback if currency code is invalid
      console.warn(`Invalid currency: ${currencyEnum}, falling back to VND`);
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IAccount) => (
        <div>
          <div style={{ fontWeight: 600 }}>
            {record.icon && <span style={{ marginRight: 8 }}>{record.icon}</span>}
            {text}
          </div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: AccountType) => <AccountTypeTag>{AccountTypeLabels[type]}</AccountTypeTag>,
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
            Init: {formatCurrency(record.initialBalance || 0, record.currency)}
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
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Delete Account"
            description="Are you sure you want to delete this account?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <StyledPageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <h1>Accounts</h1>
        <p>Manage your bank accounts and digital wallets</p>
      </div>

      {/* Actions */}
      <div className="actions-row">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Add Account
        </Button>
      </div>

      {/* Accounts Table */}
      <Card className="table-wrapper">
        <Table
          columns={columns}
          dataSource={accounts.map((acc: IAccount) => ({ ...acc, key: acc.id }))}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} accounts`,
            onChange: (page, pageSize) => {
              dispatch(accountActions.listAccountsRequest({ page, limit: pageSize }));
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

      {/* Create/Edit Modal */}
      <Modal
        title={editingAccount ? 'Edit Account' : 'Create Account'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <AccountForm
          initialValues={editingAccount || undefined}
          onSubmit={editingAccount ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          loading={isLoading}
        />
      </Modal>
    </StyledPageWrapper>
  );
};

export default AccountListPage;
