import { getMessaging, getToken } from 'firebase/messaging';
import { messaging } from '../firebase';

export async function registerServiceWorkers() {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            type: 'module'
        });

        if (registration.active) {
            const token = await getToken(messaging, {
                vapidKey: 'BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84',
                serviceWorkerRegistration: registration
            });

            if (token) {
                console.log('Service worker and FCM initialized:', token);
                return token;
            }
        }
    } catch (error) {
        console.error('Service worker registration failed:', error);
        throw error;
    }
}