import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "firebase-api-key",
  authDomain: "venture-miles-d9917.firebaseapp.com",
  projectId: "venture-miles-d9917",
  storageBucket: "venture-miles-d9917.firebasestorage.app",
  messagingSenderId: "282402177488",
  appId: "1:282402177488:web:9920927672c5a09251f9d5",
  measurementId: "G-T7VP75K91X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure auth language
auth.useDeviceLanguage();

export { app, analytics, auth, db, storage }; 