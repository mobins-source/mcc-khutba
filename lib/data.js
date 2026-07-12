/**
 * lib/data.js — Read data from the MCC transcript pipeline via GitHub Raw.
 *
 * Fetches index.json and transcripts from the public GitHub repo at build time.
 * All functions are server-side only (Next.js App Router server components).
 */

import riyadulSaliheen from './canonical/riyadul-saliheen.json'
import alWajeez      from './canonical/al-wajeez.json'

const GITHUB_RAW = 'https://raw.githubusercontent.com/mobins-source/yt-transcript-pipeline/main/data'
const INDEX_URL  = `${GITHUB_RAW}/metadata/index.json`

/**
 * Data sources — one entry per YouTube channel the pipeline tracks.
 * Each channel has its own index-{id}.json, committed independently by its
 * runner (Mac = MCC schedule, Windows = Sh. Ali backfill), so the two
 * runners' pushes never conflict. The site merges them at read time.
 */
const CHANNEL_IDS = [
  'UCt-XeQTVRSETC9DceeC6nMw',  // MCC Tucson
  'UCXQm5nWl_fhxQwgHnRsPZPg',  // The Mosque Foundation (Sh. Ali Mashhour playlists)
]

async function readIndex() {
  // Fetch all per-channel index files in parallel; tolerate individual misses
  // (e.g. a channel whose per-channel file hasn't been committed yet).
  const results = await Promise.all(
    CHANNEL_IDS.map(async id => {
      try {
        const res = await fetch(
          `${GITHUB_RAW}/metadata/index-${id}.json`,
          { next: { revalidate: 3600 } }
        )
        if (!res.ok) return null
        return await res.json()
      } catch {
        return null
      }
    })
  )

  const found = results.filter(Boolean)
  if (found.length > 0) {
    return { videos: found.flatMap(r => r.videos ?? []) }
  }

  // Fallback: combined index.json (pre-split data layout)
  try {
    const res = await fetch(INDEX_URL, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(`Failed to fetch index: ${res.status}`)
    return await res.json()
  } catch (e) {
    console.error('readIndex error:', e.message)
    return { videos: [] }
  }
}

/** All Jumaa Khutbas, newest first */
export async function getAllKhutbas() {
  const { videos } = await readIndex()
  return videos
    .filter(v => v.time_slot === 'Jumaa Khutba' && v.has_transcript)
    .sort((a, b) => (b.post_date || '').localeCompare(a.post_date || ''))
}

/** Single khutba by video_id */
export async function getKhutba(videoId) {
  const khutbas = await getAllKhutbas()
  return khutbas.find(v => v.video_id === videoId) ?? null
}

/** All video_ids for static path generation (Jumaa Khutbas only) */
export async function getAllKhutbaIds() {
  const khutbas = await getAllKhutbas()
  return khutbas.map(v => v.video_id)
}

/**
 * All videos with a transcript, regardless of type (Fajr/Zuhr/Isha/Jumaa Khutba).
 * Used by general browsing views like "This Week" — not restricted to khutbas.
 */
export async function getAllVideos() {
  const { videos } = await readIndex()
  return videos.filter(v => v.has_transcript)
}

/**
 * Videos from the last `days` days (default 7), newest first.
 * Sorted by post_time (includes time-of-day) so multiple lectures on the
 * same day order correctly (e.g. Fajr before Isha).
 */
export async function getRecentVideos(days = 7) {
  const all = await getAllVideos()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffStr = cutoff.toISOString().slice(0, 10) // YYYY-MM-DD

  return all
    .filter(v => v.post_date && v.post_date >= cutoffStr)
    .sort((a, b) =>
      (b.post_time || b.post_date || '').localeCompare(a.post_time || a.post_date || '')
    )
}

/** Single video by video_id — works for ANY video, not just Jumaa Khutbas */
export async function getVideo(videoId) {
  const all = await getAllVideos()
  return all.find(v => v.video_id === videoId) ?? null
}

/**
 * The N most recent videos overall (any content type), newest first. Used
 * for the homepage preview strip — unlike getRecentVideos, this isn't
 * bound to a fixed day window, so it can't come back empty if there's ever
 * a short gap in uploads.
 */
export async function getLatestVideos(n = 3) {
  const all = await getAllVideos()
  return all
    .slice()
    .sort((a, b) =>
      (b.post_time || b.post_date || '').localeCompare(a.post_time || a.post_date || '')
    )
    .slice(0, n)
}

/** All video_ids for static path generation (every video, not just khutbas) */
export async function getAllVideoIds() {
  const all = await getAllVideos()
  return all.map(v => v.video_id)
}

/** Full transcript JSON for a video */
export async function getTranscriptJson(channelId, videoId) {
  try {
    const url = `${GITHUB_RAW}/transcripts/${channelId}/${videoId}.json`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

/** Clean readable transcript text (.clean_en.txt) */
export async function getCleanTranscript(channelId, videoId) {
  try {
    const url = `${GITHUB_RAW}/transcripts/${channelId}/${videoId}.clean_en.txt`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

/** All unique topic tags across Jumaa Khutbas */
export async function getAllTopicTags() {
  const khutbas = await getAllKhutbas()
  const tags = new Set()
  khutbas.forEach(v => (v.topic_tags || []).forEach(t => tags.add(t)))
  return [...tags].sort()
}

/**
 * All years that have Jumaa Khutbas, newest first.
 * 2013 is explicitly excluded — stray/incorrect metadata on the source channel,
 * not an actual year the khutba archive should offer as a filter option.
 */
export async function getAllYears() {
  const khutbas = await getAllKhutbas()
  const years = new Set(
    khutbas.map(v => v.year).filter(y => Boolean(y) && y !== 2013)
  )
  return [...years].sort((a, b) => b - a).map(String)
}

/**
 * All months (by name) that have Jumaa Khutbas, in calendar order (Jan -> Dec).
 * Independent of year — selecting a month + a year together narrows to that
 * specific month/year combination, same as the existing year + topic filters.
 */
export async function getAllMonths() {
  const khutbas = await getAllKhutbas()
  const seen = new Map() // month_num -> month name
  khutbas.forEach(v => {
    if (v.month && v.month_num) seen.set(v.month_num, v.month)
  })
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, name]) => name)
}

/** Format seconds as "1h 23m" or "22m" */
export function formatDuration(secs) {
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Format post_time ("2026-06-05T12:55:23") as "12:55 PM" */
export function formatTime(postTime) {
  if (!postTime) return null
  const t = postTime.split('T')[1]
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Convert a "YYYY-MM-DD" Gregorian date string to its Hijri (Islamic) calendar
 * equivalent, e.g. "Dhul-Hijjah 5, 1447 AH".
 *
 * Uses Intl.DateTimeFormat's built-in islamic-umalqura calendar — no external
 * library needed (Umm al-Qura is the most widely recognized civil Hijri
 * calendar variant). This is a CALCULATED date, not based on local moon
 * sighting, so it may be off by a day from what MCC Tucson actually announces
 * for Ramadan, Eid, or other observances — callers should present this as a
 * general reference, not an authoritative religious calendar.
 */
export function formatHijriDate(dateStr) {
  if (!dateStr) return null
  try {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-US', {
      calendar: 'islamic-umalqura',
      day:   'numeric',
      month: 'long',
      year:  'numeric',
      era:   'short',
    }).format(date)
  } catch {
    return null
  }
}

// ── Today's date + sunrise/sunset (site header) ───────────────────────────

const TUCSON_LAT = 32.2226
const TUCSON_LON = -110.9747
const TUCSON_TZ  = 'America/Phoenix' // Arizona — fixed UTC-7 year-round, no DST

/** Today's date as "YYYY-MM-DD" in Tucson local time (timezone-safe, server-independent) */
function getTucsonTodayString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TUCSON_TZ }).format(new Date())
}

