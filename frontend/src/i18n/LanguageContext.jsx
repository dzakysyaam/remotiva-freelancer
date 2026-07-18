import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'remotiva_language';
const DEFAULT_LANGUAGE = 'id';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    // Read from localStorage on initial render
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (stored === 'id' || stored === 'en')) {
        return stored;
      }
    }
    return DEFAULT_LANGUAGE;
  });

  // Persist language to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'id' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  /**
   * Get translation by dot-notation path
   * @param {string} path - e.g., "nav.home", "footer.language"
   * @returns {string} - translated string or path itself if not found
   */
  const t = (path) => {
    const keys = path.split('.');
    let value = translations[language];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Key not found, return the path itself
        return path;
      }
    }

    // If value is a string, return it; otherwise return the path
    return typeof value === 'string' ? value : path;
  };

  const value = {
    language,
    setLanguage,
    t,
    availableLanguages: [
      { code: 'id', label: 'Bahasa Indonesia' },
      { code: 'en', label: 'English' },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
