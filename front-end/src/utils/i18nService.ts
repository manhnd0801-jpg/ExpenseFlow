/**
 * i18n Service Utility
 * Provides i18n functions for use in services outside of React components
 */

import { TFunction } from 'i18next';
import i18n from '../i18n';

/**
 * Get translation function for use in services
 */
export const getTranslation = (): TFunction => {
  return i18n.t;
};

/**
 * Get translated message
 */
export const translate = (key: string, options?: any): string => {
  return i18n.t(key, options) as string;
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

/**
 * Service messages for common operations
 */
export const getServiceMessages = () => {
  const t = getTranslation();

  return {
    // Success messages
    created: t('notifications.success.added'),
    updated: t('notifications.success.updated'),
    deleted: t('notifications.success.deleted'),
    saved: t('notifications.success.saved'),
    paymentRecorded: t('notifications.success.paymentRecorded'),
    contributedToGoal: t('notifications.success.contributedToGoal'),
    markedCompleted: t('notifications.success.markedCompleted'),
    deletedAllReadNotifications: t('notifications.success.deletedAllReadNotifications'),

    // Error messages
    createFailed: t('notifications.error.addFailed'),
    updateFailed: t('notifications.error.updateFailed'),
    deleteFailed: t('notifications.error.deleteFailed'),
    saveFailed: t('notifications.error.saveFailed'),
    loadFailed: t('notifications.error.loadFailed'),
    networkError: t('notifications.error.networkError'),

    // Specific success messages for entities
    events: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    transactions: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    accounts: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    budgets: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    categories: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    goals: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    debts: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
    reminders: {
      created: t('notifications.success.added'),
      updated: t('notifications.success.updated'),
      deleted: t('notifications.success.deleted'),
    },
  };
};
