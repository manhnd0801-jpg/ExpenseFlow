import {
  BellOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LockOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LanguageSelector } from '@components/atoms';
import { useI18n } from '@hooks';
import { Card, Col, Divider, Row, Space, Switch, Typography } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

/**
 * Settings Page Component
 * User preferences and configuration settings
 */
export const SettingsPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined /> {t('settings.title')}
      </Title>

      <Row gutter={[24, 24]}>
        {/* Language Settings */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>
                <GlobalOutlined /> {t('settings.language')}
              </Title>
              <Text type="secondary">Choose your preferred language for the application</Text>
              <Divider />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>{t('settings.language')}</Text>
                <LanguageSelector type="dropdown" showLabel={true} />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Profile Settings */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>
                <UserOutlined /> {t('settings.profile')}
              </Title>
              <Text type="secondary">Manage your profile information</Text>
              <Divider />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>Update Profile</Text>
                <Text type="secondary">Coming Soon</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Theme Settings */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{t('settings.theme')}</Title>
              <Text type="secondary">Customize the appearance of the application</Text>
              <Divider />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>{t('settings.darkMode')}</Text>
                <Switch disabled />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Currency Settings */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{t('settings.currency')}</Title>
              <Text type="secondary">Set your default currency for transactions</Text>
              <Divider />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>{t('settings.currency')}</Text>
                <Text type="secondary">VND (Coming Soon)</Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Notifications */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>
                <BellOutlined /> {t('settings.notifications')}
              </Title>
              <Text type="secondary">Manage notification preferences</Text>
              <Divider />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>Budget Alerts</Text>
                <Switch defaultChecked />
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>Payment Reminders</Text>
                <Switch defaultChecked />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Security */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>
                <LockOutlined /> {t('settings.security')}
              </Title>
              <Text type="secondary">Security and privacy settings</Text>
              <Divider />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>Change Password</Text>
                <Text type="secondary">Coming Soon</Text>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text>Two-Factor Authentication</Text>
                <Switch disabled />
              </div>
            </Space>
          </Card>
        </Col>

        {/* About */}
        <Col xs={24}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>
                <InfoCircleOutlined /> {t('settings.about')}
              </Title>
              <Text type="secondary">Application information and support</Text>
              <Divider />
              <Text>ExpenseFlow - Personal Finance Manager</Text>
              <Text type="secondary">Version 1.0.0</Text>
              <Text type="secondary">Built with ❤️ using React, TypeScript, and Ant Design</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
