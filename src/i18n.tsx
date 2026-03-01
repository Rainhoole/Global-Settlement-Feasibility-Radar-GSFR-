import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import zhTranslations from './locales/zh-CN.json';

export type AppLanguage = 'en' | 'zh';

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LANGUAGE_STORAGE_KEY = 'gsfr-language';

const ZH_TRANSLATIONS: Record<string, string> = zhTranslations as Record<string, string>;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'zh' ? 'zh' : 'en';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const t = useCallback(
    (text: string): string => {
      if (language === 'en') {
        return text;
      }

      const normalized = text.trim();
      return ZH_TRANSLATIONS[normalized] ?? text;
    },
    [language],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isTranslating: false,
    }),
    [language, t, toggleLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
