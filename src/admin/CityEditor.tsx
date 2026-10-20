import { useMemo, useRef, useState } from 'react'
import { bundledCities } from '../cities'
import type { City } from '../cities/types'
import { validateCities } from '../cities/validate'
import { contentRepo } from '../content/repository'
import { LandmarksEditor } from './LandmarksEditor'
import { SettingsEditor } from './SettingsEditor'
import { WalksEditor } from './WalksEditor'
import { downloadJson } from './util'

type Tab = 'znamenitosti' | 'setnje' | 'grad'

interface Props {
  published: City
  allCities: City[]
  editorUid: string
  onPublished: (city: City | null) => void
}

export function CityEditor({ published, allCities, editorUid, onPublished }: Props) {
  const [draft, setDraft] = useState(published)
  const [tab, setTab] = useState<Tab>('znamenitosti')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const dirty = JSON.stringify(draft) !== JSON.stringify(published)
  const errors = useMemo(
    () => validateCities(allCities.map((c) => (c.id === draft.id ? draft : c))),
    [draft, allCities],
  ).filter((e) => e.includes(draft.name) || e.includes(draft.id))
  const isBundled = bundledCities.some((c) => c.id === draft.id)

  const update = (fn: (c: City) => City) => {
    setDraft(fn)
    setMessage(null)
  }

  const publish = async () => {
    setBusy(true)
    try {
      await contentRepo.save(draft, editorUid)
      onPublished(draft)
      setMessage(contentRepo.kind === 'firestore' ? 'Objavljeno – korisnici vide izmjene pri sljedećem otvaranju aplikacije.' : 'Spremljeno u ovom pregledniku (demo).')
    } catch (e) {
      setMessage(`Greška pri spremanju: ${e instanceof Error ? e.message : e}`)
    } finally {
      setBusy(false)
    }
  }

  const resetToOriginal = async () => {
    const what = isBundled ? 'Vratiti grad na izvorni ugrađeni sadržaj? Sve objavljene izmjene bit će izgubljene.' : `Obrisati grad ${draft.name}?`
    if (!confirm(what)) return
    await contentRepo.remove(draft.id)
    onPublished(null)
  }

  const importJson = async (file: File) => {
    try {
      const city = JSON.parse(await file.text()) as City
      if (city.id !== draft.id && !confirm(`Datoteka je za grad „${city.id}“, a uređuješ „${draft.id}“. Svejedno učitati?`)) return
      setDraft({ ...city, id: draft.id })
      setMessage('Datoteka učitana – pregledaj i objavi.')
    } catch {
      setMessage('Datoteka nije ispravan JSON grada.')
    }
  }

  return (
    <div className="admin-editor">
      <nav className="admin-tabs">
        {(
          [
            ['znamenitosti', `Znamenitosti (${draft.landmarks.length})`],
            ['setnje', `Šetnje (${draft.walks.length})`],
            ['grad', 'Grad, nagrada i značke'],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </nav>

      {tab === 'znamenitosti' && <LandmarksEditor key={draft.id} city={draft} allCities={allCities} onChange={update} />}
      {tab === 'setnje' && <WalksEditor key={draft.id} city={draft} onChange={update} />}
      {tab === 'grad' && <SettingsEditor city={draft} onChange={update} />}

      <footer className="admin-bar">
        <div className="grow">
          {errors.length > 0 ? (
            <button className="link admin-errors-toggle" onClick={() => setShowErrors((v) => !v)}>
              ⚠ {errors.length} {errors.length === 1 ? 'problem' : 'problema'} prije objave {showErrors ? '▴' : '▾'}
            </button>
          ) : (
            <span className="admin-ok">✓ Spremno za objavu</span>
          )}
          {message && <span className="admin-msg">{message}</span>}
          {showErrors && errors.length > 0 && (
            <ul className="admin-errors">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>
        <button className="btn btn-secondary btn-small" onClick={() => downloadJson(`${draft.id}.json`, draft)}>Izvezi</button>
        <button className="btn btn-secondary btn-small" onClick={() => fileInput.current?.click()}>Uvezi</button>
        <input ref={fileInput} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        <button className="btn btn-secondary btn-small" onClick={resetToOriginal}>{isBundled ? 'Vrati izvorno' : 'Obriši grad'}</button>
        <button className="btn btn-secondary btn-small" disabled={!dirty || busy} onClick={() => setDraft(published)}>Odbaci</button>
        <button className="btn btn-primary btn-small" disabled={!dirty || busy || errors.length > 0} onClick={publish}>
          {busy ? 'Spremam…' : 'Objavi'}
        </button>
      </footer>
    </div>
  )
}
