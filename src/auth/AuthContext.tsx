import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

export interface AppUser {
  uid: string
  name: string
  email: string | null
}

interface AuthValue {
  user: AppUser | null
  loading: boolean
  demoMode: boolean
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (name: string, email: string, password: string) => Promise<void>
  signInGoogle: () => Promise<void>
  signInDemo: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

const DEMO_USER: AppUser = { uid: 'demo', name: 'Gost', email: null }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(!!auth)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, name: u.displayName ?? u.email ?? 'Korisnik', email: u.email } : null)
      setLoading(false)
    })
  }, [])

  const requireAuth = () => {
    if (!auth) throw new Error('Firebase nije konfiguriran. Koristi demo prijavu ili postavi .env.')
    return auth
  }

  const value: AuthValue = {
    user,
    loading,
    demoMode: !auth,
    signInEmail: async (email, password) => {
      await signInWithEmailAndPassword(requireAuth(), email, password)
    },
    signUpEmail: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(requireAuth(), email, password)
      await updateProfile(cred.user, { displayName: name })
      setUser({ uid: cred.user.uid, name, email })
    },
    signInGoogle: async () => {
      // Na webu radi popup. U nativnoj (Capacitor) aplikaciji zamijeniti s
      // @capacitor-firebase/authentication – vidi README.
      await signInWithPopup(requireAuth(), new GoogleAuthProvider())
    },
    signInDemo: () => setUser(DEMO_USER),
    signOut: async () => {
      if (auth) await fbSignOut(auth)
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth mora biti unutar AuthProvider')
  return ctx
}
