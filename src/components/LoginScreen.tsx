import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'

export function LoginScreen() {
  const { signInEmail, signUpEmail, signInGoogle, signInDemo, demoMode } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setError(null)
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nešto je pošlo po zlu.')
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    run(() => (mode === 'login' ? signInEmail(email, password) : signUpEmail(name, email, password)))
  }

  return (
    <main className="login">
      <div className="login-card">
        <h1 className="brand">Dićemo</h1>
        <p className="tagline">Prošeći gradom i poslušaj priče koje čuva.</p>

        <button className="btn btn-google" disabled={busy || demoMode} onClick={() => run(signInGoogle)}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/>
            <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/>
          </svg>
          Nastavi s Googleom
        </button>

        <div className="divider"><span>ili</span></div>

        <form onSubmit={onSubmit}>
          {mode === 'register' && (
            <input placeholder="Ime" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="E-mail" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input
            type="password"
            placeholder="Lozinka"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" disabled={busy || demoMode} type="submit">
            {mode === 'login' ? 'Prijava' : 'Izradi račun'}
          </button>
        </form>

        <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Nemaš račun? Registriraj se' : 'Već imaš račun? Prijavi se'}
        </button>

        {error && <p className="error">{error}</p>}

        {demoMode && (
          <div className="demo-note">
            <p>Firebase još nije postavljen, pa su prijave isključene.</p>
            <button className="btn btn-secondary" onClick={signInDemo}>Isprobaj kao gost</button>
          </div>
        )}
      </div>
    </main>
  )
}
