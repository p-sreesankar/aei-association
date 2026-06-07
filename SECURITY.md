# Security Guidelines

## Overview
This document outlines security best practices for the AEI Association application.

## Known Vulnerabilities Fixed

### 1. ✅ Hardcoded Firebase Credentials - FIXED
- **Issue**: Firebase API keys and configuration were hardcoded in `src/config/firebase.js`
- **Fix**: All credentials now read from environment variables only (`VITE_FIREBASE_*`)
- **Verification**: No secrets in source code

### 2. ✅ Exposed Service Account Key - FIXED
- **Issue**: `service-account.json` with private key was committed to repository
- **Fix**: File removed and added to `.gitignore`
- **Action**: If this was pushed to a public repo, rotate the key immediately in Firebase Console → Project Settings → Service Accounts

### 3. ✅ Weak Firestore Security Rules - FIXED
- **Issue**: Any authenticated user could create/modify/delete mock tests
- **Fix**: Write access restricted to admins only (`isAdmin()` check added)
- **Action**: Deploy updated rules: `firebase deploy --only firestore:rules`

### 4. ✅ Admin Bypass via Email Whitelist - FIXED
- **Issue**: Admin status could be granted via email whitelist in production
- **Fix**: Email whitelist now only works in DEV mode (`import.meta.env.DEV`)
- **Production**: Set admin via Firebase Custom Claims (Firebase Console → Users → Set claims)

### 5. ✅ Pre-filled Admin Credentials - FIXED
- **Issue**: Login form pre-filled with admin credentials in DEV mode
- **Fix**: Credentials fields now empty by default

### 6. ⚠️ Plain-text Password Storage - ACKNOWLEDGED (DEV only)
- **Issue**: Local dev mode stores passwords in localStorage
- **Status**: Restricted to `import.meta.env.DEV` only, documented with warnings
- **Production**: Always use Firebase Auth

## Environment Variables

### Required
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Optional (DEV only)
```bash
VITE_MOCK_TEST_ADMIN_EMAIL=admin@example.com
```

## Deployment Checklist

1. [ ] Firebase config in Vercel environment variables
2. [ ] `firebase deploy --only firestore:rules` to update security rules
3. [ ] Set admin custom claims via Firebase Console
4. [ ] Delete any exposed service account keys and generate new ones
5. [ ] Enable Firebase App Check for production
6. [ ] Enable Cloud Armor or similar DDoS protection on Firebase hosting

## Reporting Security Issues

If you discover a security vulnerability, please report it to the maintainers immediately.