/** Format an absolute ISO timestamp (with offset) as "5:42 AM" in Tucson local time */
function formatTucsonClockTime(isoString) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TUCSON_TZ, hour: 'numeric', minute: '2-digit',
  }).format(new Date(isoString))
}

/** "Sat, Jun 20" from a "YYYY-MM-DD" string — weekday math here is timezone-invariant */
function formatGregorianShort(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const weekday = days[new Date(y, m - 1, d).getDay()]
  return `${weekday}, ${months[m - 1]} ${d}`
}

/**
 * Today's date (Gregorian + Hijri) and sunrise/sunset for Tucson, AZ — used in
 * the site header. Sunrise/sunset come from the free sunrise-sunset.org API
 * (no key required) using Tucson's fixed coordinates; cached 1 hour via ISR,
 * same staleness window as the rest of the site. Falls back to date-only
 * (sunrise/sunset = null) if the API is ever unreachable, rather than failing
 * the whole page.
 */
export async function getTodayInfo() {
  const dateStr   = getTucsonTodayString()
  const gregorian = formatGregorianShort(dateStr)
  const hijri     = formatHijriDate(dateStr)

  let sunrise = null
  let sunset  = null
  try {
    const url = `https://api.sunrise-sunset.org/json?lat=${TUCSON_LAT}&lng=${TUCSON_LON}&date=${dateStr}&formatted=0`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data.status === 'OK') {
      sunrise = formatTucsonClockTime(data.results.sunrise)
      sunset  = formatTucsonClockTime(data.results.sunset)
    }
  } catch (e) {
    console.error('sunrise-sunset.org fetch failed:', e.message)
  }

  return { date: gregorian, hijri, sunrise, sunset }
}

