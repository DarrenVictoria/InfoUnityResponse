// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1qp56y0DScPic9sMXogoq76E37AaiDXY",
    authDomain: "infounity-response.firebaseapp.com",
    databaseURL: "https://infounity-response-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "infounity-response",
    storageBucket: "infounity-response.firebasestorage.app",
    messagingSenderId: "1022190584708",
    appId: "1:1022190584708:web:aae8dea7bb08ef042653d1",
    measurementId: "G-BZHZV6FFNK"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
