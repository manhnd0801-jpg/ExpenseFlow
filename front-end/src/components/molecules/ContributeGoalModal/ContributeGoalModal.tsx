/**
 * Contribute to Goal Modal Component
 */
import { AccountTypeLabels } from '@/constants/enum-labels';
import { useI18n } from '@/hooks/useI18n';
import { accountService } from '@/services/accountService';
import type { IAccount, IGoal } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { BankOutlined, DollarOutlined, WalletOutlined } from '@ant-design/icons';
import {
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const { Text } = Typography;
const { TextArea } = Input;

interface IContributeGoalModalProps {
  visible: boolean;
  goal: IGoal | null;
  onCancel: () => void;
  onSubmit: (values: { accountId: string; amount: number; note?: string }) => void;
  loading?: boolean;
}

const GoalInfoContainer = styled.div`
  background: linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #87e8de;

  .goal-name {
    font-size: 18px;
    font-weight: 600;
    color: #13c2c2;
    margin-bottom: 12px;
  }

  .progress-section {
    margin-bottom: 16px;
  }

  .amounts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 12px;

    .amount-item {
      text-align: center;

      .label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .value {
        font-size: 16px;
        font-weight: 600;
        color: #13c2c2;
      }
    }
  }
`;

const AccountOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  .account-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .account-name {
      font-weight: 500;
    }

    .account-type {
      font-size: 12px;
      color: #999;
    }
  }

  .account-balance {
    font-weight: 600;
    color: ${(props) => props.color || '#13c2c2'};
  }
`;

export const ContributeGoalModal: React.FC<IContributeGoalModalProps> = ({
  visible,
  goal,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<IAccount | null>(null);

  // Fetch accounts when modal opens
  useEffect(() => {
    if (visible) {
      fetchAccounts();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && goal) {
      form.resetFields();
      setSelectedAccount(null);
    }
  }, [visible, goal, form]);

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    setSelectedAccount(account || null);

    // Reset amount if it exceeds new account balance
    const currentAmount = form.getFieldValue('amount');
    if (account && currentAmount > account.balance) {
      form.setFieldsValue({ amount: undefined });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  if (!goal) return null;

  const progressPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

  const getMaxContributionAmount = () => {
    if (!selectedAccount) return remainingAmount;
    const maxByAccount = selectedAccount.balance;
    return remainingAmount > 0 ? Math.min(remainingAmount, maxByAccount) : maxByAccount;
  };

  const getAccountIcon = (type: number) => {
    switch (type) {
      case 1: // CASH
        return <WalletOutlined />;
      case 2: // BANK
        return <BankOutlined />;
      case 3: // CREDIT_CARD
        return <DollarOutlined />;
      default:
        return <WalletOutlined />;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined />
          {t('goals.contribute')}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={t('goals.contribute')}
      cancelText={t('common.cancel')}
      width={520}
    >
      <GoalInfoContainer>
        <div className="goal-name">{goal.name}</div>

        <div className="progress-section">
          <Progress
            percent={progressPercent}
            strokeColor="#13c2c2"
            format={() => `${progressPercent.toFixed(1)}%`}
          />

          <div className="amounts-grid">
            <div className="amount-item">
              <div className="label">{t('goals.currentAmount')}</div>
              <div className="value">{formatCurrency(goal.currentAmount)}</div>
            </div>
            <div className="amount-item">
              <div className="label">{t('goals.targetAmount')}</div>
              <div className="value">{formatCurrency(goal.targetAmount)}</div>
            </div>
          </div>
        </div>

        {remainingAmount > 0 && (
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">{t('goals.remainingAmount')}:</Text>
            <Tag color="orange" style={{ marginLeft: 8 }}>
              {formatCurrency(remainingAmount)}
            </Tag>
          </div>
        )}
      </GoalInfoContainer>

      <Divider>{t('goals.contributionDetails')}</Divider>

      <Spin spinning={loadingAccounts}>
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="accountId"
            label={t('goals.selectAccount')}
            rules={[{ required: true, message: t('validation.required.account') }]}
          >
            <Select
              placeholder={t('goals.selectAccountPlaceholder')}
              onChange={handleAccountChange}
              showSearch
              optionLabelProp="label"
              filterOption={(input, option) => {
                const account = accounts.find((a) => a.id === option?.value);
                if (!account) return false;
                return account.name.toLowerCase().includes(input.toLowerCase());
              }}
            >
              {accounts.map((account) => (
                <Select.Option key={account.id} value={account.id} label={`${account.name}`}>
                  <AccountOption>
                    <div className="account-info">
                      {getAccountIcon(account.type)}
                      <div>
                        <div className="account-name">{account.name}</div>
                        <div className="account-type">{AccountTypeLabels[account.type]}</div>
                      </div>
                    </div>
                    <div className="account-balance">{formatCurrency(account.balance)}</div>
                  </AccountOption>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedAccount && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: '#f0f5ff',
                borderRadius: 6,
                border: '1px solid #adc6ff',
              }}
            >
              <Space>
                <Text type="secondary">{t('goals.accountBalance')}:</Text>
                <Text strong style={{ color: '#1890ff' }}>
                  {formatCurrency(selectedAccount.balance)}
                </Text>
              </Space>
            </div>
          )}

          <Form.Item
            name="amount"
            label={t('goals.contributionAmount')}
            rules={[
              { required: true, message: t('validation.required.contributionAmount') },
              { type: 'number', min: 1000, message: t('validation.min.contributionAmount') },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  if (!selectedAccount) {
                    return Promise.reject(new Error(t('validation.required.account')));
                  }

                  if (value > selectedAccount.balance) {
                    return Promise.reject(new Error(t('validation.insufficientBalance')));
                  }

                  if (remainingAmount > 0 && value > remainingAmount) {
                    return Promise.reject(new Error(t('validation.max.contributionAmount')));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder={t('goals.enterContributionAmount')}
              step={1000}
              precision={0}
              formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, ''))}
              min={1000}
              max={getMaxContributionAmount()}
              disabled={!selectedAccount}
            />
          </Form.Item>

          <Form.Item name="note" label={t('goals.contributionNote')}>
            <TextArea
              placeholder={t('goals.enterContributionNote')}
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Spin>

      {remainingAmount <= 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#f6ffed',
            borderRadius: '6px',
            border: '1px solid #b7eb8f',
          }}
        >
          <Text type="success" style={{ fontSize: '14px', fontWeight: 500 }}>
            🎉 {t('goals.goalCompleted')}
          </Text>
        </div>
      )}
    </Modal>
  );
};

export default ContributeGoalModal;
