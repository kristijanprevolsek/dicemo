import photosJson from './photos.json'

export interface Photo {
  /** Putanja relativna na public/, npr. photos/katedrala-sv-vida-then.jpg */
  src: string
  /** Godina ili razdoblje snimanja, npr. "oko 1900." */
  year?: string
  /** Autor / izvor – obavezno prikazati zbog licence */
  credit: string
  license?: string
  sourceUrl?: string
}

export interface LandmarkPhotos {
  then?: Photo
  now?: Photo
}

/** Generira se skriptom `npm run photos` (vidi README), može se uređivati i ručno. */
export const photos: Record<string, LandmarkPhotos> = photosJson