// ── Hadith Study Guide ──────────────────────────────────────────────────
//
// Registry of hadith books that have a canonical chapter list sourced and
// are ready to show as a study guide. Add an entry here once a book's
// chapter list has been transcribed into lib/canonical/ — everything else
// (the /study landing page, the book-switcher pill bar, static path
// generation) reads from this array, so adding a book is a one-line change.
//
// `dataValue` must match the pipeline's `hadith_book` field EXACTLY —
// that's the raw string the AI enrichment step writes, which is why it's
// spelled differently from the book's proper published name.
export const STUDY_BOOKS = [
  {
    slug:        'riyadul-saliheen',
    dataValue:   'Riyadul Saliheen',
    displayName: 'Riyad as-Saliheen',
    author:      'Al-Imam Abu Zakariya Yahya bin Sharaf An-Nawawi Ad-Dimashqi',
    canonical:   riyadulSaliheen,
  },
  {
    slug:        'al-wajeez',
    dataValue:   'Al-Wajeez',
    displayName: 'Al-Wajeez',
    author:      'Dr. Abdul-Azeem ibn Badawi al-Khalafi',
    canonical:   alWajeez,
    // Al-Wajeez is a Fiqh book — the pipeline may tag these lectures as
    // Hadith, General, or Mixed depending on lecture content. Accept all
    // three so none are silently excluded from the study guide.
    contentTypes: ['Hadith', 'General', 'Mixed'],
  },
]

export function getStudyBookConfig(slug) {
  return STUDY_BOOKS.find(b => b.slug === slug) ?? null
}

export function getAllStudyBookSlugs() {
  return STUDY_BOOKS.map(b => b.slug)
}

/**
 * Hadith videos for one study book, chronological oldest -> newest (chapter
 * is a filter/label for these, never a grouping structure — that's a locked
 * decision from planning). Scope is intentionally narrow:
 *   - content_type === "Hadith" only — "Mixed" videos are excluded even if
 *     they mention this book in passing
 *   - hadith_book must match this book's exact dataValue
 *   - has_transcript (inherited from getAllVideos) — no point linking to a
 *     lecture page that has nothing to show yet
 *   - year >= 2025 — hides older/stray-metadata videos from the study guide
 *     (e.g. a single 2013-dated video on the Khutba side is known-bad
 *     metadata; this floor keeps anything like that off this page too)
 */
