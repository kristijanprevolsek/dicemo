// Lokalna pohrana posjećenih znamenitosti. Kasnije se može prebaciti u Firestore
// kako bi se napredak sinkronizirao između uređaja.
const key = (uid: string) => `dicemo:visited:${uid}`

export function loadVisited(uid: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key(uid)) ?? '[]'))
  } catch {
    return new Set()
  }
}

export function saveVisited(uid: string, visited: Set<string>) {
  try {
    localStorage.setItem(key(uid), JSON.stringify([...visited]))
  } catch {
    // pohrana nije dostupna (privatni način) – napredak vrijedi samo za ovu sesiju
  }
}
