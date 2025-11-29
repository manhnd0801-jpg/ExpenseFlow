/**
 * Main App Component
 */

import { useI18n } from '@hooks';
import { useAppDispatch } from '@hooks/useRedux';
import { authActions } from '@redux/modules/auth';
import { AppRoutes } from '@routes/index';
import { lightTheme } from '@styles/theme';
import { STORAGE_KEYS } from '@utils/constants';
import { App as AntApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './i18n'; // Initialize i18n before anything else
import type { IUser } from './types/models/index';

/**
 * Auth Hydration Component
 * Restores auth state from localStorage on app startup
 */
const AuthHydration: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);

      let user: IUser | null = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }

      // Hydrate auth state if tokens exist
      if (accessToken) {
        dispatch(
          authActions.hydrateAuth({
            user,
            accessToken,
            refreshToken,
          })
        );
      } else {
        // Mark as hydrated even if no tokens found
        dispatch(authActions.setHydrated());
      }
    } catch (error) {
      console.error('Error hydrating auth state:', error);
      // Mark as hydrated even on error
      dispatch(authActions.setHydrated());
    }
  }, [dispatch]);

  return null;
};

/**
 * Root App Component
 */
export default function App(): JSX.Element {
  const { currentLanguage } = useI18n();

  // Get Ant Design locale based on current language
  const antdLocale = currentLanguage === 'vi' ? viVN : enUS;

  return (
    <ConfigProvider locale={antdLocale} theme={lightTheme}>
      <AntApp>
        <Router>
          <AuthHydration />
          <AppRoutes />
        </Router>
      </AntApp>
    </ConfigProvider>
  );
}
