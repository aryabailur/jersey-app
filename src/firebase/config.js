// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "dummy",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "dummy",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "dummy",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "dummy",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "dummy",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "dummy",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you need
export const db = getFirestore(app);
export const auth = getAuth(app);