import { precacheAndRoute } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';


self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
    ({ url }) => url.origin === 'https://apis.google.com',
    new NetworkFirst({
        cacheName: 'google-api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 86400
            })
        ]
    })
);


registerRoute(
    ({ url }) => url.origin === 'https://api.mapbox.com',
    new NetworkFirst({
        cacheName: 'mapbox-api-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 86400 // 24 hours
            })
        ]
    })
);

// Firebase messaging setup
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js')

firebase.initializeApp({
    // Your firebase config here
    apiKey: "19bcbe1ef4e23ed057e2f5745bc529d8",
    authDomain: "infounity-response.firebaseapp.com",
    projectId: "infounity-response",
    storageBucket: "gs://infounity-response.firebasestorage.app",
    messagingSenderId: "1022190584708",
    appId: "1:1022190584708:web:aae8dea7bb08ef042653d1"
})

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-192x192.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});