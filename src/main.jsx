import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './i18n'
import { messaging } from '../firebase'
import { onMessage } from '@firebase/messaging'

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Register the main service worker
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered:', registration)
    }).catch(error => {
      console.log('SW registration failed:', error)
    })

    // Register Firebase messaging service worker
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then((registration) => {
      console.log('Firebase messaging service worker registered:', registration);
    }).catch((err) => {
      console.log('Firebase messaging service worker registration failed:', err);
    });
  })
}

// Register dev service worker in development
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/dev-sw.js?dev-sw', { 
      scope: '/', 
      type: 'classic'
    });
  }
}

// Handle foreground messages
if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    if (Notification.permission === 'granted') {
      const { title, body } = payload.notification;
      new Notification(title, {
        body,
        icon: '/logo192.png',
      });
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)