// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
