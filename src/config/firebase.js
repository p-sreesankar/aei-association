import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  // Validate required configuration
  const requiredKeys = ['apiKey', 'projectId', 'appId'];
  const hasRequiredConfig = requiredKeys.every(key => firebaseConfig[key]);

  if (hasRequiredConfig) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    // Initialize auth synchronously - required for auth state to be available immediately
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
  auth = null;
  db = null;
  storage = null;
}

let analyticsInstance = null;

async function initAnalytics() {
  if (typeof window === 'undefined') return null;
  if (!app) return null;
  if (!firebaseConfig.measurementId) return null;
  if (analyticsInstance) return analyticsInstance;

  const supported = await isSupported();
  if (!supported) return null;

  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}

const hasFirebaseApp = Boolean(app);

export { app, auth, db, firebaseConfig, hasFirebaseApp, initAnalytics, storage };