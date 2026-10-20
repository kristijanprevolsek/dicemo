# Dićemo – priče hrvatskih gradova

Interaktivna karta grada sa znamenitostima, trenutno za **Rijeku, Zagreb i Osijek**. Kad korisnik prolazi pored neke znamenitosti
(npr. katedrale sv. Vida), aplikacija mu ponudi priču o njoj, koju može pročitati ili poslušati.

**Stack:** React + TypeScript + Vite · Leaflet/OpenStreetMap · Firebase Auth (e-mail i Google) ·
Capacitor (isti kod se pakira kao iOS i Android aplikacija).

## Gradovi

Svaki grad je zaseban paket podataka u `src/cities/<grad>/`, a sav kod je zajednički. Paket
sadrži znamenitosti s pričama, šetnje, pitanja za kviz, značke specifične za grad, nagradu i
primjer događanja (tip `City` u `src/cities/types.ts`).

- Grad se mijenja dodirom na njegovo ime u gornjem lijevom kutu karte.
- Ako GPS pokaže da je korisnik u drugom podržanom gradu (do 25 km od središta),
  aplikacija ponudi prebacivanje.
- Svaki grad ima svoju putovnicu, pečate i značke. Opće značke (Prvi pečat, Znalac, Šetač,
  Vodič) postoje u svim gradovima, a uz njih svaki grad definira svoje.
- Feed događanja dobiva parametar `?city=<id>`.

### Dodavanje novog grada

1. Kopiraj `src/cities/osijek/` (najmanji primjer) u npr. `src/cities/split/` i promijeni sadržaj.
   Id-evi znamenitosti moraju biti jedinstveni u svim gradovima, pa koristi prefiks (`st-…`).
2. Dodaj grad u popis u `src/cities/index.ts`.
3. Pokreni `npm run check-cities`. Skripta provjerava da šetnje, pitanja i značke pokazuju na
   postojeće znamenitosti, da svaka znamenitost ima pitanje i da koordinate nisu daleko od grada.

Gradovi se mogu dodavati i kroz admin sučelje (vidi dolje), bez izmjena koda.

## Uređivanje sadržaja (admin)

