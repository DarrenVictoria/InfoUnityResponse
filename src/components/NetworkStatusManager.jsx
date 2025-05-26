import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRobustConnectivity } from '../hooks/useConnectivity'; // UPDATE THIS PATH

const NetworkStatusManager = () => {
  const { isOnline } = useRobustConnectivity(); // CHANGED: Use robust hook
  const [showBanner, setShowBanner] = useState(false);
  const [lastStatus, setLastStatus] = useState(navigator.onLine); // NEW: Track last status
  const { t } = useTranslation();

  useEffect(() => {
    // NEW: Only show banner when status actually changes
    if (isOnline !== lastStatus) {
      setShowBanner(true);
      setLastStatus(isOnline);
      
      if (isOnline) {
        const timer = setTimeout(() => setShowBanner(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, lastStatus]);

  // NEW: Hide offline banner when coming back online
  useEffect(() => {
    if (isOnline && showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showBanner]);

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
          className="ml-4 text-gray-500 hover:text-gray-700 text-lg font-bold" // CHANGED: Made X bigger
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NetworkStatusManager;