/**
 * Styled Components Theme Type Declaration
 * Extends DefaultTheme to include custom theme properties
 */

import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      secondary: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      text: string;
      textSecondary: string;
      background: string;
      border: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
