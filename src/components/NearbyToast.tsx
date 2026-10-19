import type { Landmark } from '../data/landmarks'

interface Props {
  landmark: Landmark
  onOpen: () => void
  onDismiss: () => void
}

export function NearbyToast({ landmark, onOpen, onDismiss }: Props) {
  return (
    <div className="toast" role="status">
      <div>
        <p className="toast-kicker">Prolaziš pored</p>
        <p className="toast-title">{landmark.name}</p>
      </div>
      <div className="toast-actions">
        <button className="btn btn-primary btn-small" onClick={onOpen}>Priča</button>
        <button className="icon-btn" onClick={onDismiss} aria-label="Odbaci">✕</button>
      </div>
    </div>
  )
}
