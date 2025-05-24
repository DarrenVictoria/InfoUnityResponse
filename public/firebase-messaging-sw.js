importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: '__VITE_FIREBASE_API_KEY__',
    authDomain: '__VITE_FIREBASE_AUTH_DOMAIN__',
    projectId: '__VITE_FIREBASE_PROJECT_ID__',
    storageBucket: '__VITE_FIREBASE_STORAGE_BUCKET__',
    messagingSenderId: '__VITE_FIREBASE_MESSAGING_SENDER_ID__',
    appId: '__VITE_FIREBASE_APP_ID__',
    measurementId: '__VITE_FIREBASE_MEASUREMENT_ID__'
});

const messaging = firebase.messaging();

const seenMessages = new Set();

// messaging.onBackgroundMessage((payload) => {
//     const { notification, data } = payload;

//     // Show system notification
//     self.registration.showNotification(notification.title, {
//         body: notification.body,
//         icon: '/logo192.png',
//         badge: '/badge.png',
//         tag: data.messageId, // Use messageId as tag to prevent duplicates
//         data: payload.data,
//         requireInteraction: true, // Keep notification until user interacts
//         vibrate: [200, 100, 200],
//         sound: '/sounds/warning_sound.mp3'
//     });
// });

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-192x192.png',
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Add basic service worker lifecycle events
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    notification.close();

    if (notification.data.type === 'missingPersonMatch') {
        const url = `/missing-persons/${notification.data.missingPersonId}`;
        event.waitUntil(clients.openWindow(url));
    }
});