import { useEffect, useState } from 'react'
import { categoryLabels, type Landmark } from '../data/landmarks'
import { formatDistance } from '../lib/geo'
import { photos } from '../data/photos'
import { ThenNow } from './ThenNow'
import { QuizCard } from './QuizCard'

interface Props {
  landmark: Landmark
  distance: number | null
  visited: boolean
  onClose: () => void
}

export function StoryPanel({ landmark, distance, visited, onClose }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => window.speechSynthesis?.cancel(), [landmark.id])

  const toggleSpeech = () => {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const u = new SpeechSynthesisUtterance([landmark.name, ...landmark.story].join('. '))
    u.lang = 'hr-HR'
    u.onend = () => setSpeaking(false)
    synth.speak(u)
    setSpeaking(true)
  }

  return (
    <section className="sheet" aria-label={landmark.name}>
      <div className="sheet-handle" />
      <header className="sheet-header">
        <div>
          <span className={`chip chip-${landmark.category}`}>{categoryLabels[landmark.category]}</span>
          {visited && <span className="chip chip-visited">✓ Posjećeno</span>}
          <h2>{landmark.name}</h2>
          {distance !== null && <p className="muted">{formatDistance(distance)} od tebe</p>}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Zatvori">✕</button>
      </header>
      <div className="sheet-body">
        {photos[landmark.id] && <ThenNow photos={photos[landmark.id]} alt={landmark.name} />}
        {canSpeak && (
          <button className="btn btn-secondary btn-small" onClick={toggleSpeech}>
            {speaking ? '■ Zaustavi' : '▶ Poslušaj priču'}
          </button>
        )}
        {landmark.story.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <QuizCard key={landmark.id} landmarkId={landmark.id} unlocked={visited} />
      </div>
    </section>
  )
}
