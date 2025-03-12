import { getMessaging, getToken } from 'firebase/messaging';
import { messaging } from '../firebase';

// Service worker configuration and registration
export async function registerServiceWorkers() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        // Register the main PWA service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        console.log('Main service worker registered:', registration);

        // Initialize Firebase messaging after main SW is ready
        if (registration.active) {
            const token = await getToken(messaging, {
                vapidKey: 'BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84',
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('FCM Token:', token);
                return token;
            }
        }
    } catch (error) {
        console.error('Service worker registration failed:', error);
    }
}