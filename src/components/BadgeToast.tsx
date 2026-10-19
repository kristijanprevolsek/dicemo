import { useEffect } from 'react'
import { useProgress } from '../progress/ProgressContext'

export function BadgeToast() {
  const { newBadge, dismissBadge } = useProgress()
  useEffect(() => {
    if (!newBadge) return
    navigator.vibrate?.([100, 60, 100])
    const t = setTimeout(dismissBadge, 5000)
    return () => clearTimeout(t)
  }, [newBadge, dismissBadge])
  if (!newBadge) return null
  return (
    <button className="badge-toast" onClick={dismissBadge}>
      <span className="badge-toast-icon">{newBadge.icon}</span>
      <span>
        <span className="toast-kicker">Nova značka!</span>
        <strong>{newBadge.title}</strong>
      </span>
    </button>
  )
}
