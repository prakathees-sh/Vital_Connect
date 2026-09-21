'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, Language, translateDistrict } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  tDistrict: (name: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
  tDistrict: (name) => name || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('vc_lang') as Language;
    if (saved && (saved === 'en' || saved === 'ta')) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('vc_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = translations[language] || translations.en;

  const tDistrict = useMemo(() => {
    return (name: string | null | undefined) => translateDistrict(name, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tDistrict }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

