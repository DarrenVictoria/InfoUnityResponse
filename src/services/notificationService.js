import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export class NotificationService {
    constructor() {
        this.messaging = getMessaging();
        this.vapidKey = 'BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84';
        // Load persisted notifications from localStorage
        const savedNotifications = JSON.parse(localStorage.getItem('activeNotifications') || '[]');
        this.seenNotifications = new Set(JSON.parse(localStorage.getItem('seenNotifications') || '[]'));

        // Initialize audio
        this.warningSound = new Audio('/sounds/warning_sound.mp3');
        this.initializeAudio();
    }

    initializeAudio() {
        document.addEventListener('click', () => {
            if (this.warningSound.paused) {
                this.warningSound.load();
            }
        }, { once: true });
    }

    isNotificationValid(warning) {
        const now = new Date().getTime();
        const validFrom = warning.validFrom?.toDate?.()?.getTime() || warning.validFrom;
        const validUntil = warning.validUntil?.toDate?.()?.getTime() || warning.validUntil;

        return (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
    }

    markAsSeen(messageId) {
        this.seenNotifications.add(messageId);
        localStorage.setItem('seenNotifications', JSON.stringify([...this.seenNotifications]));
    }

    hasBeenSeen(messageId) {
        return this.seenNotifications.has(messageId);
    }

    async requestPermission(userId) {
        try {
            // Request notification permission
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                // Get FCM token
                const token = await this.getFCMToken();

                // Save token to database
                await this.saveTokenToDatabase(userId, token);

                // Register service worker for background notifications
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                    console.log('Service Worker registered with scope:', registration.scope);
                }

                return token;
            }
            throw new Error('Notification permission denied');
        } catch (error) {
            console.error('Error setting up notifications:', error);
            throw error;
        }
    }

    persistNotifications(notifications) {
        localStorage.setItem('activeNotifications', JSON.stringify(notifications));
    }

    markAsSeen(messageId) {
        this.seenNotifications.add(messageId);
        localStorage.setItem('seenNotifications', JSON.stringify([...this.seenNotifications]));
    }

    async getFCMToken() {
        try {
            return await getToken(this.messaging, { vapidKey: this.vapidKey });
        } catch (error) {
            console.error('Error getting FCM token:', error);
            throw error;
        }
    }

    async saveTokenToDatabase(userId, token) {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const tokens = userData.fcmTokens || [];
                if (!tokens.includes(token)) {
                    await updateDoc(userRef, {
                        fcmTokens: [...tokens, token]
                    });
                }
            }
        } catch (error) {
            console.error('Error saving token to database:', error);
            throw error;
        }
    }

    setupMessageListener(callback) {
        return onMessage(this.messaging, (payload) => {
            callback(payload);
        });
    }
}