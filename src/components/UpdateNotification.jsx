// src/components/UpdateNotification.jsx
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react'

export default function UpdateNotification() {
  const [offlineReady, setOfflineReady] = useState(false)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for updates every hour
      r && setInterval(() => {
        r.update()
      }, 60 * 60 * 1000)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
    onOfflineReady() {
      setOfflineReady(true)
    }
  })

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  const handleClose = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  useEffect(() => {
    if (offlineReady || needRefresh) {
      // Optional: Track PWA update events in analytics
      console.log('PWA Update Event:', offlineReady ? 'Offline Ready' : 'Update Available')
    }
  }, [offlineReady, needRefresh])

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center">
        {offlineReady ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">
            App ready to work offline
          </p>
        ) : (
          <div className="flex flex-col">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              New content available
            </p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleUpdate}
            >
              Update now
            </button>
          </div>
        )}
        <button
          className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleClose}
        >
          ✕
        </button>
      </div>
    </div>
  )
}