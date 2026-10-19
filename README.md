# Dićemo – priče Rijeke

Interaktivna karta Rijeke sa znamenitostima. Kad korisnik prolazi pored neke znamenitosti
(npr. katedrale sv. Vida), aplikacija mu ponudi priču o njoj, koju može pročitati ili poslušati.

**Stack:** React + TypeScript + Vite · Leaflet/OpenStreetMap · Firebase Auth (e-mail i Google) ·
Capacitor (isti kod se pakira kao iOS i Android aplikacija).

## Pokretanje

```bash
npm install
npm run dev          # http://localhost:5173
```

Bez Firebase konfiguracije aplikacija radi u **demo načinu**: prijave su isključene, a
korisnik ulazi kao gost.

### Testiranje bez šetnje po Rijeci

Gumb 🚶 uključuje **simulaciju**: dodirni bilo koje mjesto na karti i aplikacija se ponaša kao
da si tamo. Dodirni katedralu sv. Vida i pojavit će se obavijest „Prolaziš pored…“.

## Prijava (Firebase)

1. Na [console.firebase.google.com](https://console.firebase.google.com) napravi projekt i dodaj web aplikaciju.
2. Pod **Authentication → Sign-in method** uključi *Email/Password* i *Google*.
3. Kopiraj `.env.example` u `.env` i upiši vrijednosti iz web aplikacije.
4. Pod **Authentication → Settings → Authorized domains** dodaj domenu na kojoj će web verzija živjeti.

## Mobilne aplikacije (Capacitor)

```bash
npm run build
npx cap add ios        # treba macOS + Xcode
npx cap add android    # treba Android Studio
npx cap sync
npx cap open ios       # ili: npx cap open android
```

Nakon dodavanja platformi u nativne projekte treba upisati opise za dozvolu lokacije:
- iOS `Info.plist`: `NSLocationWhenInUseUsageDescription`
- Android `AndroidManifest.xml`: `ACCESS_FINE_LOCATION` i `ACCESS_COARSE_LOCATION`

Lokacija ide preko `@capacitor/geolocation`, koji na webu koristi preglednik, a na mobitelu GPS.

**Google prijava na mobitelu:** `signInWithPopup` ne radi unutar nativnog WebViewa. Za iOS i
Android treba dodati [`@capacitor-firebase/authentication`](https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/authentication)
i u `src/auth/AuthContext.tsx` na nativnoj platformi pozvati njegov `signInWithGoogle()`.

## Događanja (tab)

Tab **Događanja** prikazuje koncerte, kazalište, sport i ostala događanja u Rijeci i okolici
za sljedećih 10 dana, s filtrima po kategoriji i području (Rijeka / okolica).

Aplikacija čita jedan JSON feed (`VITE_EVENTS_FEED_URL`). To je polje objekata u formatu
`CityEvent` iz `src/data/events.ts`:

```json
[{ "id": "hnk-2026-10-21", "title": "…", "category": "kazaliste",
   "start": "2026-10-21T19:30:00+02:00", "venue": "HNK Ivana pl. Zajca",
   "place": "Rijeka", "price": "od 15 €", "url": "https://…" }]
```

Dok feed nije postavljen, prikazuje se **primjer podataka** s jasnom oznakom da događanja nisu stvarna.

### Kako puniti feed

Za Rijeku ne postoji jedan javni API sa svim događanjima, pa feed puni mali pozadinski
**agregator**. Najjednostavnije je napraviti Firebase Cloud Function koja se pokreće
svakih nekoliko sati, skupi podatke iz izvora, ukloni duplikate i zapiše rezultat u
Firestore ili kao JSON u Storage.

| Izvor | Što pokriva | Način |
|---|---|---|
| TZ grada Rijeke (visitrijeka.hr) | gradske manifestacije, festivali | dogovor o feedu ili scraping kalendara |
| HNK Ivana pl. Zajca | opera, drama, balet | raspored s weba |
| HNK Rijeka / HNL | nogometne utakmice | raspored lige (npr. API-Football ima HNL) |
| Entrio, Ulaznice.hr | koncerti, klubovi, predstave | partnerski pristup / affiliate feed |
| Ticketmaster Discovery API | veliki koncerti | javni API (slaba pokrivenost u HR) |
| TZ Opatija, Kastav, Kvarner | okolica | njihovi kalendari |
| Ručni unos | sve ostalo | jednostavan obrazac za organizatore (admin u Firestoreu) |

Prije scrapinga treba provjeriti uvjete korištenja svake stranice. Bolje je dogovoriti
partnerstvo, npr. s TZ-om, kojima je u interesu da se njihova događanja vide.

## Struktura

```
src/
  data/landmarks.ts      znamenitosti: koordinate, radijus okidanja, priče
  hooks/useLocation.ts   praćenje GPS lokacije (web + nativno)
  hooks/useProximity.ts  otkriva ulazak u radijus znamenitosti
  auth/AuthContext.tsx   Firebase prijava (e-mail, Google, demo gost)
  data/events.ts         model događanja + primjer podataka
  lib/events.ts          učitavanje feeda, filtriranje na 10 dana, grupiranje po danu
  components/            prijava, karta, događanja, tab bar, panel s pričom
```

Nova znamenitost dodaje se kao novi zapis u `src/data/landmarks.ts`.

## Prije objave

- [ ] **Provjeriti koordinate** svih znamenitosti na terenu (trenutno su približne).
- [ ] **Stručno pregledati tekstove priča** (povjesničar ili TZ Rijeka) i dodati fotografije.
- [ ] Za produkciju zamijeniti javne OSM pločice komercijalnim pružateljem (MapTiler, Stadia,
      Mapbox). Uvjeti korištenja OSM-a ne dopuštaju veći promet aplikacija.
- [ ] Prebaciti napredak („posjećeno“) iz `localStorage` u Firestore radi sinkronizacije između uređaja.
- [ ] Obavijesti u pozadini (zaključan mobitel): geofencing plugin i lokalne notifikacije.
- [ ] Snimljeni audio vodič umjesto sintetiziranog glasa; engleska i talijanska verzija.
