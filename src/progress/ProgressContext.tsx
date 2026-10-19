import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { badges, isEarned, type Badge, type Progress } from '../data/badges'

// Lokalna pohrana napretka. Kasnije se može prebaciti u Firestore radi sinkronizacije
// između uređaja.
const key = (uid: string) => `dicemo:progress:${uid}`
const empty: Progress = { visited: [], quiz: {}, walks: [] }

function load(uid: string): Progress {
  try {
    const saved = localStorage.getItem(key(uid))
    if (saved) return { ...empty, ...JSON.parse(saved) }
    // stariji format: samo popis posjećenih
    const legacy = localStorage.getItem(`dicemo:visited:${uid}`)
    return legacy ? { ...empty, visited: JSON.parse(legacy) } : empty
  } catch {
    return empty
  }
}

interface ProgressValue {
  progress: Progress
  markVisited: (id: string) => void
  answerQuiz: (id: string, correct: boolean) => void
  completeWalk: (id: string) => void
  /** Upravo osvojena značka (za obavijest) */
  newBadge: Badge | null
  dismissBadge: () => void
}

const ProgressContext = createContext<ProgressValue | null>(null)

export function ProgressProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [progress, setProgress] = useState(() => load(uid))
  const [newBadge, setNewBadge] = useState<Badge | null>(null)
  // Ref drži najnovije stanje kako se uzastopne izmjene u istom trenutku ne bi pregazile.
  const latest = useRef(progress)

  useEffect(() => {
    try {
      localStorage.setItem(key(uid), JSON.stringify(progress))
    } catch {
      // pohrana nije dostupna (privatni način) – napredak vrijedi samo za ovu sesiju
    }
  }, [uid, progress])

  const update = useCallback((fn: (p: Progress) => Progress) => {
    const prev = latest.current
    const next = fn(prev)
    if (next === prev) return
    latest.current = next
    setProgress(next)
    const unlocked = badges.find((b) => !isEarned(b, prev) && isEarned(b, next))
    if (unlocked) setNewBadge(unlocked)
  }, [])

  // Akcije su stabilne (ne mijenjaju se s napretkom), pa se mogu koristiti u ovisnostima hookova.
  const actions = useMemo(
    () => ({
      markVisited: (id: string) => update((p) => (p.visited.includes(id) ? p : { ...p, visited: [...p.visited, id] })),
      answerQuiz: (id: string, correct: boolean) =>
        update((p) => (id in p.quiz ? p : { ...p, quiz: { ...p.quiz, [id]: correct } })),
      completeWalk: (id: string) => update((p) => (p.walks.includes(id) ? p : { ...p, walks: [...p.walks, id] })),
      dismissBadge: () => setNewBadge(null),
    }),
    [update],
  )
  const value = useMemo<ProgressValue>(() => ({ ...actions, progress, newBadge }), [actions, progress, newBadge])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress mora biti unutar ProgressProvider')
  return ctx
}
