import { useState } from 'react'
import type { LandmarkPhotos, Photo } from '../data/photos'

const url = (p: Photo) => `${import.meta.env.BASE_URL}${p.src}`

function Credit({ photo, label }: { photo: Photo; label?: string }) {
  const text = [label, photo.credit, photo.license].filter(Boolean).join(' · ')
  return photo.sourceUrl ? (
    <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{text}</a>
  ) : (
    <span>{text}</span>
  )
}

/** Usporedba stare i današnje fotografije klizačem; s jednom fotografijom prikazuje samo nju. */
export function ThenNow({ photos, alt }: { photos: LandmarkPhotos; alt: string }) {
  const [pos, setPos] = useState(50)
  const { then, now } = photos

  if (!then || !now) {
    const only = then ?? now
    if (!only) return null
    return (
      <figure className="thennow">
        <div className="thennow-frame">
          <img src={url(only)} alt={`${alt} – ${only.year ?? ''}`} />
          {only.year && <span className="thennow-label left">{only.year}</span>}
        </div>
        <figcaption><Credit photo={only} /></figcaption>
      </figure>
    )
  }

  return (
    <figure className="thennow">
      <div className="thennow-frame" style={{ '--pos': `${pos}%` } as React.CSSProperties}>
        <img src={url(now)} alt={`${alt} danas`} />
        <img className="thennow-then" src={url(then)} alt={`${alt} nekad (${then.year ?? ''})`} />
        <div className="thennow-divider" aria-hidden="true"><span>⇆</span></div>
        <span className="thennow-label left">{then.year ?? 'Nekad'}</span>
        <span className="thennow-label right">{now.year ?? 'Danas'}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Usporedi nekad i danas"
        />
      </div>
      <figcaption>
        <Credit photo={then} label="Nekad" />
        <Credit photo={now} label="Danas" />
      </figcaption>
    </figure>
  )
}
