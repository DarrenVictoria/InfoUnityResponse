import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { getStorage } from '@firebase/storage';
import { getMessaging, getToken } from '@firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

// Request permission and get token
// getToken(messaging, { vapidKey: "BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84" })
//   .then((currentToken) => {
//     if (currentToken) {
//       console.log('Token retrieved successfully:', currentToken);
//     } else {
//       console.log('No registration token available. Request permission to generate one.');
//     }
//   })
//   .catch((err) => {
//     console.log('An error occurred while retrieving token. ', err);
//   });


// Modify the Firebase service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    // Check if there's already an active service worker
    if (registration.active) {
      return registration;
    }
  }).then(() => {
    // Only register if no active service worker exists
    return navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: 'firebase-cloud-messaging-push-scope'
    });
  }).then((registration) => {
    console.log('Firebase Service Worker registered:', registration);

    return getToken(messaging, {
      vapidKey: "BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84",
      serviceWorkerRegistration: registration,
    });
  })
    .catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
}

export { db, auth, storage, messaging };