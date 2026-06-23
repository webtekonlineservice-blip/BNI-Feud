import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

function initAdmin(): App | null {
  if (getApps().length) return getApps()[0]

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin: missing credentials, skipping initialization')
    return null
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  })
}

const app = initAdmin()
export const adminDb: Firestore = getFirestore(app!)
