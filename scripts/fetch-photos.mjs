#!/usr/bin/env node
// Skida fotografije s Wikimedia Commonsa prema scripts/photo-sources.json, sprema ih u
// public/photos/ i upisuje autora i licencu u src/data/photos.json.
//
// photo-sources.json: { "<id znamenitosti>": { "then": "File:….jpg", "thenYear": "1905.", "now": "File:….jpg" } }
// Ključevi koji počinju s "_" se preskaču. Ručno dodani unosi u photos.json se čuvaju.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const API = process.env.COMMONS_API ?? 'https://commons.wikimedia.org/w/api.php'
const WIDTH = 1200
// Wikimedia traži opisni User-Agent: https://meta.wikimedia.org/wiki/User-Agent_policy
const headers = { 'User-Agent': 'DicemoApp/0.1 (https://github.com/kristijanprevolsek/dicemo)' }

const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

async function fetchInfo(title) {
  const url = new URL(API)
  url.search = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(WIDTH),
    format: 'json',
    formatversion: '2',
  })
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Commons API ${res.status}`)
  const page = (await res.json()).query?.pages?.[0]
  const info = page?.imageinfo?.[0]
  if (!info) throw new Error(`Datoteka ne postoji: ${title}`)
  const meta = info.extmetadata ?? {}
  return {
    url: info.thumburl ?? info.url,
    sourceUrl: info.descriptionurl,
    credit: stripHtml(meta.Artist?.value) || stripHtml(meta.Credit?.value) || 'Wikimedia Commons',
    license: stripHtml(meta.LicenseShortName?.value) || undefined,
    date: stripHtml(meta.DateTimeOriginal?.value) || undefined,
  }
}

async function download(url, file) {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Preuzimanje ${res.status}: ${url}`)
  await writeFile(new URL(`../public/${file}`, import.meta.url), Buffer.from(await res.arrayBuffer()))
}

const sources = JSON.parse(await readFile(`${root}scripts/photo-sources.json`, 'utf8'))
const photosPath = `${root}src/data/photos.json`
const photos = JSON.parse(await readFile(photosPath, 'utf8'))
let failed = 0

for (const [id, src] of Object.entries(sources)) {
  if (id.startsWith('_')) continue
  for (const kind of ['then', 'now']) {
    const title = src[kind]
    if (!title) continue
    try {
      const info = await fetchInfo(title)
      const ext = (new URL(info.url).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1] ?? 'jpg').toLowerCase()
      const file = `photos/${id}-${kind}.${ext}`
      await download(info.url, file)
      photos[id] = {
        ...photos[id],
        [kind]: {
          src: file,
          year: src[`${kind}Year`] ?? (kind === 'now' ? 'danas' : info.date),
          credit: info.credit,
          license: info.license,
          sourceUrl: info.sourceUrl,
        },
      }
      console.log(`✓ ${id} (${kind}) – ${info.credit}${info.license ? `, ${info.license}` : ''}`)
    } catch (e) {
      failed++
      console.error(`✗ ${id} (${kind}): ${e.message}`)
    }
  }
}

await writeFile(photosPath, JSON.stringify(photos, null, 2) + '\n')
console.log(`Gotovo. Zapisano u src/data/photos.json${failed ? ` (${failed} grešaka)` : ''}.`)
process.exitCode = failed ? 1 : 0
