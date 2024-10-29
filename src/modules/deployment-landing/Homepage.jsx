// src/pages/HomePage.jsx
import { useState } from 'react';
import './Homepage.css';

function HomePage() {
  const [isGlowing, setIsGlowing] = useState(false);

  const handleInteraction = (state) => {
    setIsGlowing(state);
  };

  return (
    <div className="info-unity-container">
      {/* Logo Section with Glow Effect */}
      <div 
        className={`unity-logo-container ${isGlowing ? 'glowing' : ''}`}
        onMouseEnter={() => handleInteraction(true)}
        onMouseLeave={() => handleInteraction(false)}
        onTouchStart={() => handleInteraction(true)}
        onTouchEnd={() => handleInteraction(false)}
      >
        <img 
          src="/Home_Image.png" 
          alt="InfoUnity Response Logo" 
          className="app-logo"
        />
        <h1>InfoUnity Response</h1>
      </div>

      {/* Main Content */}
      <div className="unity-content">
        <h2 className="gradient-text">
          Comprehensive Disaster Management Platform
        </h2>
        
        <p className="description">
          A multi-featured web application designed to enhance disaster preparedness,
          response, and recovery efforts.
        </p>

        {/* Development Status */}
        <div className="development-status">
          <div className="status-indicator"></div>
          <span>Under Development</span>
        </div>
      </div>
    </div>
  );
}

export default HomePage;