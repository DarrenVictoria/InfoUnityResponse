import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../../components/LanguageToggle';
import './Homepage.css'


function HomePage() {
  const [isGlowing, setIsGlowing] = useState(false);
  const { t } = useTranslation();

  const handleInteraction = (state) => {
    setIsGlowing(state);
  };

  return (
    <div className="info-unity-container">
      {/* Language Toggle */}
      <LanguageToggle />


      {/* Logo Section with Glow Effect */}
      <div
        className={`unity-logo-container ${isGlowing ? 'glowing' : ''}`}
        onMouseEnter={() => handleInteraction(true)}
        onMouseLeave={() => handleInteraction(false)}
        onTouchStart={() => handleInteraction(true)}
        onTouchEnd={() => handleInteraction(false)}
      >
        <img src="/Home_Image.png" alt={t("InfoUnity Response")} className="app-logo" />
        <h1>{t("InfoUnity Response")}</h1>
      </div>

      {/* Main Content */}
      <div className="unity-content">
        <h2 className="gradient-text">
          {t("Comprehensive Disaster Response Platform")}
        </h2>
        
        <p className="description">
          {t("A multi-featured web application designed to enhance disaster preparedness, response, and recovery efforts.")}
        </p>

        {/* Development Status */}
        <div className="development-status">
          <div className="status-indicator"></div>
          <span>{t("Development in progress")}</span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
