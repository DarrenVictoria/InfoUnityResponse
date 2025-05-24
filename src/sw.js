import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { warmStrategyCache } from 'workbox-recipes';

self.skipWaiting();
clientsClaim();

// Pre-cache all assets included in the build
precacheAndRoute(self.__WB_MANIFEST);

// Cache navigation requests (HTML pages)
const navigationHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navigationHandler, {
    denylist: [/^\/(api|firebase-messaging-sw\.js)/]
});
registerRoute(navigationRoute);

// Cache API responses from Google Maps
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

// Cache MapBox API responses
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

// Cache static assets from the disaster catalogue
registerRoute(
    ({ request, url }) =>
        url.pathname.startsWith('/disaster-catalouge/') ||
        url.pathname.startsWith('/disaster-pages/') ||
        url.pathname.includes('/images/disasters/') ||
        url.pathname.includes('/assets/disaster-pages/'),
    new CacheFirst({
        cacheName: 'disaster-assets-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Cache images and other static assets
registerRoute(
    ({ request }) =>
        request.destination === 'image' ||
        request.destination === 'font' ||
        request.destination === 'style' ||
        request.url.includes('swiper'),
    new CacheFirst({
        cacheName: 'static-resources',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Cache specific disaster pages with high priority
const disasterPages = [
    '/help/drought',
    '/help/floods',
    '/help/landslides',
    '/help/tsunamis',
    '/respondant-landing',
    '/',
    '/home',
    '/disaster-catalouge',
    '/disaster-pages/DroughtPage',
    '/disaster-pages/FloodPage',
    '/disaster-pages/TsunamiPage',
    '/disaster-pages/LandslidePage'
];

// Warm up the cache with critical routes
const criticalStrategy = new StaleWhileRevalidate({
    cacheName: 'critical-routes'
});

warmStrategyCache({
    urls: disasterPages,
    strategy: criticalStrategy
});

// Route for disaster pages to ensure they're available offline
registerRoute(
    ({ url }) => disasterPages.some(page => url.pathname.includes(page)),
    criticalStrategy
);

registerRoute(
    ({ url }) => url.pathname.startsWith('/help/'),
    new StaleWhileRevalidate({
        cacheName: 'disaster-pages-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Respondant landing page - Use NetworkFirst but fallback to cache
registerRoute(
    ({ url }) => url.pathname === '/home' ||
        url.pathname === '/',
    new NetworkFirst({
        cacheName: 'landing-pages-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 5,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    })
);

// Cache all HTML navigation by default
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'html-pages-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
            }),
        ],
    })
);

// Cache the disaster report page and its dependencies
registerRoute(
    ({ url }) => url.pathname === '/addreport',
    new StaleWhileRevalidate({
        cacheName: 'disaster-report-page-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 5,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Cache the Dexie.js library (you need to make sure to serve it from a path you control)
registerRoute(
    ({ url }) => url.pathname.includes('dexie'),
    new CacheFirst({
        cacheName: 'libraries-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            }),
        ],
    })
);

// Firebase messaging setup
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.x.x/firebase-messaging-compat.js');

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

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-192x192.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});