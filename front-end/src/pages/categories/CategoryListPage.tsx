/**
 * Category List Page
 * Displays categories with CRUD operations
 */

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector, useNotification } from '@hooks/useRedux';
import {
  categoryActions,
  ICategory,
  selectCategories,
  selectIsCategoryLoading,
} from '@redux/modules/categories';
import { Button, Card, Col, Empty, Modal, Popconfirm, Row, Space, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const notify = useNotification();

  // Redux state
  const categories = useAppSelector(selectCategories);
  const isLoading = useAppSelector(selectIsCategoryLoading);

  // Local state
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    dispatch(categoryActions.listCategoriesRequest({}));
  }, [dispatch]);

  // Handle delete category
  const handleDelete = async (categoryId: string) => {
    try {
      setDeleteLoading(categoryId);
      dispatch(categoryActions.deleteCategoryRequest({ id: categoryId }));
      notify.success('Xóa danh mục thành công!');
    } catch (err) {
      notify.error('Lỗi khi xóa danh mục');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle edit category
  const handleEdit = (category: ICategory) => {
    navigate(`/categories/${category.id}/edit`, { state: { category } });
  };

  // Handle add category
  const handleAddCategory = () => {
    navigate('/categories/new');
  };

  // Table columns
  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ICategory) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.color && (
            <span
              className="category-color"
              style={{ backgroundColor: record.color }}
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
      render: (type: string) => {
        const typeLabels: Record<string, string> = {
          INCOME: 'Thu nhập',
          EXPENSE: 'Chi tiêu',
        };
        return (
          <Tag color={type === 'INCOME' ? 'green' : 'blue'}>
            {typeLabels[type] || type}
          </Tag>
        );
      },
    },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? 'orange' : 'default'}>
          {isDefault ? 'Có' : 'Không'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
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
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xóa danh mục?"
            description="Bạn có chắc muốn xóa danh mục này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteLoading === record.id }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
              title="Xóa"
            />
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
          Thêm danh mục
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={
            categories && categories.length > 0
              ? categories.map((cat: ICategory) => ({ ...cat, key: cat.id }))
              : []
          }
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
    </PageWrapper>
  );
};

export default CategoryListPage;

