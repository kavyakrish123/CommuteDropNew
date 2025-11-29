import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getMessaging, getToken, Messaging, onMessage } from "firebase/messaging";
import { getFunctions, Functions } from "firebase/functions";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase config
if (!firebaseConfig.projectId) {
  console.error('Firebase configuration error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing');
  if (typeof window !== 'undefined') {
    console.error('Please check your environment variables in Vercel or .env.local');
  }
}

// Initialize Firebase (singleton pattern to avoid re-initialization)
let app: FirebaseApp;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
} else {
  app = getApps()[0];
}

// Export auth, firestore, and storage instances
export const auth: Auth = getAuth(app);

// Set auth persistence to LOCAL (persist across sessions)
// This prevents users from being logged out frequently
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting auth persistence:", error);
  });
}

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Initialize messaging (only in browser, not SSR)
export const getMessagingInstance = (): Messaging | null => {
  if (typeof window === "undefined") return null;
  try {
    return getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging not available:", error);
    return null;
  }
};

// Initialize Functions
export const functions: Functions = getFunctions(app);

export default app;

