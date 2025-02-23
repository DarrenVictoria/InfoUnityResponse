import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';

export class WarningService {
    constructor() {
        this.functions = getFunctions();
    }

    subscribeToWarnings(userId, dsDivision, callback) {
        const warningsRef = collection(db, 'warnings');
        const q = query(warningsRef, where('dsDivision', '==', dsDivision));

        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    callback(change.doc.data());
                }
            });
        });
    }

    async sendWarningNotification(warning) {
        try {
            const sendNotification = httpsCallable(this.functions, 'sendWarningNotification');
            await sendNotification({ warning });
        } catch (error) {
            console.error('Error sending warning notification:', error);
            throw error;
        }
    }
}
