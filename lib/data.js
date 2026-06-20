/**
 * lib/data.js — Read data from the MCC transcript pipeline via GitHub Raw.
 *
 * Fetches index.json and transcripts from the public GitHub repo at build time.
 * All functions are server-side only (Next.js App Router server components).
 */

const GITHUB_RAW = 'https://raw.githubusercontent.com/mobins-source/yt-transcript-pipeline/main/data'
const INDEX_URL  = `${GITHUB_RAW}/metadata/index.json`

async function readIndex() {
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
