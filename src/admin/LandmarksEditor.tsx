import { useState } from 'react'
import { categoryLabels, type Category, type City, type Landmark, type QuizQuestion } from '../cities/types'
import { LocationMap } from './LocationMap'
import { slugify, uniqueLandmarkId } from './util'

interface Props {
  city: City
  allCities: City[]
  onChange: (fn: (c: City) => City) => void
}

const emptyQuiz: QuizQuestion = { question: '', options: ['', '', ''] }

export function LandmarksEditor({ city, allCities, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(city.landmarks[0]?.id ?? null)
  const [newName, setNewName] = useState('')
  const selected = city.landmarks.find((l) => l.id === selectedId) ?? null
  const quiz = selected ? (city.quiz[selected.id] ?? emptyQuiz) : emptyQuiz

  const patch = (changes: Partial<Landmark>) =>
    onChange((c) => ({ ...c, landmarks: c.landmarks.map((l) => (l.id === selectedId ? { ...l, ...changes } : l)) }))

  const patchQuiz = (q: QuizQuestion) => onChange((c) => ({ ...c, quiz: { ...c.quiz, [selectedId!]: q } }))

  const add = () => {
    const name = newName.trim()
    if (!name) return
    const prefix = city.id === 'rijeka' ? '' : `${city.id.slice(0, 2)}-`
    const id = uniqueLandmarkId(prefix + slugify(name), allCities)
    const l: Landmark = { id, name, category: 'povijest', lat: city.center[0], lng: city.center[1], radius: 45, summary: '', story: [''] }
    onChange((c) => ({ ...c, landmarks: [...c.landmarks, l], quiz: { ...c.quiz, [id]: emptyQuiz } }))
    setSelectedId(id)
    setNewName('')
  }

  const remove = () => {
    if (!selected || !confirm(`Obrisati „${selected.name}“? Uklonit će se i iz šetnji i znački.`)) return
    const id = selected.id
    onChange((c) => {
      const quizRest = { ...c.quiz }
      delete quizRest[id]
      return {
        ...c,
        landmarks: c.landmarks.filter((l) => l.id !== id),
        quiz: quizRest,
        walks: c.walks.map((w) => ({ ...w, stops: w.stops.filter((s) => s.landmarkId !== id) })),
        badges: c.badges.map((b) => ({ ...b, landmarkIds: b.landmarkIds.filter((x) => x !== id) })),
      }
    })
    setSelectedId(city.landmarks.find((l) => l.id !== id)?.id ?? null)
  }

  return (
    <div className="admin-split">
      <aside className="admin-list">
        <form
          className="admin-add"
          onSubmit={(e) => {
            e.preventDefault()
            add()
          }}
        >
          <input placeholder="Naziv nove znamenitosti" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button className="btn btn-primary btn-small" disabled={!newName.trim()}>Dodaj</button>
        </form>
        <ul>
          {city.landmarks.map((l) => (
            <li key={l.id}>
              <button className={l.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(l.id)}>
                <span className={`dot dot-${l.category}`} />
                {l.name || <em>bez naziva</em>}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {selected ? (
        <section className="admin-form">
          <div className="admin-row">
            <label className="grow">
              Naziv
              <input value={selected.name} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label>
              Kategorija
              <select value={selected.category} onChange={(e) => patch({ category: e.target.value as Category })}>
                {(Object.keys(categoryLabels) as Category[]).map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Kratki opis <span className="hint">(jedna rečenica u popisu)</span>
            <input value={selected.summary} onChange={(e) => patch({ summary: e.target.value })} />
          </label>
          <label>
            Priča <span className="hint">(odlomke odvoji praznim redom)</span>
            <textarea
              rows={10}
              value={selected.story.join('\n\n')}
              onChange={(e) => patch({ story: e.target.value.split(/\n\s*\n/) })}
            />
          </label>

          <fieldset>
            <legend>Lokacija</legend>
            <p className="hint">Klikni na kartu ili povuci oznaku. Krug pokazuje gdje se korisniku nudi priča.</p>
            <div className="admin-row">
              <label>
                Širina
                <input type="number" step="0.00001" value={selected.lat} onChange={(e) => patch({ lat: Number(e.target.value) })} />
              </label>
              <label>
                Dužina
                <input type="number" step="0.00001" value={selected.lng} onChange={(e) => patch({ lng: Number(e.target.value) })} />
              </label>
              <label className="grow">
                Radijus: {selected.radius} m
                <input type="range" min={20} max={150} step={5} value={selected.radius} onChange={(e) => patch({ radius: Number(e.target.value) })} />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Pitanje za kviz</legend>
            <label>
              Pitanje
              <input value={quiz.question} onChange={(e) => patchQuiz({ ...quiz, question: e.target.value })} />
            </label>
            {quiz.options.map((o, i) => (
              <label key={i} className={i === 0 ? 'correct' : ''}>
                {i === 0 ? 'Točan odgovor' : `Netočan odgovor ${i}`}
                <input
                  value={o}
                  onChange={(e) => {
                    const options = [...quiz.options] as QuizQuestion['options']
                    options[i] = e.target.value
                    patchQuiz({ ...quiz, options })
                  }}
                />
              </label>
            ))}
            <p className="hint">Redoslijed odgovora se u aplikaciji miješa.</p>
          </fieldset>

          <div className="admin-row">
            <span className="hint">id: {selected.id}</span>
            <button className="btn btn-danger btn-small" onClick={remove}>Obriši znamenitost</button>
          </div>
        </section>
      ) : (
        <section className="admin-form admin-empty">Dodaj prvu znamenitost u popisu lijevo.</section>
      )}

      <LocationMap
        center={city.center}
        zoom={city.zoom}
        landmarks={city.landmarks}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onPick={selected ? (lat, lng) => patch({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) }) : undefined}
      />
    </div>
  )
}
