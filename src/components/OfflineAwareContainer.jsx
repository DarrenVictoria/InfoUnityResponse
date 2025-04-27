import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const OfflineAwareContainer = ({ children, pageName, color }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPageCached, setIsPageCached] = useState(true); // Assume true initially to avoid flicker

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Check if this page is in the cache when offline
    const checkCache = async () => {
      if (!navigator.onLine && 'caches' in window) {
        try {
          // Check both potential caches
          const disasterCache = await caches.open('disaster-pages-cache');
          const htmlCache = await caches.open('html-pages-cache');
          
          const currentPath = window.location.pathname;
          
          // Check if current URL is cached
          const disasterMatch = await disasterCache.match(currentPath);
          const htmlMatch = await htmlCache.match(currentPath);
          
          setIsPageCached(!!disasterMatch || !!htmlMatch);
        } catch (err) {
          console.error('Error checking cache for current page:', err);
          setIsPageCached(true); // Assume cached on error
        }
      } else {
        setIsPageCached(true); // Online, so page is available
      }
    };

    checkCache();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className={`bg-${color}-50 border-l-4 border-${color}-500 text-${color}-700 p-4 mb-4 rounded`}>
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <div>
              <p className="font-bold">You are currently offline</p>
              {isPageCached ? (
                <p className="text-sm">Viewing cached content for {pageName} disaster information.</p>
              ) : (
                <p className="text-sm">This page may not be fully available offline. Some features might be limited.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default OfflineAwareContainer;