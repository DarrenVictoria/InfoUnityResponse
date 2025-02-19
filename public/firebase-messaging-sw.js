importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "19bcbe1ef4e23ed057e2f5745bc529d8",
    authDomain: "infounity-response.firebaseapp.com",
    projectId: "infounity-response",
    storageBucket: "gs://infounity-response.firebasestorage.app",
    messagingSenderId: "1022190584708",
    appId: "1:1022190584708:web:aae8dea7bb08ef042653d1"
});

const messaging = firebase.messaging();

const seenMessages = new Set();

messaging.onBackgroundMessage((payload) => {
    const { messageId, notification } = payload;
    if (seenMessages.has(messageId)) {
        return; // Skip duplicate messages
    }
    seenMessages.add(messageId);

    const { title, body } = notification;
    self.registration.showNotification(title, {
        body,
        icon: '/logo192.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        sound: '/sounds/warning_sound.mp3',
    });
});