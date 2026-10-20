import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = config.apiKey ? initializeApp(config) : null

/** null kada Firebase nije konfiguriran – aplikacija tada radi u demo načinu. */
export const auth: Auth | null = app ? getAuth(app) : null

/** Je li baza sadržaja dostupna (Firebase konfiguriran). */
export const hasFirestore = !!app

let firestore: Promise<{ fs: Firestore; sdk: typeof import('firebase/firestore') }> | null = null

/**
 * Firestore SDK je velik, pa se učitava tek kad zatreba – prvi prikaz aplikacije
 * (spremljeni grad) ne čeka na njega.
 */
export function getFirestoreSdk() {
  if (!app) throw new Error('Firebase nije konfiguriran')
  firestore ??= import('firebase/firestore').then((sdk) => ({ sdk, fs: sdk.getFirestore(app) }))
  return firestore
}
