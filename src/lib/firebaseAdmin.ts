import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let _db: Firestore | null = null

export function getAdminDb(): Firestore {
  if (_db) return _db

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin credentials not configured')
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    })
  }

  _db = getFirestore()
  return _db
}

// Keep backward compat — but as a getter so it's lazy
export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const db = getAdminDb()
    const value = (db as any)[prop]
    if (typeof value === 'function') {
      return value.bind(db)
    }
    return value
  },
})
