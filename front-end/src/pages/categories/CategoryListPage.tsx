/**
 * Category List Page
 * Displays categories with CRUD operations
 */

import { CategoryForm } from '@/components/organisms/CategoryForm';
import { CategoryType } from '@/constants/enums';
import { useI18n } from '@/hooks/useI18n';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import { categoryActions } from '@redux/modules/categories';
import type { ICategory } from '@redux/modules/categories/categoryTypes';
import { Button, Card, Modal, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

/**
 * Category List Page Component
 */
export const CategoryListPage: React.FC = () => {
  const { t, getCategoryTypeLabel } = useI18n();
  const dispatch = useAppDispatch();

  // Redux state
  const categories = useAppSelector((state) => state.categories.categories) || [];
  const isLoading = useAppSelector((state) => state.categories.isLoading);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
    setSelectedCategoryId(categoryId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategoryId) {
      dispatch(categoryActions.deleteCategoryRequest({ id: selectedCategoryId }));
      setIsDeleteModalVisible(false);
      setSelectedCategoryId(null);
    }
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
  const columns: ColumnsType<ICategory> = [
    {
      title: t('categories.categoryName'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ICategory) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.icon && <span style={{ fontSize: '20px', marginRight: 8 }}>{record.icon}</span>}
          {record.color && (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: record.color,
                display: 'inline-block',
                marginRight: 8,
                border: '1px solid #e5e7eb',
              }}
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
      title: t('categories.categoryType'),
      dataIndex: 'type',
      key: 'type',
      render: (type: CategoryType) => (
        <Tag color={type === CategoryType.INCOME ? 'green' : 'blue'}>
          {getCategoryTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: t('common.default'),
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (
        <Tag color={isDefault ? 'orange' : 'default'}>
          {isDefault ? t('common.yes') : t('common.no')}
        </Tag>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('common.active') : t('common.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_: any, record: ICategory) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
            title={t('common.edit')}
          />
          {!record.isDefault && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              title={t('common.delete')}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('categories.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            {t('categories.addCategory')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          bordered
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('categories.totalCategories', { total }),
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingCategory ? t('categories.editCategory') : t('categories.addCategory')}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CategoryForm
          initialValues={editingCategory || undefined}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
          loading={isLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t('categories.deleteCategory')}
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText={t('common.delete')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('categories.deleteConfirmMessage')}</p>
        <p>{t('common.irreversibleAction')}</p>
      </Modal>
    </div>
  );
};

export default CategoryListPage;
