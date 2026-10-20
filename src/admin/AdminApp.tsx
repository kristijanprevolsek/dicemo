import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { bundledCities } from '../cities'
import type { City } from '../cities/types'
import { LoginScreen } from '../components/LoginScreen'
import { contentRepo } from '../content/repository'
import { CityEditor } from './CityEditor'
import { newCity, slugify } from './util'

export function AdminApp() {
  const { user, loading, signOut } = useAuth()
  const [cities, setCities] = useState<City[] | null>(null)
  const [allowed, setAllowed] = useState<string[] | null | undefined>(undefined)
  const [cityId, setCityId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([contentRepo.load(), contentRepo.editableCities(user.uid)])
      .then(([list, editable]) => {
        setCities(list)
        setAllowed(editable)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [user])

  if (loading) return <div className="splash">Dićemo</div>
  if (!user) return <LoginScreen />
  if (error) return <AdminMessage title="Greška pri učitavanju" text={error} onSignOut={signOut} />
  if (!cities || allowed === undefined) return <div className="splash">Učitavam…</div>
  if (allowed === null)
    return (
      <AdminMessage
        title="Nemaš prava uređivanja"
        text={`Pošalji administratoru svoj korisnički id: ${user.uid}`}
        onSignOut={signOut}
      />
    )

  const canEdit = (id: string) => allowed.includes('*') || allowed.includes(id)
  const editable = cities.filter((c) => canEdit(c.id))
  const current = editable.find((c) => c.id === cityId) ?? editable[0]

  const createCity = () => {
    const name = newName.trim()
    const id = slugify(name)
    if (!id || cities.some((c) => c.id === id)) return alert('Grad s tim imenom već postoji.')
    const city = newCity(id, name, `u gradu ${name}`)
    setCities([...cities, city])
    setCityId(id)
    setNewName('')
  }

  const onPublished = (city: City | null) => {
    if (city) setCities(cities.map((c) => (c.id === city.id ? city : c)))
    else {
      // vraćeno na izvorno / obrisano
      const original = bundledCities.find((c) => c.id === current?.id)
      setCities(original ? cities.map((c) => (c.id === original.id ? original : c)) : cities.filter((c) => c.id !== current?.id))
      if (!original) setCityId(null)
    }
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <h1 className="brand brand-small">Dićemo · uređivanje</h1>
        <select value={current?.id ?? ''} onChange={(e) => setCityId(e.target.value)}>
          {editable.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {allowed.includes('*') && (
          <form
            className="admin-add"
            onSubmit={(e) => {
              e.preventDefault()
              createCity()
            }}
          >
            <input placeholder="Novi grad…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button className="btn btn-secondary btn-small" disabled={!newName.trim()}>Dodaj grad</button>
          </form>
        )}
        <span className="grow" />
        <span className={`admin-mode admin-mode-${contentRepo.kind}`}>
          {contentRepo.kind === 'firestore' ? 'Baza: Firestore' : 'Demo: sprema se samo u ovom pregledniku'}
        </span>
        <a className="btn btn-secondary btn-small" href="./" target="_blank" rel="noreferrer">Otvori aplikaciju</a>
        <button className="btn btn-secondary btn-small" onClick={signOut}>Odjava ({user.name})</button>
      </header>
      {current ? (
        <CityEditor key={current.id} published={current} allCities={cities} editorUid={user.uid} onPublished={onPublished} />
      ) : (
        <div className="admin-empty">Nemaš dodijeljenih gradova.</div>
      )}
    </div>
  )
}

function AdminMessage({ title, text, onSignOut }: { title: string; text: string; onSignOut: () => void }) {
  return (
    <main className="login">
      <div className="login-card">
        <h1 className="brand brand-small">{title}</h1>
        <p className="muted">{text}</p>
        <button className="btn btn-secondary" onClick={onSignOut}>Odjava</button>
      </div>
    </main>
  )
}
