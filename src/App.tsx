import { useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { EventsScreen } from './components/EventsScreen'
import { LoginScreen } from './components/LoginScreen'
import { MapScreen } from './components/MapScreen'
import { TabBar, type Tab } from './components/TabBar'

function Shell() {
  const [tab, setTab] = useState<Tab>('karta')
  return (
    <div className="shell">
      {/* Karta ostaje montirana kako bi praćenje lokacije i obavijesti radili i dok je otvoren drugi tab. */}
      <MapScreen />
      {tab === 'dogadanja' && <EventsScreen />}
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <div className="splash">Dićemo</div>
  // key: novi korisnik dobiva svježe stanje (posjećene znamenitosti, simulacija…)
  return user ? <Shell key={user.uid} /> : <LoginScreen />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
