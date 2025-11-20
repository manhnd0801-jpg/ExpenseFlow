/**
 * Global Styles
 */

import styled from 'styled-components';

export const GlobalStyle = styled.div`
  /* CSS Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;
    color: #262626;
    background-color: #fafafa;
  }

  /* CSS Variables for Design System */
  :root {
    /* Colors */
    --primary-color: #1890ff;
    --primary-hover: #40a9ff;
    --primary-active: #096dd9;
    --primary-light: #e6f7ff;

    --success: #52c41a;
    --warning: #faad14;
    --error: #f5222d;
    --info: #1890ff;

    --text-primary: #262626;
    --text-secondary: #8c8c8c;
    --text-disabled: #bfbfbf;
    --background: #ffffff;
    --background-light: #fafafa;
    --border: #d9d9d9;

    /* Category Colors */
    --color-food: #ff6b6b;
    --color-transport: #4ecdc4;
    --color-shopping: #45b7d1;
    --color-entertainment: #96ceb4;
    --color-bills: #ffeaa7;
    --color-health: #dfe6e9;
    --color-education: #74b9ff;
    --color-housing: #a29bfe;

    /* Typography */
    --font-size-xs: 12px;
    --font-size-sm: 14px;
    --font-size-base: 16px;
    --font-size-lg: 18px;
    --font-size-xl: 20px;
    --font-size-xxl: 24px;
    --font-size-title: 32px;

    /* Spacing */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-xxl: 48px;

    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-circle: 50%;

    /* Shadows */
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);
  }

  /* Dark theme variables */
  [data-theme='dark'] {
    --text-primary: rgba(255, 255, 255, 0.85);
    --text-secondary: rgba(255, 255, 255, 0.65);
    --text-disabled: rgba(255, 255, 255, 0.45);
    --background: #141414;
    --background-light: #000000;
    --border: #434343;
    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.24);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.36);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.48);
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.3s ease;
  }

  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }

  /* Utility Classes */
  .currency-positive {
    color: var(--success) !important;
  }

  .currency-negative {
    color: var(--error) !important;
  }

  .text-xs {
    font-size: var(--font-size-xs);
  }
  .text-sm {
    font-size: var(--font-size-sm);
  }
  .text-base {
    font-size: var(--font-size-base);
  }
  .text-lg {
    font-size: var(--font-size-lg);
  }
  .text-xl {
    font-size: var(--font-size-xl);
  }

  .font-medium {
    font-weight: 500;
  }
  .font-semibold {
    font-weight: 600;
  }
  .font-bold {
    font-weight: 700;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #bfbfbf;
    border-radius: 4px;

    &:hover {
      background: #8c8c8c;
    }
  }
`;
