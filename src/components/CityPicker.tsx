import { cities } from '../cities'
import { useCity } from '../cities/CityContext'

export function CityPicker({ onClose }: { onClose: () => void }) {
  const { city: current, setCity } = useCity()
  return (
    <section className="sheet sheet-list" aria-label="Odaberi grad">
      <div className="sheet-handle" />
      <header className="sheet-header">
        <h2>Odaberi grad</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Zatvori">✕</button>
      </header>
      <ul className="list">
        {cities.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => {
                onClose()
                if (c.id !== current.id) setCity(c.id)
              }}
            >
              <span className="list-text">
                <strong>{c.name}</strong>
                <span className="muted small">
                  {c.landmarks.length} znamenitosti · {c.walks.length} {c.walks.length === 1 ? 'šetnja' : 'šetnje'}
                </span>
              </span>
              <span className="muted small">{c.id === current.id ? '✓' : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="muted small">Svaki grad ima svoju putovnicu, pečate i značke.</p>
    </section>
  )
}
