// src/contexts/LanguageContext.jsx
import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  
  return (
    <LanguageContext.Provider value={i18n}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// Add this default export
export default LanguageProvider;