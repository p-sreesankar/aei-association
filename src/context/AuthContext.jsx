import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { app, auth, firebaseConfig, hasFirebaseApp } from '@config/firebase';

const AUTH_STORAGE_KEY = 'aei-mock-test-local-auth';
const AUTH_REGISTRY_KEY = 'aei-mock-test-local-accounts';
const DEFAULT_ADMIN_EMAILS = [
  import.meta.env.VITE_MOCK_TEST_ADMIN_EMAIL,
  ...(import.meta.env.VITE_MOCK_TEST_ADMIN_EMAILS ? import.meta.env.VITE_MOCK_TEST_ADMIN_EMAILS.split(',') : []),
].filter(Boolean).map((entry) => entry.trim().toLowerCase());
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_MOCK_TEST_ADMIN_PASSWORD;

function isFirebaseAuthSetupError(error) {
  const code = error?.code || '';
  return (
    code === 'auth/configuration-not-found'
    || code === 'auth/invalid-api-key'
    || code === 'auth/operation-not-allowed'
    || code === 'auth/unauthorized-domain'
    || code === 'auth/network-request-failed'
    || code === 'auth/app-deleted'
  );
}

const AuthContext = createContext(null);

function createLocalUser(email) {
  const normalizedEmail = email.trim().toLowerCase();

  return {
    uid: `local-${normalizedEmail}`,
    email: normalizedEmail,
    displayName: normalizedEmail.split('@')[0],
  };
}

function readLocalAuthSession() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readLocalAccountRegistry() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(AUTH_REGISTRY_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeLocalAccountRegistry(registry) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(AUTH_REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // Ignore storage failures in fallback mode.
  }
}

function getLocalAccount(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const registry = readLocalAccountRegistry();
  return registry[normalizedEmail] || null;
}

function mapFirebaseAuthError(code) {
  if (code === 'EMAIL_EXISTS') return 'auth/email-already-in-use';
  if (code === 'WEAK_PASSWORD') return 'auth/weak-password';
  if (code === 'INVALID_EMAIL') return 'auth/invalid-email';
  if (code === 'OPERATION_NOT_ALLOWED') return 'auth/operation-not-allowed';
  if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') return 'auth/too-many-requests';
  return 'auth/internal-error';
}

async function createFirebaseUserRecord(email, password) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const code = payload?.error?.message || '';
    const error = new Error(payload?.error?.message || 'Firebase signup failed.');
    error.code = mapFirebaseAuthError(code);
    throw error;
  }

  return payload;
}

function writeLocalAuthSession(session) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures in fallback mode.
  }
}

function clearLocalAuthSession() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage failures in fallback mode.
  }
}

async function resolveAdminStatus(firebaseUser) {
  const email = firebaseUser?.email?.trim().toLowerCase() || '';

  // Check Firebase custom claims first (primary method)
  if (firebaseUser?.getIdTokenResult) {
    try {
      const tokenResult = await firebaseUser.getIdTokenResult();
      if (tokenResult?.claims?.admin || tokenResult?.claims?.isAdmin) {
        return true;
      }
    } catch {
      // Ignore token resolution errors and fall through
    }
  }

  // DEV ONLY: Email whitelist for local development
  // This should NEVER be used in production - set admin claims via Firebase Console instead
  if (import.meta.env.DEV && email && DEFAULT_ADMIN_EMAILS.includes(email)) {
    console.warn('[DEV ONLY] Admin status granted via email whitelist. Set admin claims in Firebase Console for production.');
    return true;
  }

  return false;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState(hasFirebaseApp && app ? 'firebase' : 'local');

  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function bootstrapAuth() {
      if (!app) {
        const storedSession = readLocalAuthSession();
        if (isMounted && storedSession?.user) {
          setUser(storedSession.user);
          setIsAdmin(Boolean(storedSession.isAdmin));
        }
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const { getAuth, onAuthStateChanged, signOut } = await import('firebase/auth');
        const auth = getAuth(app);

        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!isMounted) return;

          if (!firebaseUser) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
            return;
          }

          const admin = await resolveAdminStatus(firebaseUser);
          if (!isMounted) return;

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
          });
          setIsAdmin(admin);
          setAuthMode('firebase');
          setLoading(false);
        });
      } catch (error) {
        // Always try to fall back to local mode on any error
        setAuthMode('local');

        if (import.meta.env.DEV) {
          const storedSession = readLocalAuthSession();
          if (isMounted && storedSession?.user) {
            setUser(storedSession.user);
            setIsAdmin(Boolean(storedSession.isAdmin));
          }
        }
        if (isMounted) setLoading(false);
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  async function loginWithEmail(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    // Use the auth from firebase.js config (synchronously initialized)
    if (auth) {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Force token refresh to pick up any recently set custom claims
      await credential.user.getIdToken(true);
      const admin = await resolveAdminStatus(credential.user);

      const nextUser = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || credential.user.email?.split('@')[0] || 'Student',
      };

      setUser(nextUser);
      setIsAdmin(admin);
      setAuthMode('firebase');
      clearLocalAuthSession();
      return nextUser;
    }

    // If we reach here, Firebase is not configured - fail instead of local fallback
    throw new Error('Firebase authentication is not configured. Please check your environment variables.');
  }

  async function registerWithEmail(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    if (app && authMode === 'firebase') {
      try {
        const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
        const auth = getAuth(app);
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        
        const nextUser = {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName || credential.user.email?.split('@')[0] || 'Student',
        };

        setUser(nextUser);
        setIsAdmin(false);
        clearLocalAuthSession();
        return nextUser;
      } catch (error) {
        if (isFirebaseAuthSetupError(error)) {
          setAuthMode('local');
        }
        throw error;
      }
    }

    // Local fallback sign up (development only) - stores password in localStorage
    // WARNING: This is insecure for production - only use in local development
    if (import.meta.env.DEV) {
      const existingAccount = getLocalAccount(normalizedEmail);
      if (existingAccount) {
        const error = new Error('This email address is already in use. Please sign in instead.');
        error.code = 'auth/email-already-in-use';
        throw error;
      }

      // SECURITY NOTE: In production, always use Firebase Auth
      // Local accounts with plain-text passwords should NEVER be used in production
      console.warn('[DEV ONLY] Local account registration - do not use in production');
      await createFirebaseUserRecord(normalizedEmail, password);

      const registry = readLocalAccountRegistry();
      registry[normalizedEmail] = { password };
      writeLocalAccountRegistry(registry);

      const nextUser = createLocalUser(normalizedEmail);
      setUser(nextUser);
      setIsAdmin(false);
      writeLocalAuthSession({ user: nextUser, isAdmin: false });
      return nextUser;
    }
    
    throw new Error('Local signup is disabled in production. Firebase Auth is required.');
  }

  async function refreshToken() {
    if (app && authMode === 'firebase') {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth(app);
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        const admin = await resolveAdminStatus(auth.currentUser);
        setIsAdmin(admin);
      }
    }
  }

  async function logout() {
    if (app && authMode === 'firebase') {
      const { getAuth, signOut } = await import('firebase/auth');
      await signOut(getAuth(app));
    }

    setUser(null);
    setIsAdmin(false);
    clearLocalAuthSession();
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      authMode,
      login: loginWithEmail,
      loginWithEmail,
      register: registerWithEmail,
      registerWithEmail,
      logout,
      refreshToken,
    }),
    [loading, isAdmin, user, authMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}

export { AuthProvider, useAuth };