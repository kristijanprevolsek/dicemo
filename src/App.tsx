import { useState } from 'react'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { EventsScreen } from './components/EventsScreen'
import { LoginScreen } from './components/LoginScreen'
import { MapScreen } from './components/MapScreen'
import { TabBar, type Tab } from './components/TabBar'
import { WalksScreen } from './components/WalksScreen'
import { PassportScreen } from './components/PassportScreen'
import { BadgeToast } from './components/BadgeToast'
import { ProgressProvider } from './progress/ProgressContext'
import type { Walk } from './data/walks'

function Shell() {
  const [tab, setTab] = useState<Tab>('karta')
  const [walk, setWalk] = useState<Walk | null>(null)
  return (
    <div className="shell">
      {/* Karta ostaje montirana kako bi praćenje lokacije i obavijesti radili i dok je otvoren drugi tab. */}
      <MapScreen walk={walk} onEndWalk={() => setWalk(null)} />
      {tab === 'setnje' && (
        <WalksScreen
          onStart={(w) => {
            setWalk(w)
            setTab('karta')
          }}
        />
      )}
      {tab === 'putovnica' && <PassportScreen />}
      {tab === 'dogadanja' && <EventsScreen />}
      <BadgeToast />
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}

function Root() {
  const { user, loading } = useAuth()
  if (loading) return <div className="splash">Dićemo</div>
  // key: novi korisnik dobiva svježe stanje (posjećene znamenitosti, simulacija…)
  return user ? (
    <ProgressProvider key={user.uid} uid={user.uid}>
      <Shell />
    </ProgressProvider>
  ) : (
    <LoginScreen />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
