/**
 * useNotification Hook
 * Wrapper around Ant Design message and notification for consistent UX
 * Supports toast messages and modal notifications
 */

import { message, notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';

/**
 * Notification types
 */
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

/**
 * Toast notification interface
 */
export interface IToastOptions {
  duration?: number; // Duration in seconds, 0 for never close
  key?: string; // Unique key for updating notification
}

/**
 * Modal notification interface
 */
export interface IModalNotificationOptions {
  duration?: number;
  placement?: NotificationPlacement;
}

/**
 * useNotification Hook
 * Returns object with toast and modal notification methods
 *
 * @returns Object with success, error, warning, info, loading methods
 *
 * @example
 * const notify = useNotification();
 * notify.success('Operation completed!');
 * notify.error('An error occurred');
 * const key = notify.loading('Processing...');
 * // Later: notify.close(key);
 */
export const useNotification = () => {
  /**
   * Show success toast
   */
  const success = (msg: string, options?: IToastOptions) => {
    return message.success({
      content: msg,
      duration: options?.duration ?? 3,
      key: options?.key,
    });
  };

  /**
   * Show error toast
   */
  const error = (msg: string, options?: IToastOptions) => {
    return message.error({
      content: msg,
      duration: options?.duration ?? 3,
      key: options?.key,
    });
  };

  /**
   * Show warning toast
   */
  const warning = (msg: string, options?: IToastOptions) => {
    return message.warning({
      content: msg,
      duration: options?.duration ?? 3,
      key: options?.key,
    });
  };

  /**
   * Show info toast
   */
  const info = (msg: string, options?: IToastOptions) => {
    return message.info({
      content: msg,
      duration: options?.duration ?? 3,
      key: options?.key,
    });
  };

  /**
   * Show loading toast
   */
  const loading = (msg: string, options?: IToastOptions) => {
    const key = options?.key ?? `loading_${Date.now()}`;
    message.loading({
      content: msg,
      duration: 0, // Never auto-close
      key,
    });
    return key;
  };

  /**
   * Close notification by key
   */
  const close = (key: string) => {
    message.destroy(key);
  };

  /**
   * Show modal notification (better for important messages)
   */
  const showModal = (
    type: NotificationType,
    title: string,
    description: string,
    options?: IModalNotificationOptions
  ) => {
    notification[type]({
      message: title,
      description,
      duration: options?.duration ?? 4.5,
      placement: options?.placement ?? 'topRight',
    });
  };

  /**
   * Show success modal
   */
  const successModal = (
    title: string,
    description: string,
    options?: IModalNotificationOptions
  ) => {
    showModal('success', title, description, options);
  };

  /**
   * Show error modal
   */
  const errorModal = (title: string, description: string, options?: IModalNotificationOptions) => {
    showModal('error', title, description, options);
  };

  /**
   * Show warning modal
   */
  const warningModal = (
    title: string,
    description: string,
    options?: IModalNotificationOptions
  ) => {
    showModal('warning', title, description, options);
  };

  /**
   * Show info modal
   */
  const infoModal = (title: string, description: string, options?: IModalNotificationOptions) => {
    showModal('info', title, description, options);
  };

  return {
    // Toast notifications
    success,
    error,
    warning,
    info,
    loading,
    close,

    // Modal notifications
    showModal,
    successModal,
    errorModal,
    warningModal,
    infoModal,
  };
};

export default useNotification;
