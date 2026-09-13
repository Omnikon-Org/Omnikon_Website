import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  UserCredential
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || ""
};

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

async function getClientAuth() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!auth) {
    let config = { ...firebaseConfig };
    if (!config.apiKey) {
      try {
        const res = await fetch('/api/firebase/config');
        if (res.ok) {
          const remoteConfig = await res.json();
          config = { ...config, ...remoteConfig };
        }
      } catch (e) {
        console.warn('Failed to dynamically fetch Firebase config:', e);
      }
    }

    if (!config.apiKey) {
      throw new Error('Firebase Auth is not initialized. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY or FIREBASE_API_KEY is configured in your environment or restart the Next.js dev server.');
    }

    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
  }

  return auth;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('user');
githubProvider.addScope('repo');

export { googleProvider, githubProvider };

export async function signInWithGoogle(): Promise<UserCredential> {
  const instance = await getClientAuth();
  if (!instance) throw new Error('Firebase Auth is not available on server.');
  return await signInWithPopup(instance, googleProvider);
}

export async function signInWithGithub(): Promise<UserCredential> {
  const instance = await getClientAuth();
  if (!instance) throw new Error('Firebase Auth is not available on server.');
  return await signInWithPopup(instance, githubProvider);
}

export async function logoutFirebase(): Promise<void> {
  const instance = await getClientAuth();
  if (instance) {
    await firebaseSignOut(instance);
  }
}
