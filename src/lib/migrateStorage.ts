// Aplikacija se ranije zvala „Dićemo“: prenesi spremljeni napredak, odabrani grad i
// demo sadržaj sa starih ključeva (dicemo:*) na nove (lokallo:*). Može se ukloniti
// kad više nitko nema stare podatke.
export function migrateStorage() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const old = localStorage.key(i)
      if (!old?.startsWith('dicemo:')) continue
      const key = 'lokallo:' + old.slice('dicemo:'.length)
      if (localStorage.getItem(key) === null) localStorage.setItem(key, localStorage.getItem(old)!)
    }
  } catch {
    // pohrana nije dostupna – nema se što prenijeti
  }
}
