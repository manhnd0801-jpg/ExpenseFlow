/**
 * CategorySelect Component
 * Select component for categories with automatic data fetching from Redux
 */

import { CategoryTypeLabels } from '@/constants/enum-labels';
import { CategoryType } from '@/constants/enums';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { categoryActions } from '@redux/modules/categories/categorySlice';
import { Select, SelectProps, Spin, Tag } from 'antd';
import React, { useEffect } from 'react';

interface CategorySelectProps extends Omit<SelectProps, 'options'> {
  categoryType?: CategoryType;
  showCategoryType?: boolean;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categoryType,
  showCategoryType = false,
  placeholder = 'Chọn danh mục',
  ...props
}) => {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    if (categories.length === 0 && !isLoading) {
      dispatch(categoryActions.listCategoriesRequest({}));
    }
  }, [dispatch, categories.length, isLoading]);

  // Filter by type if specified
  const filteredCategories = categoryType
    ? categories.filter((cat) => cat.type === categoryType)
    : categories;

  const options = filteredCategories.map((category) => ({
    value: category.id,
    label: (
      <span>
        {category.icon && <span style={{ marginRight: 8 }}>{category.icon}</span>}
        {category.name}
        {showCategoryType && (
          <Tag
            color={category.type === CategoryType.INCOME ? 'green' : 'red'}
            style={{ marginLeft: 8 }}
          >
            {CategoryTypeLabels[category.type]}
          </Tag>
        )}
      </span>
    ),
  }));

  return (
    <Select
      placeholder={placeholder}
      options={options}
      loading={isLoading}
      notFoundContent={isLoading ? <Spin size="small" /> : 'Không có danh mục'}
      showSearch
      filterOption={(input, option) =>
        (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
      }
      {...props}
    />
  );
};
