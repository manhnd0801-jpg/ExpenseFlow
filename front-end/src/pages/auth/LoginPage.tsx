/**
 * Login Page
 * Handle user login with email and password
 */

import { GithubOutlined, GoogleOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { authActions, selectError, selectIsAuthenticated, selectIsLoading } from '@redux/modules/auth';
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
      const errorMsg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
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
      message.success('Đăng nhập thành công!');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <FormWrapper>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* Email Field */}
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
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
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
        </Form.Item>

        {/* Remember me & Forgot password */}
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Nhớ tôi</Checkbox>
            </Form.Item>
            <a href={ROUTES.FORGOT_PASSWORD} className="forgot-password">
              Quên mật khẩu?
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
            Đăng nhập
          </Button>
        </Form.Item>

        {/* Divider */}
        <Divider>hoặc</Divider>

        {/* Social Login Buttons */}
        <Form.Item>
          <Space className="social-buttons">
            <Button
              className="social-btn"
              icon={<GoogleOutlined />}
              size="large"
              disabled={isLoading}
            >
              Google
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
            Chưa có tài khoản? <a href={ROUTES.SIGNUP}>Đăng ký ngay</a>
          </span>
        </div>
      </Form>
    </FormWrapper>
  );
};

export default LoginPage;
