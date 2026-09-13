import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  UserCredential
} from 'firebase/auth';

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

async function getClientAuth() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!auth) {
    let config: any = {};
    try {
      const res = await fetch('/api/firebase/config');
      if (res.ok) {
        config = await res.json();
      }
    } catch (e) {
      console.warn('Failed to dynamically fetch Firebase config:', e);
    }

    if (!config.apiKey) {
      throw new Error('Firebase Auth is not initialized. Key is missing from server configuration.');
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
