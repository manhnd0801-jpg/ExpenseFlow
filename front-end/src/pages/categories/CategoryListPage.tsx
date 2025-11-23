/**
 * Category List Page
 * Displays categories with CRUD operations
 */

import { CategoryForm } from '@/components/organisms/CategoryForm';
import { CategoryTypeLabels } from '@/constants/enum-labels';
import { CategoryType } from '@/constants/enums';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { categoryActions } from '@redux/modules/categories';
import type { ICategory } from '@redux/modules/categories/categoryTypes';
import { Button, Card, Empty, Modal, Popconfirm, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

/**
 * Styled Components
 */
const PageWrapper = styled.div`
  padding: 24px;

  .page-header {
    margin-bottom: 24px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .actions-row {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-bottom: 24px;
  }

  .category-color {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: inline-block;
    margin-right: 8px;
    border: 1px solid #e5e7eb;
  }
`;

/**
 * Category List Page Component
 */
export const CategoryListPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux state
  const categories = useAppSelector((state) => state.categories.categories) || [];
  const isLoading = useAppSelector((state) => state.categories.isLoading);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  // Load categories on mount
  useEffect(() => {
    dispatch(categoryActions.listCategoriesRequest({}));
  }, [dispatch]);

  // Handle create category
  const handleCreate = (values: any) => {
    dispatch(categoryActions.createCategoryRequest(values));
    setIsModalOpen(false);
  };

  // Handle update category
  const handleUpdate = (values: any) => {
    if (editingCategory) {
      dispatch(
        categoryActions.updateCategoryRequest({
          id: editingCategory.id,
          ...values,
        })
      );
      setEditingCategory(null);
      setIsModalOpen(false);
    }
  };

  // Handle delete category
  const handleDelete = (categoryId: string) => {
    dispatch(categoryActions.deleteCategoryRequest({ id: categoryId }));
  };

  // Handle open modal
  const handleOpenModal = (category?: ICategory) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(null);
    }
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Table columns
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ICategory) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.icon && <span style={{ fontSize: '20px', marginRight: 8 }}>{record.icon}</span>}
          {record.color && (
            <span
              className="category-color"
              style={{ backgroundColor: record.color, marginRight: 8 }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            {record.description && (
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: CategoryType) => (
        <Tag color={type === CategoryType.INCOME ? 'green' : 'blue'}>
          {CategoryTypeLabels[type]}
        </Tag>
      ),
    },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? 'orange' : 'default'}>{isDefault ? 'Có' : 'Không'}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Hoạt động' : 'Không hoạt động'}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: ICategory) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa danh mục?"
            description="Bạn có chắc muốn xóa danh mục này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý danh mục</h1>
        <p>Quản lý các danh mục thu nhập và chi tiêu của bạn</p>
      </div>

      {/* Actions */}
      <div className="actions-row">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Thêm danh mục
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={categories.map((cat: ICategory) => ({ ...cat, key: cat.id }))}
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có danh mục nào"
                style={{ marginTop: '48px', marginBottom: '48px' }}
              />
            ),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <CategoryForm
          initialValues={editingCategory || undefined}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          loading={isLoading}
        />
      </Modal>
    </PageWrapper>
  );
};

export default CategoryListPage;
