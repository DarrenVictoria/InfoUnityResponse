importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "19bcbe1ef4e23ed057e2f5745bc529d8",
    authDomain: "infounity-response.firebaseapp.com",
    projectId: "infounity-response",
    storageBucket: "gs://infounity-response.firebasestorage.app",
    messagingSenderId: "1022190584708",
    appId: "1:1022190584708:web:aae8dea7bb08ef042653d1"
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