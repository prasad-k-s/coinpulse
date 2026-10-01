import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth, googleProvider, isFirebaseConfigured } from '@/lib/firebase'
import type { AppUser } from '@/types'

/** Firebase User objects aren't serialisable, so Redux only stores these fields. */
export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  }
}

export const authService = {
  async signIn(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    return toAppUser(user)
  },

  async signUp(name: string, email: string, password: string): Promise<AppUser> {
    const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password)
    await updateProfile(user, { displayName: name })
    return { ...toAppUser(user), displayName: name }
  },

  async signInWithGoogle() {
    const { user } = await signInWithPopup(getFirebaseAuth(), googleProvider)
    return toAppUser(user)
  },

  async resetPassword(email: string) {
    await sendPasswordResetEmail(getFirebaseAuth(), email)
  },

  async updateDisplayName(name: string) {
    const user = getFirebaseAuth().currentUser
    if (!user) throw new Error('You are not signed in.')
    await updateProfile(user, { displayName: name })
  },

  async signOut() {
    await signOut(getFirebaseAuth())
  },

  /** Calls `callback` with the user (or null) whenever the session changes. Returns unsubscribe. */
  subscribe(callback: (user: AppUser | null) => void): () => void {
    if (!isFirebaseConfigured) {
      callback(null)
      return () => {}
    }
    return onAuthStateChanged(getFirebaseAuth(), (user) => callback(user ? toAppUser(user) : null))
  },
}

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.',
}

/** Turns Firebase error codes into friendly messages for the UI. */
export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: unknown }).code)
    if (FIREBASE_ERROR_MESSAGES[code]) return FIREBASE_ERROR_MESSAGES[code]
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}
