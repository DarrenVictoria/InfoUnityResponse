// src/utils/serviceWorkerRegistration.js
import { firebaseConfig } from '../firebase.js';

export async function registerServiceWorkerWithConfig() {
    if ('serviceWorker' in navigator) {
        try {
            // Create query string with Firebase config
            const configParams = new URLSearchParams({
                apiKey: firebaseConfig.apiKey,
                authDomain: firebaseConfig.authDomain,
                projectId: firebaseConfig.projectId,
                storageBucket: firebaseConfig.storageBucket,
                messagingSenderId: firebaseConfig.messagingSenderId,
                appId: firebaseConfig.appId,
                measurementId: firebaseConfig.measurementId || ''
            });

            // Register service workers with config parameters
            const [messagingSW, mainSW] = await Promise.allSettled([
                navigator.serviceWorker.register(`/firebase-messaging-sw.js?${configParams}`, {
                    scope: '/'
                }),
                navigator.serviceWorker.register(`/sw.js?${configParams}`, {
                    scope: '/'
                })
            ]);

            if (messagingSW.status === 'fulfilled') {
                console.log('✅ Firebase messaging service worker registered successfully');
            } else {
                console.warn('⚠️  Firebase messaging service worker registration failed:', messagingSW.reason);
            }

            if (mainSW.status === 'fulfilled') {
                console.log('✅ Main service worker registered successfully');
            } else {
                console.warn('⚠️  Main service worker registration failed:', mainSW.reason);
            }

            return messagingSW.status === 'fulfilled' ? messagingSW.value : null;
        } catch (error) {
            console.error('❌ Service worker registration failed:', error);
            return null;
        }
    } else {
        console.warn('⚠️  Service workers are not supported in this browser');
        return null;
    }
}