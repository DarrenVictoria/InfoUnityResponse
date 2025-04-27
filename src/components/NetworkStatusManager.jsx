import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const NetworkStatusManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg 
      ${isOnline ? 'bg-green-100 border-green-500' : 'bg-yellow-100 border-yellow-500'} 
      border-l-4 transition-all duration-300`}>
      
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
        <div>
          <p className="font-medium">
            {isOnline 
              ? t('You are back online')
              : t('You are offline')
            }
          </p>
          <p className="text-sm mt-1">
            {isOnline 
              ? t('Content will be synchronized')
              : t('You can still access cached content')
            }
          </p>
        </div>
        <button 
          onClick={() => setShowBanner(false)} 
          className="ml-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NetworkStatusManager;