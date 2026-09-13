import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

function getClientAuth() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  if (!auth) {
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

export { auth, googleProvider, githubProvider };

export async function signInWithGoogle(): Promise<UserCredential> {
  const instance = getClientAuth();
  if (!instance) throw new Error('Firebase Auth is not available on server.');
  return await signInWithPopup(instance, googleProvider);
}

export async function signInWithGithub(): Promise<UserCredential> {
  const instance = getClientAuth();
  if (!instance) throw new Error('Firebase Auth is not available on server.');
  return await signInWithPopup(instance, githubProvider);
}

export async function logoutFirebase(): Promise<void> {
  const instance = getClientAuth();
  if (instance) {
    await firebaseSignOut(instance);
  }
}
