/**
 * Contribute to Goal Modal Component
 */
import { useI18n } from '@/hooks/useI18n';
import { DollarOutlined } from '@ant-design/icons';
import { Divider, Form, Input, InputNumber, Modal, Progress, Space, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import type { IGoal } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';

const { Text } = Typography;
const { TextArea } = Input;

interface IContributeGoalModalProps {
  visible: boolean;
  goal: IGoal | null;
  onCancel: () => void;
  onSubmit: (values: { amount: number; note?: string }) => void;
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

export const ContributeGoalModal: React.FC<IContributeGoalModalProps> = ({
  visible,
  goal,
  onCancel,
  onSubmit,
  loading = false,
}) => {
  const { t } = useI18n();
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && goal) {
      form.resetFields();
    }
  }, [visible, goal, form]);

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

      <Form form={form} layout="vertical" autoComplete="off">
        <Form.Item
          name="amount"
          label={t('goals.contributionAmount')}
          rules={[
            { required: true, message: t('validation.required.contributionAmount') },
            { type: 'number', min: 1000, message: t('validation.min.contributionAmount') },
            {
              type: 'number',
              max: remainingAmount > 0 ? remainingAmount : undefined,
              message: t('validation.max.contributionAmount'),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder={t('goals.enterContributionAmount')}
            formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value!.replace(/₫\s?|(,*)/g, ''))}
            min={1000}
            max={remainingAmount > 0 ? remainingAmount : undefined}
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
