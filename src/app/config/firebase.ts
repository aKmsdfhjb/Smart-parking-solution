// Firebase Configuration
// Replace these values with your actual Firebase project credentials
// Get these from Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration object
// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA88r4Fzd7OO8qfo6XJeLIuw_VL4M1s1jk",
  authDomain: "smart-parking-3a991.firebaseapp.com",
  projectId: "smart-parking-3a991",
  storageBucket: "smart-parking-3a991.firebasestorage.app",
  messagingSenderId: "13865334664",
  appId: "1:13865334664:web:b595d995c66b3b5f92ec3d",
  measurementId: "G-D5MJ4LMFJB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Initialize Firebase Cloud Messaging (conditionally)
let messaging: ReturnType<typeof getMessaging> | null = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };
export default app;
