export type Tab = 'karta' | 'setnje' | 'dogadanja'

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'karta', label: 'Karta', icon: '🗺️' },
  { id: 'setnje', label: 'Šetnje', icon: '🚶' },
  { id: 'dogadanja', label: 'Događanja', icon: '📅' },
]

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={active === t.id ? 'active' : ''}
          aria-current={active === t.id ? 'page' : undefined}
          onClick={() => onChange(t.id)}
        >
          <span aria-hidden="true">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
