/**
 * Forgot Password Page
 * Handle password reset request
 */

import { MailOutlined } from '@ant-design/icons';
import { ROUTES } from '@utils/constants';
import { authService } from '@services/authService';
import { Button, Card, Form, Input, message } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/**
 * Styled Components
 */
const FormWrapper = styled.div`
  .forgot-password-form-button {
    width: 100%;
  }

  .login-link {
    text-align: center;
    margin-top: 16px;

    a {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .success-message {
    text-align: center;
    padding: 24px;

    .success-icon {
      font-size: 48px;
      color: #52c41a;
      margin-bottom: 16px;
    }

    .success-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.85);
    }

    .success-description {
      color: rgba(0, 0, 0, 0.65);
      margin-bottom: 24px;
    }
  }
`;

interface IForgotPasswordForm {
  email: string;
}

/**
 * Forgot Password Page Component
 */
export const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  /**
   * Handle form submission
   */
  const onFinish = async (values: IForgotPasswordForm) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword({ email: values.email });
      setSubmittedEmail(values.email);
      setIsSuccess(true);
      message.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gửi email thất bại';
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle resend email
   */
  const handleResend = () => {
    if (submittedEmail) {
      form.setFieldsValue({ email: submittedEmail });
      form.submit();
    }
  };

  if (isSuccess) {
    return (
      <FormWrapper>
        <Card>
          <div className="success-message">
            <div className="success-icon">✓</div>
            <div className="success-title">Email đã được gửi!</div>
            <div className="success-description">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{submittedEmail}</strong>.
              <br />
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </div>
            <Button type="link" onClick={handleResend} disabled={isLoading}>
              Gửi lại email
            </Button>
            <div className="login-link" style={{ marginTop: '16px' }}>
              <Link to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
            </div>
          </div>
        </Card>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <Card title="Quên mật khẩu">
        <p style={{ marginBottom: '24px', color: 'rgba(0, 0, 0, 0.65)' }}>
          Nhập email của bạn để nhận link đặt lại mật khẩu.
        </p>
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

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="forgot-password-form-button"
              size="large"
              loading={isLoading}
            >
              Gửi email đặt lại mật khẩu
            </Button>
          </Form.Item>

          {/* Login Link */}
          <div className="login-link">
            <Link to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </FormWrapper>
  );
};

export default ForgotPasswordPage;

