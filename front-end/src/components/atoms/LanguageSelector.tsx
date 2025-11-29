import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/i18n';
import { GlobalOutlined } from '@ant-design/icons';
import { useI18n } from '@hooks';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Space } from 'antd';
import React from 'react';

/**
 * Props for LanguageSelector component
 */
interface ILanguageSelectorProps {
  /**
   * Display style of the selector
   */
  type?: 'dropdown' | 'button';

  /**
   * Size of the component
   */
  size?: 'small' | 'middle' | 'large';

  /**
   * Whether to show the language name
   */
  showLabel?: boolean;

  /**
   * Placement of the dropdown
   */
  placement?: 'bottom' | 'bottomLeft' | 'bottomRight' | 'top' | 'topLeft' | 'topRight';

  /**
   * Custom className
   */
  className?: string;

  /**
   * Callback when language changes
   */
  onChange?: (language: SupportedLanguage) => void;
}

/**
 * Language selector component
 * Allows users to switch between supported languages
 */
export const LanguageSelector: React.FC<ILanguageSelectorProps> = ({
  type = 'dropdown',
  size = 'middle',
  showLabel = true,
  placement = 'bottomRight',
  className,
  onChange,
}) => {
  const { t, currentLanguage, changeLanguage } = useI18n();

  // Language display configuration
  const languageConfig = {
    vi: {
      flag: '🇻🇳',
      name: t('settings.vietnamese'),
      shortName: 'VI',
    },
    en: {
      flag: '🇺🇸',
      name: t('settings.english'),
      shortName: 'EN',
    },
  };

  // Handle language change
  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
    onChange?.(language);
  };

  // Create menu items for dropdown
  const menuItems: MenuProps['items'] = SUPPORTED_LANGUAGES.map((lang) => ({
    key: lang,
    label: (
      <Space>
        <span>{languageConfig[lang].flag}</span>
        <span>{languageConfig[lang].name}</span>
      </Space>
    ),
    onClick: () => handleLanguageChange(lang),
  }));

  const currentConfig = languageConfig[currentLanguage as keyof typeof languageConfig];

  if (type === 'button') {
    return (
      <Button
        size={size}
        className={className}
        onClick={() => {
          // Toggle between languages
          const nextLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
          handleLanguageChange(nextLanguage);
        }}
      >
        <Space>
          <span>{currentConfig.flag}</span>
          {showLabel && <span>{currentConfig.shortName}</span>}
        </Space>
      </Button>
    );
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement={placement}
      trigger={['click']}
      className={className}
    >
      <Button size={size} type="text">
        <Space>
          <GlobalOutlined />
          <span>{currentConfig.flag}</span>
          {showLabel && <span>{currentConfig.name}</span>}
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSelector;
