// src/serviceWorkerConfig.js
import { getMessaging, getToken } from 'firebase/messaging';
import { messaging } from '../firebase';
import { registerSW } from 'virtual:pwa-register';

export async function registerServiceWorkers() {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return;
    }

    try {
        // Register the combined service worker (PWA + Firebase)
        const updateSW = registerSW({
            onNeedRefresh() {
                if (confirm('New version available! Reload to update?')) {
                    updateSW(true);
                }
            },
            onOfflineReady() {
                console.log('App is ready for offline use');
                // Optional: Show a toast notification
                // toast.success('App is ready for offline use');
            },
            immediate: true
        });

        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        // Initialize Firebase messaging
        if (messaging) {
            const token = await getToken(messaging, {
                vapidKey: 'BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84',
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('FCM registration token:', token);
                return token;
            }
        }
    } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
    }
}