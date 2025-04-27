import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const OfflineAwareContainer = ({ children, pageName, color }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Track online status
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Try to get the last cache timestamp
    const checkCacheTimestamp = async () => {
      if ('caches' in window) {
        try {
          const cache = await caches.open('disaster-pages-cache');
          const response = await cache.match(window.location.href);
          
          if (response) {
            const headers = response.headers;
            const dateHeader = headers.get('date') || headers.get('last-modified');
            if (dateHeader) {
              setLastUpdated(new Date(dateHeader));
            }
          }
        } catch (err) {
          console.error('Error checking cache timestamp:', err);
        }
      }
    };
    
    checkCacheTimestamp();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  return (
    <>
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className={`bg-${color}-50 border-l-4 border-${color}-500 text-${color}-700 p-4 mx-4 my-4 rounded-md`}>
          <div className="flex items-center">
            <WifiOff className="mr-2" size={18} />
            <div>
              <p className="font-medium">You are viewing cached {pageName} information</p>
              {lastUpdated && (
                <p className="text-sm">Last updated: {lastUpdated.toLocaleString()}</p>
              )}
              <p className="text-sm mt-1">Some features may be limited while offline</p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};

export default OfflineAwareContainer;