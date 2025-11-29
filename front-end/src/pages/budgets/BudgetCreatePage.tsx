/**
 * Budget Create Page
 * Page for creating new budgets
 */

import { ArrowLeftOutlined } from '@ant-design/icons';
import { BudgetForm } from '@components/molecules/BudgetForm';
import { createBudgetStart } from '@redux/modules/budgets/budgetSlice';
import { categoryActions } from '@redux/modules/categories/categorySlice';
import type { RootState } from '@redux/store';
import { Button, Card } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const BudgetCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { loading } = useSelector((state: RootState) => state.budgets);
  const { categories, isLoading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );

  // Load categories on mount
  useEffect(() => {
    dispatch(categoryActions.listCategoriesRequest({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleSubmit = (values: any) => {
    // Create budget with form values

    // Only send fields that CreateBudgetDto accepts
    const budgetData = {
      name: values.name,
      categoryId: values.categoryId, // Optional field in CreateBudgetDto
      amount: values.amount,
      period: values.period,
      startDate: values.startDate,
      endDate: values.endDate,
      alertThreshold: values.alertThreshold,
    };

    // Dispatch create budget action
    dispatch(createBudgetStart(budgetData));

    // Navigate back to list after successful creation
    setTimeout(() => {
      if (!loading) {
        navigate('/budgets');
      }
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/budgets');
  };

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
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Tạo ngân sách mới</h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          Tạo ngân sách để theo dõi và kiểm soát chi tiêu
        </p>
      </div>

      <Card>
        <BudgetForm
          visible={true}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          categories={categories}
          loading={loading || categoriesLoading}
          isModal={false}
        />
      </Card>
    </div>
  );
};

export default BudgetCreatePage;
