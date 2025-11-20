/**
 * Signup Page
 * Handle user registration with email, password, and fullName
 */

import { GithubOutlined, GoogleOutlined, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { authActions, selectError, selectIsAuthenticated, selectIsLoading } from '@redux/modules/auth';
import { ROUTES } from '@utils/constants';
import { Button, Divider, Form, Input, message, Space } from 'antd';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/**
 * Styled Components
 */
const FormWrapper = styled.div`
  .signup-form-button {
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

  .login-link {
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
`;

interface ISignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Signup Page Component
 */
export const SignupPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /**
   * Handle form submission
   */
  const onFinish = async (values: ISignupForm) => {
    try {
      // Dispatch signup action
      dispatch(
        authActions.signupRequest({
          email: values.email,
          password: values.password,
          fullName: values.fullName,
        })
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Đăng ký thất bại';
      message.error(errorMsg);
    }
  };

  /**
   * Handle error display
   */
  React.useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  /**
   * Redirect to dashboard on successful signup
   */
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(ROUTES.DASHBOARD);
      message.success('Đăng ký thành công!');
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <FormWrapper>
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        {/* Full Name Field */}
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên' },
            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
            { max: 100, message: 'Họ và tên không được vượt quá 100 ký tự' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
        </Form.Item>

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
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            { max: 50, message: 'Mật khẩu không được vượt quá 50 ký tự' },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" size="large" />
        </Form.Item>

        {/* Confirm Password Field */}
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="signup-form-button"
            size="large"
            loading={isLoading}
          >
            Đăng ký
          </Button>
        </Form.Item>

        {/* Divider */}
        <Divider>hoặc</Divider>

        {/* Social Signup Buttons */}
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

        {/* Login Link */}
        <div className="login-link">
          <span>
            Đã có tài khoản? <Link to={ROUTES.LOGIN}>Đăng nhập ngay</Link>
          </span>
        </div>
      </Form>
    </FormWrapper>
  );
};

export default SignupPage;

