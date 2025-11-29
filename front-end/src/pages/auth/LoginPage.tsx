/**
 * Login Page
 * Handle user login with email and password
 */

import { GithubOutlined, GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useI18n } from '@hooks';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import {
  authActions,
  selectError,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsLoginSuccess,
} from '@redux/modules/auth';
import { ROUTES } from '@utils/constants';
import { Button, Checkbox, Divider, Form, Input, message, Space } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/**
 * Styled Components
 */
const FormWrapper = styled.div`
  .login-form-button {
    width: 100%;
  }

  .social-buttons {
    display: flex;
    gap: 12px;

    .social-btn {
      flex: 1;
      border-color: #d9d9d9;
      color: rgba(0, 0, 0, 0.85);

      &:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }

  .signup-link {
    text-align: center;
    margin-top: 16px;

    span {
      color: rgba(0, 0, 0, 0.85);
    }

    a {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .forgot-password {
    float: right;
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

interface ILoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Login Page Component
 */
export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoginSuccess = useAppSelector(selectIsLoginSuccess);
  const { t } = useI18n();

  /**
   * Handle form submission
   */
  const onFinish = async (values: ILoginForm) => {
    try {
      // Dispatch login action with email and password
      dispatch(
        authActions.loginRequest({
          email: values.email,
          password: values.password,
        })
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('notifications.error.loadFailed');
      message.error(errorMsg);
    }
  };

  /**
   * Handle login success/error
   */
  React.useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  /**
   * Redirect to dashboard on successful login
   */
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(ROUTES.DASHBOARD);
      // Only show success message on actual login, not on hydration
      if (isLoginSuccess) {
        message.success(t('notifications.success.added'));
        // Clear the login success flag after showing message
        dispatch(authActions.clearLoginSuccess());
      }
    }
  }, [isAuthenticated, isLoading, isLoginSuccess, navigate, dispatch]);

  return (
    <FormWrapper>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* Email Field */}
        <Form.Item
          name="email"
          label={t('auth.email')}
          rules={[
            { required: true, message: t('validationMessages.required') },
            { type: 'email', message: t('validationMessages.email') },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="example@email.com"
            type="email"
            size="large"
          />
        </Form.Item>

        {/* Password Field */}
        <Form.Item
          name="password"
          label={t('auth.password')}
          rules={[{ required: true, message: t('validationMessages.required') }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} size="large" />
        </Form.Item>

        {/* Remember me & Forgot password */}
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>{t('auth.rememberMe')}</Checkbox>
            </Form.Item>
            <a href={ROUTES.FORGOT_PASSWORD} className="forgot-password">
              {t('auth.forgotPassword')}
            </a>
          </Space>
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            size="large"
            loading={isLoading}
          >
            {t('auth.login')}
          </Button>
        </Form.Item>

        {/* Divider */}
        <Divider>{t('common.or')}</Divider>

        {/* Social Login Buttons */}
        <Form.Item>
          <Space className="social-buttons">
            <Button
              className="social-btn"
              icon={<GoogleOutlined />}
              size="large"
              disabled={isLoading}
            >
              {t('auth.loginWithGoogle')}
            </Button>
            <Button
              className="social-btn"
              icon={<GithubOutlined />}
              size="large"
              disabled={isLoading}
            >
              GitHub
            </Button>
          </Space>
        </Form.Item>

        {/* Signup Link */}
        <div className="signup-link">
          <span>
            {t('auth.dontHaveAccount')} <a href={ROUTES.SIGNUP}>{t('auth.register')}</a>
          </span>
        </div>
      </Form>
    </FormWrapper>
  );
};

export default LoginPage;
