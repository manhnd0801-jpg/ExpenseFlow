import { NotificationType } from '@/constants/enums';
import { INotification } from '@/types/models';
import { BellOutlined, CheckOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@hooks/useRedux';
import {
  deleteAllReadRequest,
  deleteNotificationRequest,
  fetchNotificationsRequest,
  fetchUnreadCountRequest,
  markAsReadRequest,
} from '@redux/modules/notifications/notificationsSlice';
import { Badge, Button, Dropdown, Empty, List, Space, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Text } = Typography;

const DropdownContainer = styled.div`
  width: 360px;
  max-height: 480px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DropdownHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationList = styled(List)`
  overflow-y: auto;
  max-height: 360px;

  .ant-list-item {
    cursor: pointer;
    transition: background-color 0.2s;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

    &:hover {
      background-color: #fafafa;
    }

    &.unread {
      background-color: #e6f7ff;
      border-left: 3px solid #1890ff;
    }
  }
` as typeof List;

const DropdownFooter = styled.div`
  padding: 8px 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;

  .ant-btn {
    width: 100%;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NotificationActions = styled(Space)`
  margin-top: 8px;
`;

const NotificationDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);

  const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      [NotificationType.BUDGET_ALERT]: 'Ngân sách',
      [NotificationType.PAYMENT_DUE]: 'Thanh toán',
      [NotificationType.DEBT_REMINDER]: 'Nợ',
      [NotificationType.GOAL_MILESTONE]: 'Mục tiêu',
      [NotificationType.SYSTEM]: 'Hệ thống',
    };
    return labels[type] || 'Khác';
  };

  useEffect(() => {
    dispatch(fetchNotificationsRequest());
    dispatch(fetchUnreadCountRequest());
  }, [dispatch]);

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markAsReadRequest(notificationId));
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotificationRequest(notificationId));
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

    unreadIds.forEach((id) => {
      dispatch(markAsReadRequest(id));
    });
  };

  const handleDeleteAllRead = () => {
    dispatch(deleteAllReadRequest());
  };

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.isRead) {
      dispatch(markAsReadRequest(notification.id));
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const dropdownContent = (
    <DropdownContainer>
      <DropdownHeader>
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </DropdownHeader>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không có thông báo"
          style={{ padding: '40px 20px' }}
        />
      ) : (
        <NotificationList
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              className={!notification.isRead ? 'unread' : ''}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationContent>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text strong>{notification.title}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(notification.createdAt).fromNow()}
                  </Text>
                </Space>

                <Text>{notification.message}</Text>

                <Space size={4}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {getNotificationTypeLabel(notification.type)}
                  </Text>
                </Space>

                <NotificationActions size="small">
                  {!notification.isRead && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  )}
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(notification.id, e)}
                  >
                    Xóa
                  </Button>
                </NotificationActions>
              </NotificationContent>
            </List.Item>
          )}
        />
      )}

      {notifications.length > 0 && (
        <DropdownFooter>
          <Button type="link" danger onClick={handleDeleteAllRead}>
            Xóa tất cả đã đọc
          </Button>
        </DropdownFooter>
      )}
    </DropdownContainer>
  );

  return (
    <Dropdown dropdownRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} overflowCount={99}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '18px' }} />}
          style={{ height: '48px', padding: '0 16px' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationDropdown;
