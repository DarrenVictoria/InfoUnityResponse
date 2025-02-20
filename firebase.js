import { initializeApp } from '@firebase/app';
import { getFirestore } from '@firebase/firestore';
import { getAuth } from '@firebase/auth';
import { getStorage } from '@firebase/storage';
import { getMessaging, getToken } from '@firebase/messaging';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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
const functions = getFunctions(app, 'asia-southeast1');

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

if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 8540);
}

// Register Firebase messaging service worker before requesting token
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Firebase Service Worker registered:', registration);

      // Now get the FCM token
      return getToken(messaging, {
        vapidKey: "BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84",
        serviceWorkerRegistration: registration,
      });
    })
    .then((currentToken) => {
      if (currentToken) {
        console.log('Token retrieved successfully:', currentToken);
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token:', err);
    });
}

export { db, auth, storage, messaging, functions };