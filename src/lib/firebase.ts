import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * The app still runs without Firebase keys (markets and coin pages are public),
 * so we only initialise Firebase when the required keys are present.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export const googleProvider = new GoogleAuthProvider()

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super('Firebase is not configured. Add your Firebase keys to the .env file (see README).')
    this.name = 'FirebaseNotConfiguredError'
  }
}

export function getFirebaseAuth(): Auth {
  if (!auth) throw new FirebaseNotConfiguredError()
  return auth
}

export function getDb(): Firestore {
  if (!db) throw new FirebaseNotConfiguredError()
  return db
}
