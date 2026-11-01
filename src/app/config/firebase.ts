// Firebase client configuration. Client API keys are public identifiers;
// secure access with Firebase Authentication and Firestore Security Rules.
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA88r4Fzd7OO8qfo6XJeLIuw_VL4M1s1jk",
  authDomain: "smart-parking-3a991.firebaseapp.com",
  projectId: "smart-parking-3a991",
  storageBucket: "smart-parking-3a991.firebasestorage.app",
  messagingSenderId: "13865334664",
  appId: "1:13865334664:web:b595d995c66b3b5f92ec3d",
  measurementId: "G-D5MJ4LMFJB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
