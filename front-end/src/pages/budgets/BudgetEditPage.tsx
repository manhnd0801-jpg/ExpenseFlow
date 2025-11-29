/**
 * Budget Edit Page
 * Page for editing existing budgets
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { BudgetForm } from '@components/molecules/BudgetForm';
import { useI18n } from '@hooks/useI18n';
import { updateBudgetStart } from '@redux/modules/budgets/budgetSlice';
import { categoryActions } from '@redux/modules/categories/categorySlice';
import type { RootState } from '@redux/store';
import { budgetService } from '@services/budgetService';
import { standardizeApiResponse } from '@utils/apiUtils';
import { Button, Card, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const BudgetEditPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [budgetData, setBudgetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redux state
  const { loading: updateLoading } = useSelector((state: RootState) => state.budgets);
  const { categories, isLoading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  // Load budget data and categories on mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        message.error(t('budgets.invalidId'));
        navigate('/budgets');
        return;
      }

      try {
        setLoading(true);
        dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 100 }));

        const apiResponse = await budgetService.getBudgetById(id);
        const budget = standardizeApiResponse(apiResponse);

        // Transform API response to match form expectations
        const transformedBudget = {
          ...budget,
          spentAmount: budget.spent || 0, // Map 'spent' to 'spentAmount' for form
        };
        setBudgetData(transformedBudget);
        setBudgetData(transformedBudget);
      } catch (error: any) {
        message.error(error.message || t('budgets.loadError'));
        navigate('/budgets');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, dispatch, navigate]);

  // Handle navigation after successful update
  useEffect(() => {
    if (isSubmitting && !updateLoading) {
      // Was submitting and now loading finished = update completed
      navigate('/budgets');
      setIsSubmitting(false);
    }
  }, [updateLoading, isSubmitting, navigate]);

  const handleSubmit = (values: any) => {
    if (!id) return;

    // Update budget with form values

    // Only send fields that UpdateBudgetDto accepts
    const updateData = {
      name: values.name,
      amount: values.amount,
      period: values.period,
      startDate: values.startDate,
      endDate: values.endDate,
      alertThreshold: values.alertThreshold,
    };

    // Dispatch update budget action
    setIsSubmitting(true);
    dispatch(updateBudgetStart({ id, updates: updateData }));
  };

  const handleCancel = () => {
    navigate('/budgets');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin ngân sách...</p>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Không tìm thấy ngân sách</p>
        <Button onClick={() => navigate('/budgets')}>Quay lại danh sách</Button>
      </div>
    );
  }
  // Budget data loaded from Redux

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/budgets')}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách
        </Button>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Chỉnh sửa ngân sách</h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>Cập nhật thông tin ngân sách của bạn</p>
      </div>

      <Card>
        <BudgetForm
          visible={true}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          categories={categories}
          loading={updateLoading || categoriesLoading}
          initialValues={budgetData}
          isModal={false}
        />
      </Card>
    </div>
  );
};

export default BudgetEditPage;
