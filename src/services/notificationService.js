import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNotification } from '../context/NotificationContext';

export class NotificationService {
    constructor() {
        this.messaging = getMessaging();
        this.vapidKey = 'BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84'; // Get from Firebase Console
    }

    async requestPermission(userId) {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await this.getFCMToken();
                await this.saveTokenToDatabase(userId, token);
                return token;
            }
            throw new Error('Notification permission denied');
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            throw error;
        }
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
                await updateDoc(userRef, {
                    fcmTokens: [...(userDoc.data().fcmTokens || []), token]
                });
            }
        } catch (error) {
            console.error('Error saving token to database:', error);
            throw error;
        }
    }

    setupMessageListener(callback) {
        onMessage(this.messaging, (payload) => {
            const { title, body, data } = payload.notification;
            const { showWarning } = useNotification();
            showWarning({
                title,
                body,
                borderColor: data.borderColor
            });
            callback(payload);
        });
    }
}