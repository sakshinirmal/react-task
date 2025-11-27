import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWMRo91n5ndbAufxG-ylPsvxA3YsxkCm8",
  authDomain: "notify-aa8c5.firebaseapp.com",
  projectId: "notify-aa8c5",
  storageBucket: "notify-aa8c5.firebasestorage.app",
  messagingSenderId: "367357057396",
  appId: "1:367357057396:web:a451649dd005e2ff39f421",
  measurementId: "G-85XEMXFPZ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging (for push notifications)
export const messaging = getMessaging(app);
