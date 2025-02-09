import { openDB } from 'idb';

// Open or create an IndexedDB database
const dbPromise = openDB('authStore', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('user')) {
            db.createObjectStore('user', { keyPath: 'id' });
        }
    },
});

// Save user data to IndexedDB
export const saveUserData = async (user) => {
    const db = await dbPromise;
    await db.put('user', { id: 'currentUser', ...user });
};

// Get user data from IndexedDB
export const getUserData = async () => {
    const db = await dbPromise;
    return db.get('user', 'currentUser');
};

// Clear user data from IndexedDB
export const clearUserData = async () => {
    const db = await dbPromise;
    await db.delete('user', 'currentUser');
};