import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCaH79BG80ll6vuHuoLpa8DP6yECmdQZSM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aei-association.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aei-association',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aei-association.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '120269872533',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:120269872533:web:108b7933daf473e6d82a9c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K97BBNSM95',
};

let app = null;
let auth = null;
let db = null;
let storage = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    // dynamically import auth to avoid bundling duplicate firebase/auth chunks
    import('firebase/auth')
      .then((mod) => {
        try {
          auth = mod.getAuth(app);
        } catch (e) {
          // ignore
          auth = null;
        }
      })
      .catch(() => {
        // If dynamic import fails, leave auth null — AuthContext has a fallback to local mode.
        auth = null;
      });
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch {
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