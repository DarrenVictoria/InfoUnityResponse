import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useRobustConnectivity } from '../hooks/useConnectivity'; // UPDATE THIS PATH

const OfflineAwareContainer = ({ children, pageName, color = 'yellow' }) => {
  const { isOnline } = useRobustConnectivity(); // CHANGED: Use robust hook
  const [isPageCached, setIsPageCached] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false); // NEW: Control banner visibility

  useEffect(() => {
    const checkCache = async () => {
      if (!isOnline && 'caches' in window) {
        try {
          const cacheNames = await caches.keys(); // NEW: Check all caches
          const currentPath = window.location.pathname;
          let cached = false;

          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const match = await cache.match(currentPath);
            if (match) {
              cached = true;
              break;
            }
          }

          setIsPageCached(cached);
        } catch (err) {
          console.error('Error checking cache for current page:', err);
          setIsPageCached(false); // CHANGED: More conservative default
        }
      }
    };

    // NEW: Show offline banner only when offline
    setShowOfflineBanner(!isOnline);
    
    if (!isOnline) {
      checkCache();
    } else {
      setIsPageCached(true);
    }
  }, [isOnline]);

  return (
    <>
      {showOfflineBanner && !isOnline && ( // CHANGED: Better condition
        <div className={`bg-${color}-50 border-l-4 border-${color}-500 text-${color}-700 p-4 mb-4 rounded transition-all duration-300`}>
          <div className="flex items-center">
            <AlertCircle className="mr-2 flex-shrink-0" />
            <div className="flex-grow"> {/* NEW: Better flex layout */}
              <p className="font-bold">You are currently offline</p>
              {isPageCached ? (
                <p className="text-sm">Viewing cached content for {pageName} disaster information.</p>
              ) : (
                <p className="text-sm">This page may not be fully available offline. Some features might be limited.</p>
              )}
            </div>
            {/* NEW: Close button for offline banner */}
            <button 
              onClick={() => setShowOfflineBanner(false)}
              className="ml-2 text-gray-500 hover:text-gray-700 text-lg font-bold flex-shrink-0"
              aria-label="Close offline notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default OfflineAwareContainer;