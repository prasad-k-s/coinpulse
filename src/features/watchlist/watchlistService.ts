import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { getDb } from '@/lib/firebase'

/** Firestore layout: users/{uid}/watchlist/{coinId} */
const watchlistCollection = (uid: string) => collection(getDb(), 'users', uid, 'watchlist')

export const watchlistService = {
  async getAll(uid: string): Promise<string[]> {
    const snapshot = await getDocs(query(watchlistCollection(uid), orderBy('addedAt', 'desc')))
    return snapshot.docs.map((d) => d.id)
  },

  async add(uid: string, coinId: string): Promise<void> {
    await setDoc(doc(watchlistCollection(uid), coinId), { coinId, addedAt: serverTimestamp() })
  },

  async remove(uid: string, coinId: string): Promise<void> {
    await deleteDoc(doc(watchlistCollection(uid), coinId))
  },
}
