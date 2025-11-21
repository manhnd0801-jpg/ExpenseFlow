/**
 * Ant Design Theme Configuration
 */

import { ThemeConfig } from 'antd';

/**
 * Light theme configuration
 */
export const lightTheme: ThemeConfig = {
  token: {
    // Primary Colors
    colorPrimary: '#1890ff',
    colorPrimaryHover: '#40a9ff',
    colorPrimaryActive: '#096dd9',
    colorPrimaryBg: '#e6f7ff',

    // Semantic Colors
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',

    // Text Colors
    colorTextBase: '#262626',
    colorTextSecondary: '#8c8c8c',
    colorTextTertiary: '#bfbfbf',

    // Background Colors
    colorBgBase: '#ffffff',
    colorBgLayout: '#fafafa',
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#d9d9d9',

    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    // Border Radius
    borderRadius: 8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,

    // Shadows
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.12)',

    // Spacing
    marginXS: 4,
    marginSM: 8,
    margin: 16,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#fafafa',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#1890ff',
    },
    Card: {
      headerBg: 'transparent',
      boxShadowTertiary: '0 2px 4px rgba(0, 0, 0, 0.08)',
    },
  },
};

/**
 * Dark theme configuration
 */
export const darkTheme: ThemeConfig = {
  token: {
    // Primary Colors
    colorPrimary: '#177ddc',
    colorPrimaryHover: '#3c9ae8',
    colorPrimaryActive: '#0c5aa6',
    colorPrimaryBg: '#111b26',

    // Semantic Colors
    colorSuccess: '#49aa19',
    colorWarning: '#d89614',
    colorError: '#dc4446',
    colorInfo: '#177ddc',

    // Text Colors
    colorTextBase: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',

    // Background Colors
    colorBgBase: '#141414',
    colorBgLayout: '#000000',
    colorBgContainer: '#1f1f1f',
    colorBorderSecondary: '#434343',

    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    // Border Radius
    borderRadius: 8,
    borderRadiusSM: 4,
    borderRadiusLG: 12,

    // Shadows
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.24)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.36)',

    // Spacing
    marginXS: 4,
    marginSM: 8,
    margin: 16,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,
  },
  components: {
    Layout: {
      headerBg: '#141414',
      siderBg: '#1f1f1f',
      bodyBg: '#000000',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#111b26',
      itemSelectedColor: '#177ddc',
    },
    Card: {
      headerBg: 'transparent',
      boxShadowTertiary: '0 2px 4px rgba(0, 0, 0, 0.24)',
    },
  },
};

/**
 * Category Colors for UI consistency
 */
export const categoryColors = {
  food: '#ff6b6b',
  transport: '#4ecdc4',
  shopping: '#45b7d1',
  entertainment: '#96ceb4',
  bills: '#ffeaa7',
  health: '#dfe6e9',
  education: '#74b9ff',
  housing: '#a29bfe',
  income: '#52c41a',
  other: '#8c8c8c',
};
