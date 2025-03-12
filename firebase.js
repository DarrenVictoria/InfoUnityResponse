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
// async function registerServiceWorker() {
//   if ('serviceWorker' in navigator) {
//     try {
//       const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
//         scope: '/'
//       });

//       if (registration.active) {
//         const token = await getToken(messaging, {
//           vapidKey: "BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84",
//           serviceWorkerRegistration: registration
//         });

//         if (token) {
//           console.log('FCM Token:', token);
//           return token;
//         }
//       }
//     } catch (error) {
//       console.error('Service Worker registration failed:', error);
//     }
//   }
//   return null;
// }

// // Initialize service worker registration
// registerServiceWorker();

async function initializeFirebaseMessaging() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const token = await getToken(messaging, {
        vapidKey: 'BG5ZJKYHQwGAGEOZ2aQH47UQFHM1o1Zp9CEP7cG1mbFBavtezzUj1rC_S4L4VmQAaCqYi2mpgRfWyU-TuN6zc84',
        serviceWorkerRegistration: registration
      })
      if (token) {
        console.log('FCM Token:', token)
        return token
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase messaging:', error)
  }
  return null
}

// Initialize messaging only after page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', initializeFirebaseMessaging)
}

export { db, auth, storage, messaging, functions };