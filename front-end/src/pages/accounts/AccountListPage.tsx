/**
 * Account List Page
 * Displays accounts with filters and CRUD operations
 */

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

import { AccountForm } from '@/components/organisms/AccountForm';
import { CurrencyCodeMap } from '@/constants/enum-labels';
import { AccountType, Currency } from '@/constants/enums';
import { useI18n } from '@hooks/useI18n';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { accountActions } from '@redux/modules/accounts';
import type { IAccount } from '@redux/modules/accounts/accountTypes';

const AccountListPage: React.FC = () => {
  const { t, getAccountTypeLabel } = useI18n();
  const dispatch = useAppDispatch();

  // Redux state
  const accounts = useAppSelector((state) => state.accounts.accounts) || [];
  const isLoading = useAppSelector((state) => state.accounts.isLoading);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

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
  }; // Handle delete account
  const handleDelete = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountId) {
      dispatch(accountActions.deleteAccountRequest({ id: selectedAccountId }));
      setIsDeleteModalVisible(false);
      setSelectedAccountId(null);
    }
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
    let currencyCode = 'VND';

    if (typeof currencyEnum === 'number') {
      currencyCode = CurrencyCodeMap[currencyEnum as Currency] || 'VND';
    } else if (typeof currencyEnum === 'string' && currencyEnum.length === 3) {
      currencyCode = currencyEnum.toUpperCase();
    }

    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      console.warn(`Invalid currency: ${currencyEnum}, falling back to VND`);
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    }
  };

  // Table columns
  const columns: ColumnsType<IAccount> = [
    {
      title: t('accounts.accountName'),
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
      title: t('accounts.accountType'),
      dataIndex: 'type',
      key: 'type',
      render: (type: AccountType) => <Tag color="blue">{getAccountTypeLabel(type)}</Tag>,
    },
    {
      title: t('accounts.balance'),
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance: number, record: IAccount) => (
        <div>
          <div style={{ fontWeight: 600, color: '#10b981' }}>
            {formatCurrency(balance, record.currency)}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {t('accounts.initialBalance')}:{' '}
            {formatCurrency(record.initialBalance || 0, record.currency)}
          </div>
        </div>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: any, record: IAccount) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            title={t('common.edit')}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title={t('common.delete')}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('accounts.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            {t('accounts.addAccount')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="id"
          bordered
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('accounts.totalAccounts', { total }),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingAccount ? t('accounts.editAccount') : t('accounts.addAccount')}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <AccountForm
          initialValues={editingAccount || undefined}
          onSubmit={editingAccount ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('accounts.deleteAccount')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('accounts.deleteConfirmation')}</p>
        <p>{t('common.irreversibleAction')}</p>
      </Modal>
    </div>
  );
};

export default AccountListPage;
