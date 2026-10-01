import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import type { NewTransaction, Transaction } from './types'

/** Firestore layout: users/{uid}/transactions/{transactionId} */
const transactionsCollection = (uid: string) => collection(getDb(), 'users', uid, 'transactions')

export const transactionService = {
  async getAll(uid: string): Promise<Transaction[]> {
    const snapshot = await getDocs(query(transactionsCollection(uid), orderBy('date', 'desc')))
    return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) }))
  },

  async add(uid: string, transaction: NewTransaction): Promise<Transaction> {
    const data = { ...transaction, createdAt: Date.now() }
    const ref = await addDoc(transactionsCollection(uid), data)
    return { id: ref.id, ...data }
  },

  async remove(uid: string, transactionId: string): Promise<void> {
    await deleteDoc(doc(transactionsCollection(uid), transactionId))
  },
}
