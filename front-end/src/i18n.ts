import { resources } from '@locales';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Supported languages
export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Default language fallback
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

// Browser language detection
const getInitialLanguage = (): SupportedLanguage => {
  // Check if there's a saved language in localStorage
  const savedLanguage = localStorage.getItem('expense-flow-language');
  if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
    return savedLanguage as SupportedLanguage;
  }

  // Check browser language
  const browserLanguage = navigator.language.toLowerCase();

  // Direct match (e.g., 'vi', 'en')
  if (SUPPORTED_LANGUAGES.includes(browserLanguage as SupportedLanguage)) {
    return browserLanguage as SupportedLanguage;
  }

  // Language code match (e.g., 'en-US' -> 'en', 'vi-VN' -> 'vi')
  const langCode = browserLanguage.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(langCode as SupportedLanguage)) {
    return langCode as SupportedLanguage;
  }

  // Fallback to default language
  return DEFAULT_LANGUAGE;
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(), // Set initial language
  fallbackLng: DEFAULT_LANGUAGE,
  debug: process.env.NODE_ENV === 'development',

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  // Save language changes to localStorage
  saveMissing: true,

  // Key-value separator
  keySeparator: '.',

  // Namespace separator
  nsSeparator: false,
});

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('expense-flow-language', lng);

  // Update document direction and lang attribute
  document.documentElement.lang = lng;
  // Note: Both Vietnamese and English are left-to-right (LTR)
  document.documentElement.dir = 'ltr';
});

export default i18n;
