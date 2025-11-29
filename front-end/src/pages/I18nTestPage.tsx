import { AccountType, TransactionType } from '@/constants/enums';
import { LanguageSelector } from '@components/atoms';
import { useI18n } from '@hooks';
import { Button, Card, Space, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

/**
 * I18n Test Component
 * Demo component to test internationalization features
 */
export const I18nTestPage: React.FC = () => {
  const { t, currentLanguage, getAccountTypeLabel, getTransactionTypeLabel } = useI18n();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>{t('settings.title')} - Test Page</Title>

      <Card title="Language Selector Test" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Current Language: <strong>{currentLanguage}</strong>
          </Text>
          <div>
            <Text>Dropdown Style: </Text>
            <LanguageSelector type="dropdown" showLabel={true} />
          </div>
          <div>
            <Text>Button Style: </Text>
            <LanguageSelector type="button" showLabel={true} />
          </div>
        </Space>
      </Card>

      <Card title="Common Translations Test" style={{ marginBottom: '24px' }}>
        <Space direction="vertical">
          <Text>Add: {t('common.add')}</Text>
          <Text>Edit: {t('common.edit')}</Text>
          <Text>Delete: {t('common.delete')}</Text>
          <Text>Save: {t('common.save')}</Text>
          <Text>Cancel: {t('common.cancel')}</Text>
        </Space>
      </Card>

      <Card title="Navigation Test" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button type="primary">{t('navigation.dashboard')}</Button>
          <Button>{t('navigation.transactions')}</Button>
          <Button>{t('navigation.accounts')}</Button>
          <Button>{t('navigation.budgets')}</Button>
          <Button>{t('navigation.settings')}</Button>
        </Space>
      </Card>

      <Card title="Enum Labels Test" style={{ marginBottom: '24px' }}>
        <Space direction="vertical">
          <div>
            <Text strong>Account Types:</Text>
            <ul>
              <li>Cash: {getAccountTypeLabel(AccountType.CASH)}</li>
              <li>Bank: {getAccountTypeLabel(AccountType.BANK)}</li>
              <li>Credit Card: {getAccountTypeLabel(AccountType.CREDIT_CARD)}</li>
            </ul>
          </div>
          <div>
            <Text strong>Transaction Types:</Text>
            <ul>
              <li>Income: {getTransactionTypeLabel(TransactionType.INCOME)}</li>
              <li>Expense: {getTransactionTypeLabel(TransactionType.EXPENSE)}</li>
              <li>Transfer: {getTransactionTypeLabel(TransactionType.TRANSFER)}</li>
            </ul>
          </div>
        </Space>
      </Card>

      <Card title="Auth Translations" style={{ marginBottom: '24px' }}>
        <Space direction="vertical">
          <Text>Login: {t('auth.login')}</Text>
          <Text>Email: {t('auth.email')}</Text>
          <Text>Password: {t('auth.password')}</Text>
          <Text>Remember Me: {t('auth.rememberMe')}</Text>
          <Text>Forgot Password: {t('auth.forgotPassword')}</Text>
        </Space>
      </Card>

      <Card title="Dashboard Translations" style={{ marginBottom: '24px' }}>
        <Space direction="vertical">
          <Text>Welcome: {t('dashboard.welcome')}</Text>
          <Text>Income: {t('dashboard.income')}</Text>
          <Text>Expense: {t('dashboard.expense')}</Text>
          <Text>Balance: {t('dashboard.balance')}</Text>
          <Text>Recent Transactions: {t('dashboard.recentTransactions')}</Text>
        </Space>
      </Card>

      <Card title="Validation Messages" style={{ marginBottom: '24px' }}>
        <Space direction="vertical">
          <Text>Required: {t('validationMessages.required')}</Text>
          <Text>Invalid Email: {t('validationMessages.email')}</Text>
          <Text>Positive Number: {t('validationMessages.positiveNumber')}</Text>
        </Space>
      </Card>
    </div>
  );
};

export default I18nTestPage;
