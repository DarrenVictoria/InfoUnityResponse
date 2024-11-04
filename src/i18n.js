import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav.realtime": "Realtime Data",
      "nav.learn": "Learn",
      "nav.tools": "Tools",
      "nav.volunteer": "Volunteer",
      "nav.disasterCatalogue": "Disaster Catalogue",
      "nav.aiChatbot": "AI Chatbot",
      "nav.responseManagement": "Response Management",
      "nav.missingPersonRegistry": "Missing Person Registry",
      "nav.sos": "SOS",
      "nav.login": "Login",
      "nav.profile": "Profile",
      "InfoUnity Response": "InfoUnity Response",
      "Uniting Information, Empowering Response": "Uniting Information, Empowering Response",
      "Search divisional secretariats...": "Search divisional secretariats...",
      "Weather and Response Status in": "Weather and Response Status in",
      "Warning Level": "Warning Level",
      "Safety Status": "Safety Status",
      "Volunteer Need": "Volunteer Need",
      "Safe": "Safe",
      "Not Safe": "Not Safe",
      "Required": "Required",
      "Not Required": "Not Required",
      "High Risk": "High Risk",
      "Medium Risk": "Medium Risk",
      "Low Risk": "Low Risk",
      "Loading...": "Loading..."
    }
  },
  si: {
    translation: {
      "InfoUnity Response": "තොරතුරු සමගිය ප්රතිචාරය",
      "logo.alt": "තොරතුරු සමගිය ලාංඡනය",
      "nav.realtime": "තත්‍ය කාලීන දත්ත",
      "nav.learn": "ඉගෙන ගන්න",
      "nav.tools": "මෙවලම්",
      "nav.volunteer": "ස්වේච්ඡා",
      "nav.disasterCatalogue": "ආපදා නාමාවලිය",
      "nav.aiChatbot": "AI චැට්බෝට්",
      "nav.responseManagement": "ප්‍රතිචාර කළමනාකරණය",
      "nav.missingPersonRegistry": "අතුරුදහන් වූ පුද්ගල ලේඛනය",
      "nav.sos": "හදිසි ඇමතුම",
      "nav.login": "පිවිසෙන්න",
      "nav.profile": "පැතිකඩ",
      "Comprehensive Disaster Response Platform": "සම්පූර්ණ ආපදා ප්‍රතිචාර වේදිකාව",
      "A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.": "ආපදා සූදානම් කිරීම, ප්‍රතිචාර සහ ප්‍රතිසංස්කරණ උත්සාහයන් ප්‍රවර්ධනය කිරීමට නිර්මාණය කළ බහු-විශේෂිත වෙබ් යෙදුමකි.",
      "Development in progress": "සංවර්ධනය වෙමින් පවතී",
      "Uniting Information, Empowering Response": "තොරතුරු එකතු කිරීම, බලගැන්වීමේ ප්‍රතිචාරය",
      "Search divisional secretariats...": "ප්‍රාදේශීය ලේකම් කොට්ඨාශ පරීක්ෂා කරන්න...",
      "Weather and Response Status in": "වෙත වැසි සහ ප්‍රතිචාර තත්ත්වය",
      "Warning Level": "අනතුරු හදුනාගැනීමේ මට්ටම",
      "Safety Status": "ආරක්ෂිත තත්ත්වය",
      "Volunteer Need": "ස්වේච්ඡා සේවක අවශ්‍යතා",
      "Safe": "ආරක්ෂිතයි",
      "Not Safe": "අ ආරක්ෂිතයි",
      "Required": "අවශ්‍යයි",
      "Not Required": "අවශ්‍ය නැත",
      "High Risk": "අධික අවදානම",
      "Medium Risk": "මධ්‍යම අවදානම",
      "Low Risk": "අඩු අවදානම",
      "Loading...": "පූරණය වෙමින්..."
    }
  },
  ta: {
    translation: {
      "InfoUnity Response": "தகவல் ஒற்றுமை பதில்",
      "logo.alt": "தகவல் ஒற்றுமை லோகோ",
      "nav.realtime": "நேரலை",
      "nav.learn": "கற்றல்",
      "nav.tools": "கருவிகள்",
      "nav.volunteer": "தன்னார்வலர்",
      "nav.disasterCatalogue": "பேரிடர் பட்டியல்",
      "nav.aiChatbot": "AI அரட்டை பாட்",
      "nav.responseManagement": "பதில் மேலாண்மை",
      "nav.missingPersonRegistry": "காணாமல் போனவர் பதிவேடு",
      "nav.sos": "அவசர அழைப்பு",
      "nav.login": "உள்நுழைய",
      "nav.profile": "சுயவிவரம்",
      "Comprehensive Disaster Response Platform": "விரிவான பேரிடர் பதில் தளம்",
      "A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.": "பேரிடர் தயார்நிலை, பதில் மற்றும் மீட்பு முயற்சிகளை மேம்படுத்த வடிவமைக்கப்பட்ட பல அம்சங்கள் கொண்ட வலை பயன்பாடு.",
      "Development in progress": "மேம்பாடு நடந்துகொண்டிருக்கிறது",
      "Uniting Information, Empowering Response": "தகவல்களை இணைத்து, பதிலை மேம்படுத்துதல்",
      "Search divisional secretariats...": "வட்டார செயலாளர் அலுவலகத்தை தேடுங்கள்...",
      "Weather and Response Status in": "இல் வானிலை மற்றும் பதில் நிலை",
      "Warning Level": "எச்சரிக்கை நிலை",
      "Safety Status": "பாதுகாப்பு நிலை",
      "Volunteer Need": "தன்னார்வத் தேவைகள்",
      "Safe": "பாதுகாப்பானது",
      "Not Safe": "பாதுகாப்பற்றது",
      "Required": "தேவை",
      "Not Required": "தேவையில்லை",
      "High Risk": "உயர் அபாயம்",
      "Medium Risk": "மிதமான அபாயம்",
      "Low Risk": "குறைந்த அபாயம்",
      "Loading...": "நகர்த்துகிறது..."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;