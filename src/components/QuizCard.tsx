import { useMemo, useState } from 'react'
import { useCity } from '../cities/CityContext'
import { useProgress } from '../progress/ProgressContext'

/** Miješanje s fiksnim sjemenom (id) – isti redoslijed pri svakom prikazu. */
function shuffled<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function QuizCard({ landmarkId, unlocked }: { landmarkId: string; unlocked: boolean }) {
  const q = useCity().city.quiz[landmarkId]
  const { progress, answerQuiz } = useProgress()
  const [picked, setPicked] = useState<string | null>(null)
  const options = useMemo(() => (q ? shuffled(q.options, landmarkId) : []), [q, landmarkId])
  if (!q) return null

  const answered = landmarkId in progress.quiz
  const correctAnswer = q.options[0]

  if (!unlocked) {
    return (
      <div className="quiz quiz-locked">
        <strong>🔒 Pitanje i pečat</strong>
        <p className="small muted">Dođi do ove znamenitosti da otključaš pitanje i dobiješ pečat u putovnicu.</p>
      </div>
    )
  }

  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    answerQuiz(landmarkId, o === correctAnswer)
  }

  // Već odgovoreno u nekoj ranijoj sesiji – samo prikaži rezultat.
  if (answered && !picked) {
    return (
      <div className="quiz">
        <strong>{progress.quiz[landmarkId] ? '★ Točno odgovoreno' : 'Pitanje odgovoreno'}</strong>
        <p className="small muted">{q.question} – {correctAnswer}</p>
      </div>
    )
  }

  return (
    <div className="quiz">
      <strong>Pitanje za pečat</strong>
      <p>{q.question}</p>
      <div className="quiz-options">
        {options.map((o) => {
          const state = !picked ? '' : o === correctAnswer ? ' correct' : o === picked ? ' wrong' : ' faded'
          return (
            <button key={o} className={`quiz-option${state}`} onClick={() => choose(o)} disabled={!!picked}>
              {o}
            </button>
          )
        })}
      </div>
      {picked && (
        <p className="small">
          {picked === correctAnswer ? '★ Točno! Pečat sa zvjezdicom ide u tvoju putovnicu.' : `Netočno – točan odgovor je „${correctAnswer}“. Pečat ipak dobivaš.`}
        </p>
      )}
    </div>
  )
}
