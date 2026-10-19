import { badges, isEarned, REWARD } from '../data/badges'
import { landmarks } from '../data/landmarks'
import { useAuth } from '../auth/AuthContext'
import { useProgress } from '../progress/ProgressContext'

export function PassportScreen() {
  const { user } = useAuth()
  const { progress } = useProgress()
  const stamps = progress.visited.length
  const correct = Object.values(progress.quiz).filter(Boolean).length
  const earned = badges.filter((b) => isEarned(b, progress)).length
  const rewardReady = stamps >= REWARD.stamps

  return (
    <div className="screen">
      <header className="screen-header">
        <h1 className="brand brand-small">Putovnica</h1>
        <p className="muted small">{user?.name} · Rijeka</p>
        <div className="stats">
          <div><strong>{stamps}/{landmarks.length}</strong><span>pečata</span></div>
          <div><strong>{correct}</strong><span>točnih odgovora</span></div>
          <div><strong>{earned}/{badges.length}</strong><span>znački</span></div>
        </div>
      </header>

      <div className="screen-body">
        <h2 className="section-title">Pečati</h2>
        <div className="stamps">
          {landmarks.map((l, i) => {
            const has = progress.visited.includes(l.id)
            return (
              <div key={l.id} className={`stamp${has ? ` stamp-on stamp-${l.category}` : ''}`} style={{ rotate: has ? `${(i % 5) * 4 - 8}deg` : undefined }}>
                {has ? (
                  <>
                    {progress.quiz[l.id] && <span className="stamp-star">★</span>}
                    <span className="stamp-name">{l.name.replace(/\s*\(.*\)/, '')}</span>
                    <span className="stamp-city">RIJEKA</span>
                  </>
                ) : (
                  <span className="stamp-unknown">?</span>
                )}
              </div>
            )
          })}
        </div>

        <h2 className="section-title">Nagrada</h2>
        <div className={`reward${rewardReady ? ' reward-ready' : ''}`}>
          <div className="reward-icon">☕</div>
          <div className="reward-main">
            <strong>{REWARD.title}</strong>
            {rewardReady ? (
              <p className="small">Pokaži ovaj kod konobaru: <code>DICEMO-{user?.uid.slice(0, 4).toUpperCase()}</code></p>
            ) : (
              <p className="small muted">Još {REWARD.stamps - stamps} pečata do nagrade.</p>
            )}
            <div className="progress"><div style={{ width: `${Math.min(stamps / REWARD.stamps, 1) * 100}%` }} /></div>
            <p className="small muted">Primjer – partnerski kafići još nisu dogovoreni.</p>
          </div>
        </div>

        <h2 className="section-title">Značke</h2>
        <ul className="badges">
          {badges.map((b) => {
            const [done, total] = b.progress(progress)
            const on = done >= total
            return (
              <li key={b.id} className={on ? 'badge-on' : ''}>
                <span className="badge-icon">{b.icon}</span>
                <span className="badge-text">
                  <strong>{b.title}</strong>
                  <span className="small muted">{b.description}</span>
                </span>
                <span className="small muted">{on ? '✓' : `${done}/${total}`}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
