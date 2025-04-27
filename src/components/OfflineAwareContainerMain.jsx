import React, { useState, useEffect } from 'react';
import { AlertCircle, WifiOff } from 'lucide-react';

const OfflineAwareContainerMain = ({ children, pageName, showFullPage = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPageCached, setIsPageCached] = useState(false);

  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // Check if this page is in the cache when offline
    const checkCache = async () => {
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          let isInCache = false;
          
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            const urls = requests.map(request => request.url);
            
            if (urls.some(url => {
              const urlObj = new URL(url);
              return urlObj.pathname === window.location.pathname;
            })) {
              isInCache = true;
              break;
            }
          }
          
          setIsPageCached(isInCache);
        } catch (err) {
          console.error('Error checking cache:', err);
          setIsPageCached(false);
        }
      }
    };

    checkCache();

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  if (!isOnline && !isPageCached && showFullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <WifiOff className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">You're Offline</h2>
          <p className="mb-4 text-gray-600">
            This page isn't available offline. Please check your internet connection and try again.
          </p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isOnline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <div>
              <p className="font-bold">You are currently offline</p>
              {isPageCached ? (
                <p className="text-sm">You're viewing cached content. Some features might be limited.</p>
              ) : (
                <p className="text-sm">This page may not be fully available offline.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default OfflineAwareContainerMain;