Na adresi **`/admin.html`** (lokalno http://localhost:5173/admin.html) nalazi se sučelje za
uređivanje sadržaja gradova, bez programiranja:

- **Znamenitosti:** naziv, kategorija, kratki opis, priča, lokacija (klik na kartu ili
  povlačenje oznake), radijus okidanja i pitanje za kviz s točnim i netočnim odgovorima.
- **Šetnje:** naziv, trajanje, opis, točke redom (dodaj, pomakni gore ili dolje, ukloni) i
  uputa za svaku točku, uz pregled rute na karti.
- **Grad, nagrada i značke:** ime grada, središte i zoom karte, nagrada i gradske značke.
- **Novi grad:** polje „Novi grad…“ u zaglavlju (samo urednici sa svim gradovima).
- **Objava:** sučelje stalno provjerava sadržaj (iste provjere kao `npm run check-cities`) i ne
  dopušta objavu dok postoje greške, npr. znamenitost bez pitanja ili šetnja s nepostojećom
  točkom. Tu su i „Odbaci“, „Vrati izvorno“ te **Izvezi/Uvezi JSON**, zgodno ako turistička
  zajednica pošalje sadržaj kao datoteku.

### Gdje se sprema

- **Bez Firebasea (demo):** izmjene se spremaju u preglednik, u isti localStorage kao i
  aplikacija. Aplikacija na istom računalu odmah ih vidi, ali nitko drugi ne.
- **S Firebaseom:** izmjene idu u Firestore (`cities/{id}`), a aplikacija ih učitava pri
  pokretanju. Ugrađeni sadržaj iz `src/cities/` služi kao početni sadržaj i rezerva ako baza
  nije dostupna. Za novi grad ili ispravak priče nije potrebna nova verzija aplikacije.

### Postavljanje urednika (Firebase)

1. U Firebase konzoli uključi **Firestore** i objavi pravila iz `firestore.rules`
   (`firebase deploy --only firestore:rules` ili kopiraj u konzolu).
2. Urednik se prijavi na `/admin.html`. Aplikacija mu pokaže poruku „Nemaš prava uređivanja“
   i njegov korisnički id.
3. U Firestoreu napravi dokument `editors/<taj id>` s poljem `cities` (array):
   - `["rijeka"]` – smije uređivati samo Rijeku (npr. TZ grada Rijeke)
   - `["*"]` – smije uređivati sve gradove i dodavati nove

Pravila dopuštaju svima čitanje sadržaja, a pisanje samo urednicima za njihove gradove.

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

## Šetnje

Tab **Šetnje** nudi tematske rute (`walks` u paketu grada), npr. „Rijeka u 60 minuta“ ili „Kaptol i Gornji grad“.
Nakon pokretanja ruta se iscrta na karti s numeriranim točkama. Banner pokazuje sljedeću
točku, udaljenost do nje i kratku uputu. Kad korisnik stigne na točku, sama se otvori
njezina priča, a može i ručno potvrditi „Stigao sam“.

Pješačka linija dolazi s javnog OSRM poslužitelja `routing.openstreetmap.de`. Ako servis nije
dostupan, između točaka se crtaju isprekidane ravne linije. Za produkciju treba vlastiti ili
komercijalni servis za rute (GraphHopper, Mapbox, OpenRouteService).

Nova šetnja je novi zapis u `walks` paketa grada: popis id-eva znamenitosti redom, uz kratke upute.

## Nekad i sad (stare fotografije)

U panelu priče, ako znamenitost ima fotografije, prikazuje se usporedba stare i današnje
fotografije s klizačem. Ako postoji samo jedna fotografija, prikazuje se samo ona. Podaci su u
`src/data/photos.json`. Trenutno je unutra samo **primjer s nacrtanim zamjenskim slikama** za
katedralu sv. Vida, i treba ga zamijeniti.

### Dodavanje fotografija s Wikimedia Commonsa

Na [Commonsu](https://commons.wikimedia.org/wiki/Category:Old_photographs_of_Rijeka) ima puno
starih razglednica i fotografija Rijeke (Fiume) u javnom vlasništvu.

1. Pronađi fotografiju i kopiraj naziv datoteke, npr. `File:Fiume Duomo 1900.jpg`.
2. Upiši je u `scripts/photo-sources.json`:
   ```json
   { "katedrala-sv-vida": { "then": "File:….jpg", "thenYear": "oko 1900.", "now": "File:….jpg" } }
   ```
3. Pokreni `npm run photos`. Skripta skine slike u `public/photos/` i u `photos.json` upiše
   autora, licencu i poveznicu na izvor. Aplikacija ih prikazuje ispod fotografije.

Unos se može dodati i ručno u `photos.json`, npr. za vlastite fotografije ili one iz muzeja.
Za fotografije koje nisu u javnom vlasništvu treba dopuštenje vlasnika. Kandidati za suradnju
su Muzej grada Rijeke, Pomorski i povijesni muzej i Državni arhiv u Rijeci.

Najbolji efekt daje „danas“ fotografija snimljena **s istog mjesta i pod istim kutom** kao
stara. Te bi se fotografije isplatilo snimiti same.

## Igra: putovnica, kviz i značke

- **Pečat:** dobiva se kad korisnik fizički dođe do znamenitosti.
- **Kviz:** na dnu priče je jedno pitanje (`quiz` u paketu grada), otključano tek na licu mjesta.
  Ako je odgovor točan iz prve, pečat dobiva zvjezdicu ★.
- **Značke** (`src/data/badges.ts` + `badges` u paketu grada): opće (Prvi pečat, Znalac, Šetač,
  Vodič) i gradske (npr. Stari grad i Trsatski hodočasnik u Rijeci, Gornji grad u Zagrebu). Kad korisnik osvoji značku, iskače obavijest.
- **Nagrada:** primjer „kava u partnerskom kafiću“ nakon 10 pečata. Partneri još nisu
  dogovoreni, a kod je zasad samo prikaz. Za stvarne nagrade kod treba izdavati i
  provjeravati na serveru, da se ne može lažirati.
- Tab **Putovnica** prikazuje pečate, nagradu i značke s napretkom.

Napredak se sprema lokalno (`src/progress/ProgressContext.tsx`). Za stvarne nagrade i rang
liste treba ga prebaciti u Firestore. U tom slučaju pečat treba potvrditi i na serveru, jer
se GPS lokacija može lažirati.

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
  cities/                ugrađeni paketi gradova + tipovi, odabir grada i provjera sadržaja
  content/repository.ts  izvor sadržaja: Firestore ili (demo) localStorage
  admin/                 sučelje za uređivanje sadržaja (/admin.html)
  data/photos.json       stare i današnje fotografije (+ autor i licenca)
  data/badges.ts         opće značke
  data/events.ts         model događanja + primjer podataka
  hooks/useLocation.ts   praćenje GPS lokacije (web + nativno)
  hooks/useProximity.ts  otkriva ulazak u radijus znamenitosti
  hooks/useWalkRoute.ts  pješačka ruta šetnje (OSRM, s fallbackom)
  progress/              napredak korisnika po gradu (pečati, kviz, šetnje)
  lib/events.ts          učitavanje feeda, filtriranje na 10 dana, grupiranje po danu
  auth/AuthContext.tsx   Firebase prijava (e-mail, Google, demo gost)
  components/            prijava, karta, šetnje, putovnica, događanja, odabir grada…
scripts/
  fetch-photos.mjs       skidanje fotografija s Wikimedia Commonsa
  check-cities.ts        provjera podataka gradova
```

Nova znamenitost dodaje se u `landmarks` paketa odgovarajućeg grada u `src/cities/`.

## Prije objave

- [ ] **Provjeriti koordinate** svih znamenitosti na terenu (trenutno su približne).
- [ ] **Stručno pregledati tekstove priča** (povjesničar ili TZ Rijeka).
- [ ] Zamijeniti primjer fotografija stvarnim starim i današnjim fotografijama.
- [ ] Za produkciju zamijeniti javne OSM pločice komercijalnim pružateljem (MapTiler, Stadia,
      Mapbox). Uvjeti korištenja OSM-a ne dopuštaju veći promet aplikacija.
- [ ] Prebaciti napredak (pečati, kviz, značke) iz `localStorage` u Firestore radi sinkronizacije između uređaja.
- [ ] Dogovoriti partnere za nagrade i izdavati kodove na serveru.
- [ ] Obavijesti u pozadini (zaključan mobitel): geofencing plugin i lokalne notifikacije.
- [ ] Snimljeni audio vodič umjesto sintetiziranog glasa; engleska i talijanska verzija.