export async function getStudyBookVideos(slug) {
  const book = getStudyBookConfig(slug)
  if (!book) return []
  const all = await getAllVideos()
  const allowedTypes = book.contentTypes ?? ['Hadith']
  return all
    .filter(v =>
      allowedTypes.includes(v.content_type) &&
      v.hadith_book === book.dataValue &&
      v.year >= 2025
    )
    .sort((a, b) =>
      (a.post_date || '').localeCompare(b.post_date || '') ||
      (a.post_time || '').localeCompare(b.post_time || '')
    )
}

/** All study books with their video counts, for the /study landing page. */
export async function getStudyBooksWithCounts() {
  const all = await getAllVideos()
  return STUDY_BOOKS.map(book => {
    const allowedTypes = book.contentTypes ?? ['Hadith']
    return {
      ...book,
      videoCount: all.filter(v =>
        allowedTypes.includes(v.content_type) &&
        v.hadith_book === book.dataValue &&
        v.year >= 2025
      ).length,
    }
  })
}

/** Years present among a study book's (already 2025+) videos, newest first. */
export async function getStudyBookYears(slug) {
  const videos = await getStudyBookVideos(slug)
  const years = new Set(videos.map(v => v.year).filter(Boolean))
  return [...years].sort((a, b) => b - a).map(String)
}

/** Months (by name) present among a study book's videos, in calendar order. */
export async function getStudyBookMonths(slug) {
  const videos = await getStudyBookVideos(slug)
  const seen = new Map() // month_num -> month name
  videos.forEach(v => { if (v.month && v.month_num) seen.set(v.month_num, v.month) })
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, name]) => name)
}

// ── Library (Fajr / Isha / Ramadan browse) ──────────────────────────────
//
// A different lens on the same video data than the Hadith Study Guide above:
// time-of-day and special-period browsing across EVERY content_type, not
// scoped to one teaching format or one hadith book.
//
// Khutbas are deliberately excluded everywhere here — they already have
// their own dedicated Archive (the homepage). "Announcement" content_type
// is also excluded (things like "Sunday School open house") since those
// aren't lectures.
//
// Fajr / Isha / Ramadan are NOT mutually exclusive buckets: a Fajr lecture
// given during Ramadan shows up under both the Fajr section and the Ramadan
// section. Each is its own independent lens on the same underlying videos,
// not a partition.
export const LIBRARY_SECTIONS = [
  { slug: 'fajr',    label: 'Fajr Lectures' },
  { slug: 'isha',    label: 'Isha Lectures' },
  { slug: 'ramadan', label: 'Ramadan Lectures' },
]

export function getLibrarySectionConfig(slug) {
  return LIBRARY_SECTIONS.find(s => s.slug === slug) ?? null
}

export function getAllLibrarySectionSlugs() {
  return LIBRARY_SECTIONS.map(s => s.slug)
}

/**
 * True if a "YYYY-MM-DD" Gregorian date string falls within the Hijri
 * (lunar) month of Ramadan — the 9th month of the islamic-umalqura
 * calendar. Ramadan lands on different Gregorian dates every year, so this
 * is computed per-video from post_date rather than ever being a fixed
 * month range. Verified against the known 2024–2026 Ramadan windows.
 */
function isRamadanDate(dateStr) {
  if (!dateStr) return false
  try {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return false
    const parts = new Intl.DateTimeFormat('en-US', {
      calendar: 'islamic-umalqura', month: 'numeric',
    }).formatToParts(date)
    return Number(parts.find(p => p.type === 'month')?.value) === 9
  } catch {
    return false
  }
}

function sortVideosNewestFirst(list) {
  return [...list].sort((a, b) =>
    (b.post_date || '').localeCompare(a.post_date || '') ||
    (b.post_time || '').localeCompare(a.post_time || '')
  )
}

