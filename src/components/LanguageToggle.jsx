import React from 'react';
import { useTranslation } from 'react-i18next';

const styles = `
.language-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.language-toggle button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: #287fa4;
  color: #fff;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.language-toggle button:hover {
  background-color: #E63946;
}
`;

function LanguageToggle() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="language-toggle">
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('si')}>සිංහල</button>
        <button onClick={() => changeLanguage('ta')}>தமிழ්</button>
      </div>
    </>
  );
}

export default LanguageToggle;