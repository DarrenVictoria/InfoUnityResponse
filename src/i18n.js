// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  si: {
    translation: {
      "InfoUnity Response": "තොරතුරු සමගිය ප්රතිචාරය",
      "Comprehensive Disaster Response Platform": "සම්පූර්ණ ආපදා ප්‍රතිචාර වේදිකාව",
      "A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.": "ආපදා සූදානම් කිරීම, ප්‍රතිචාර සහ ප්‍රතිසංස්කරණ උත්සාහයන් ප්‍රවර්ධනය කිරීමට නිර්මාණය කළ බහු-විශේෂිත වෙබ් යෙදුමකි.",
      "Development in progress": "සංවර්ධනය වෙමින් පවතී",
    },
  },
  ta: {
    translation: {
      "InfoUnity Response": "தகவல் ஒற்றுமை பதில்",
      "Comprehensive Disaster Response Platform": "விசாலமான பேரிடர் பதில் தளம்",
      "A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.": "பேரிடர் தயாரிப்பு, பதில் மற்றும் மீட்பு முயற்சிகளை மேம்படுத்த உருவாக்கப்பட்ட பல அம்சங்களைக் கொண்ட வலை பயன்பாடு.",
      "Development in progress": "வளர்ச்சி நடந்து கொண்டிருக்கிறது",
    },
  },
};

i18n
  .use(LanguageDetector) // Detect the user's language automatically
  .use(initReactI18next) // Passes i18n to React
  .init({
    resources,
    fallbackLng: 'en', // Default to English if no translation is found
    keySeparator: false, // Allows text as keys
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