/**
 * Videos for one library section (fajr / isha / ramadan), newest first.
 * Always excludes Jumaa Khutbas and Announcement content_type — see note
 * above LIBRARY_SECTIONS.
 */
export async function getLibrarySectionVideos(slug) {
  const all = await getAllVideos()
  const base = all.filter(v => v.time_slot !== 'Jumaa Khutba' && v.content_type !== 'Announcement')

  if (slug === 'fajr')    return sortVideosNewestFirst(base.filter(v => v.time_of_day === 'Fajr'))
  if (slug === 'isha')    return sortVideosNewestFirst(base.filter(v => v.time_of_day === 'Isha'))
  if (slug === 'ramadan') return sortVideosNewestFirst(base.filter(v => isRamadanDate(v.post_date)))
  return []
}

/** All library sections with their video counts, for the /library landing page. */
export async function getLibrarySectionsWithCounts() {
  const counts = await Promise.all(LIBRARY_SECTIONS.map(s => getLibrarySectionVideos(s.slug)))
  return LIBRARY_SECTIONS.map((s, i) => ({ ...s, videoCount: counts[i].length }))
}

/** Years present in a library section, newest first. */
export async function getLibrarySectionYears(slug) {
  const videos = await getLibrarySectionVideos(slug)
  const years = new Set(videos.map(v => v.year).filter(Boolean))
  return [...years].sort((a, b) => b - a).map(String)
}

/** Months (by name) present in a library section, in calendar order. */
export async function getLibrarySectionMonths(slug) {
  const videos = await getLibrarySectionVideos(slug)
  const seen = new Map()
  videos.forEach(v => { if (v.month && v.month_num) seen.set(v.month_num, v.month) })
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, name]) => name)
}

// ── Chapter normalization ────────────────────────────────────────────────
//
// hadith_chapter is free-form text written per-video by the pipeline's AI
// enrichment step, so the same real chapter shows up under many different
// phrasings ("Chapter on Repentance", "Chapter of Repentance (Tawbah)",
// "Chapter on Repentance (باب التوبة)", ...). normalizeChapter() matches
// that raw text against a book's canonical chapter list — computed on the
// fly here, every render, never written back into the pipeline's own JSON —
// so the raw AI output and this display layer stay fully decoupled and the
// matching logic can be re-tuned any time without a backfill.
//
// Signal priority: topic/keyword overlap is primary. An embedded chapter
// number ("Chapter 136 - ...") is only a secondary signal, because the AI
// sometimes states a confident-looking number for the wrong chapter — e.g.
// it has labeled Friday-prayer videos "Chapter 136", which is actually
// "Greeting the Children"; the real Friday Prayer chapter is 210. So: if
// the number's own canonical title shares virtually no words with the raw
// text, but some other chapter's title overlaps well, the keyword match
// wins. Otherwise the number is trusted, since across real data it's right
// far more often than not. No confident signal either way -> the raw text
// is shown unchanged rather than guessed at (safe fallback).
//
// Tuned and verified against all 90 real Riyadul Saliheen videos in the
// pipeline's current index.json (79 distinct hadith_chapter phrasings) —
// see chat history for the test harness if these thresholds need revisiting.

const CHAPTER_MATCH_STOPWORDS = new Set([
  // generic connectors
  'a', 'an', 'the', 'of', 'and', 'to', 'in', 'on', 'for', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'with', 'as', 'by', 'at', 'from', 'this',
  'that', 'these', 'those', 'it', 'its', 'his', 'her', 'their', 'our',
  'your', 'my',
  // structural words that describe ANY chapter reference, not its topic
  'chapter', 'book', 'bab', 'kitab', 'narration', 'narrations', 'hadith',
  'hadiths', 'regarding', 'about', 'pertaining', 'concerning',
  // near-universal in this book's canonical titles ("The Excellence of...",
  // "The Prohibition of...") and in the AI's raw text — present in too many
  // titles to be discriminative, so they're noise rather than signal
  'allah', 'allahs', 'prohibition', 'excellence', 'desirability',
  'undesirability', 'abomination', 'obligation', 'virtue', 'virtues',
  'merit', 'merits', 'significance', 'importance',
])

function chapterTokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !CHAPTER_MATCH_STOPWORDS.has(w))
}

function chapterJaccard(tokensA, tokensB) {
  const a = new Set(tokensA), b = new Set(tokensB)
  if (a.size === 0 || b.size === 0) return 0
  let intersect = 0
  for (const t of a) if (b.has(t)) intersect++
  return intersect / (a.size + b.size - intersect)
}

function extractEmbeddedChapterNumber(raw) {
  const text = raw || ''
  const withLabel = text.match(/\bchapter\s*#?\s*(\d{1,3})\b/i)
  if (withLabel) return parseInt(withLabel[1], 10)
  const bareNumber = text.match(/^\s*(\d{1,3})\s*$/)
  return bareNumber ? parseInt(bareNumber[1], 10) : null
}

function stripLeadingChapterNumber(raw) {
  return (raw || '').replace(/^\s*chapter\s*#?\s*\d{1,3}\s*[-:–]?\s*/i, '')
}

const CHAPTER_KEYWORD_THRESHOLD = 0.34  // minimum score to trust a keyword-only match (no number present)
const CHAPTER_NUM_DISTRUST      = 0.10  // at/below this, the number's own canonical title is basically unrelated to the raw text
const CHAPTER_OVERRIDE_LEAD     = 0.20  // how much better a keyword match must be than the number's own score to override it
const CHAPTER_OVERRIDE_MIN      = 0.30  // floor for the overriding keyword match itself

/**
 * Match a raw, AI-generated hadith_chapter string against a study book's
 * canonical chapter list. `bookSlug` must be one of STUDY_BOOKS.
 *
 * Returns { displayTitle, matched, chapterNumber }. When nothing can be
 * matched confidently, displayTitle falls back to the raw text unchanged
 * (matched: false) rather than guessing — unmatched chapters are never
 * hidden, just shown as-is.
 */
export function normalizeChapter(rawChapter, bookSlug) {
  const fallback = { displayTitle: rawChapter || null, matched: false, chapterNumber: null }
  const book = getStudyBookConfig(bookSlug)
  const chapters = book?.canonical?.chapters
  if (!rawChapter || !chapters?.length) return fallback

  const embeddedNum = extractEmbeddedChapterNumber(rawChapter)
  const rawTokens    = chapterTokenize(stripLeadingChapterNumber(rawChapter))

  let best = null
  for (const ch of chapters) {
    const score = chapterJaccard(rawTokens, chapterTokenize(ch.title))
    if (!best || score > best.score) best = { ...ch, score }
  }

  if (embeddedNum != null) {
    const numChapter = chapters.find(c => c.number === embeddedNum)
    if (numChapter) {
      const numScore = chapterJaccard(rawTokens, chapterTokenize(numChapter.title))
      const keywordWins =
        numScore <= CHAPTER_NUM_DISTRUST &&
        best.score >= numScore + CHAPTER_OVERRIDE_LEAD &&
        best.score >= CHAPTER_OVERRIDE_MIN &&
        best.number !== embeddedNum
      const winner = keywordWins ? best : numChapter
      return {
        displayTitle:   `Chapter ${winner.number} — ${winner.title}`,
        matched:        true,
        chapterNumber:  winner.number,
      }
    }
  }

  if (best.score >= CHAPTER_KEYWORD_THRESHOLD) {
    return {
      displayTitle:  `Chapter ${best.number} — ${best.title}`,
      matched:       true,
      chapterNumber: best.number,
    }
  }

  return fallback
}

// ── Library (browse-everything: Fajr / Isha / Ramadan) ────────────────────
//
// A general archive separate from the Khutba Archive (Friday khutbas have
// their own page and are excluded everywhere here) and separate from the
// Study Guide (which is scoped to one hadith book's Hadith-tagged lectures
// specifically). This pulls from every content_type — Hadith, Quran, Mixed,
// General — for whichever tile is selected.

export const LIBRARY_TILES = [
  { slug: 'fajr',    label: 'Fajr Lectures',    dot: 'bg-blue' },
  { slug: 'isha',    label: 'Isha Lectures',    dot: 'bg-purple' },
  { slug: 'ramadan', label: 'Ramadan Lectures', dot: 'bg-green' },
]

export function getLibraryTileConfig(slug) {
  return LIBRARY_TILES.find(t => t.slug === slug) ?? null
}

export function getAllLibraryTileSlugs() {
  return LIBRARY_TILES.map(t => t.slug)
}

const RAMADAN_HIJRI_MONTH = 9 // Ramadan is the 9th month of the Hijri calendar

/**
 * The Hijri (islamic-umalqura) calendar month number for a "YYYY-MM-DD"
 * Gregorian date, or null. Same calendar system as formatHijriDate above,
 * just returning the raw month number instead of a formatted string.
 */
function getHijriMonthNumber(dateStr) {
  if (!dateStr) return null
  try {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return null
    const parts = new Intl.DateTimeFormat('en-US', {
      calendar: 'islamic-umalqura',
      month: 'numeric',
    }).formatToParts(date)
    const month = parts.find(p => p.type === 'month')
    return month ? parseInt(month.value, 10) : null
  } catch {
    return null
  }
}

/**
 * True if a "YYYY-MM-DD" date falls within the Hijri month of Ramadan —
 * i.e. the lecture was actually given during Ramadan, not just a lecture
 * that happens to discuss Ramadan/fasting as a topic at some other time
 * of year. Verified against known Ramadan date windows (e.g. 2025-03-05
 * and 2026-02-25 both resolve to Hijri month 9).
 */
function isDuringRamadan(dateStr) {
  return getHijriMonthNumber(dateStr) === RAMADAN_HIJRI_MONTH
}

/**
 * Videos for one Library tile, newest first (this is a general browse
 * archive, unlike the Study Guide's oldest-first chapter-following order).
 * Jumma Khutbas are excluded from every tile — they stay exclusive to the
 * Khutba Archive. The Ramadan tile is also floored at year >= 2024, which
 * drops a handful of much older (2014) stray entries.
 */
export async function getLibraryTileVideos(slug) {
  const all = await getAllVideos()
  const nonKhutba = all.filter(v => v.time_slot !== 'Jumaa Khutba')

  let list
  if (slug === 'fajr')         list = nonKhutba.filter(v => v.time_of_day === 'Fajr')
  else if (slug === 'isha')    list = nonKhutba.filter(v => v.time_of_day === 'Isha')
  else if (slug === 'ramadan') list = nonKhutba.filter(v => isDuringRamadan(v.post_date) && v.year >= 2024)
  else return []

  return list.sort((a, b) =>
    (b.post_date || '').localeCompare(a.post_date || '') ||
    (b.post_time || '').localeCompare(a.post_time || '')
  )
}

/** All Library tiles with their video counts, for the /library landing page. */
export async function getLibraryTilesWithCounts() {
  const counts = await Promise.all(LIBRARY_TILES.map(t => getLibraryTileVideos(t.slug)))
  return LIBRARY_TILES.map((t, i) => ({ ...t, videoCount: counts[i].length }))
}

/** Years present in one Library tile's videos, newest first. */
export async function getLibraryTileYears(slug) {
  const videos = await getLibraryTileVideos(slug)
  const years = new Set(videos.map(v => v.year).filter(Boolean))
  return [...years].sort((a, b) => b - a).map(String)
}

/** Months (by name) present in one Library tile's videos, calendar order. */
export async function getLibraryTileMonths(slug) {
  const videos = await getLibraryTileVideos(slug)
  const seen = new Map()
  videos.forEach(v => { if (v.month && v.month_num) seen.set(v.month_num, v.month) })
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).map(([, name]) => name)
}
