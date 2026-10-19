import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginScreen } from './components/LoginScreen'
import { MapScreen } from './components/MapScreen'

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <div className="splash">Dićemo</div>
  // key: novi korisnik dobiva svježe stanje (posjećene znamenitosti, simulacija…)
  return user ? <MapScreen key={user.uid} /> : <LoginScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
