import type { Landmark } from '../data/landmarks'
import type { Walk } from '../data/walks'
import { formatDistance } from '../lib/geo'

interface Props {
  walk: Walk
  reachedCount: number
  target: Landmark | null
  hint?: string
  distance: number | null
  routed: boolean
  onStory: () => void
  onNext: () => void
  onEnd: () => void
}

export function WalkBanner({ walk, reachedCount, target, hint, distance, routed, onStory, onNext, onEnd }: Props) {
  const total = walk.stops.length
  return (
    <div className="walk-banner" role="status">
      <div className="walk-banner-top">
        <span className="toast-kicker">
          {walk.title} · {Math.min(reachedCount + (target ? 1 : 0), total)}/{total}
        </span>
        <button className="icon-btn icon-btn-small" onClick={onEnd} aria-label="Završi šetnju">✕</button>
      </div>
      <div className="progress"><div style={{ width: `${(reachedCount / total) * 100}%` }} /></div>

      {target ? (
        <>
          <p className="toast-title">
            Sljedeće: {target.name}
            {distance !== null && <span className="muted"> · {formatDistance(distance)}</span>}
          </p>
          {hint && <p className="small muted">{hint}</p>}
          {!routed && <p className="small muted">Linija na karti je orijentacijska, prati ulice.</p>}
          <div className="walk-banner-actions">
            <button className="btn btn-secondary btn-small" onClick={onStory}>Priča</button>
            <button className="btn btn-primary btn-small" onClick={onNext}>Stigao sam</button>
          </div>
        </>
      ) : (
        <>
          <p className="toast-title">Bravo, obišao si cijelu šetnju! 🎉</p>
          <div className="walk-banner-actions">
            <button className="btn btn-primary btn-small" onClick={onEnd}>Završi</button>
          </div>
        </>
      )}
    </div>
  )
}
