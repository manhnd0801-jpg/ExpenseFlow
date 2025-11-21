/**
 * AccountSelect Component
 * Select component for accounts with automatic data fetching from Redux
 */

import { AccountTypeLabels } from '@/constants/enum-labels';
import { AccountType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { accountActions } from '@redux/modules/accounts/accountSlice';
import { Select, SelectProps, Spin, Tag } from 'antd';
import React, { useEffect } from 'react';

interface AccountSelectProps extends Omit<SelectProps, 'options'> {
  showAccountType?: boolean;
  showBalance?: boolean;
}

export const AccountSelect: React.FC<AccountSelectProps> = ({
  showAccountType = false,
  showBalance = true,
  placeholder = 'Chọn tài khoản',
  ...props
}) => {
  const dispatch = useAppDispatch();
  const { accounts, isLoading } = useAppSelector((state) => state.accounts);

  useEffect(() => {
    if (accounts.length === 0 && !isLoading) {
      dispatch(accountActions.listAccountsRequest({}));
    }
  }, [dispatch, accounts.length, isLoading]);

  const formatBalance = (balance: number, currency: string): string => {
    if (currency === 'VND') {
      return `${balance.toLocaleString()} ₫`;
    } else if (currency === 'USD') {
      return `$ ${balance.toLocaleString()}`;
    }
    return `${balance.toLocaleString()} ${currency}`;
  };

  const options = accounts.map((account) => ({
    value: account.id,
    label: (
      <span>
        {account.name}
        {showBalance && (
          <span style={{ marginLeft: 8, color: '#999', fontSize: '12px' }}>
            ({formatBalance(account.balance, account.currency)})
          </span>
        )}
        {showAccountType && (
          <Tag style={{ marginLeft: 8 }}>{AccountTypeLabels[account.type as AccountType]}</Tag>
        )}
      </span>
    ),
  }));

  return (
    <Select
      placeholder={placeholder}
      options={options}
      loading={isLoading}
      notFoundContent={isLoading ? <Spin size="small" /> : 'Không có tài khoản'}
      showSearch
      filterOption={(input, option) =>
        (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
      }
      {...props}
    />
  );
};
