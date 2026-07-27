import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getSheikhAliSeriesConfig,
  getSheikhAliSeriesVideos,
  getAllSheikhAliSeriesSlugs,
  SHEIKH_ALI_SERIES,
} from '../../../../lib/data'

// Extract part number from a video title using the series pattern
function getPartNumber(title, pattern) {
  if (!title || !pattern) return null
  const m = title.match(pattern)
  if (!m) return null
  const num = m.slice(1).find(g => g != null)
  return num ? parseInt(num, 10) : null
}

// Format duration seconds as "1h 23m" or "45m"
function formatDur(secs) {
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export async function generateStaticParams() {
  return getAllSheikhAliSeriesSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const series = getSheikhAliSeriesConfig(params.slug)
  if (!series) return {}
  return {
    title:       `${series.displayName} — Sh. Ali Mashhour — MCC Tucson`,
    description: series.description,
  }
}

export default async function SheikhAliSeriesPage({ params }) {
  const series = getSheikhAliSeriesConfig(params.slug)
  if (!series) notFound()

  const videos = await getSheikhAliSeriesVideos(params.slug)

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dim mb-8">
        <Link href="/study" className="hover:text-amber transition-colors">
          Study Guide
        </Link>
        <span>/</span>
        <Link href="/study/sheikh-ali" className="hover:text-amber transition-colors">
          Sh. Ali Mashhour
        </Link>
      </div>

      {/* Series switcher pill bar */}
      {SHEIKH_ALI_SERIES.length > 1 && (
        <div className="sticky top-[73px] z-40 bg-cream/95 backdrop-blur-sm -mx-6 px-6 py-3 mb-8 border-b border-border">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {SHEIKH_ALI_SERIES.map(s => (
              <Link
                key={s.slug}
                href={`/study/sheikh-ali/${s.slug}`}
                className={`flex-shrink-0 snap-start text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  s.slug === series.slug
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border border-border text-dim hover:border-teal-400 hover:text-teal-700'
                }`}
              >
                {s.displayName.split('(')[0].trim()}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-2">
          {series.type}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2 leading-tight">
          {series.displayName}
        </h1>
        {series.arabicName && (
          <p className="text-base text-dim mb-2 font-reading" dir="rtl">
            {series.arabicName}
          </p>
        )}
        <p className="text-sm text-dim mb-3 font-reading">
          {series.author} · The Mosque Foundation, Bridgeview, IL
        </p>
        {series.description && (
          <p className="text-dim text-base leading-relaxed mb-3">
            {series.description}
          </p>
        )}
        <p className="text-dim text-sm">
          {videos.length} lecture{videos.length !== 1 ? 's' : ''} available
          {videos.length > 0 && ' · ordered by part number'}
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* Lecture list */}
      {videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">
            Transcripts for this series haven&apos;t been fetched yet.
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-border">
          {videos.map(v => {
            const partNum  = getPartNumber(v.title, series.partPattern)
            const duration = formatDur(v.duration_seconds)
            // Title: "Part N — [original YouTube title with Part N stripped]"
            const strippedTitle = v.title
              .replace(/\|?\s*part\s*\d+\s*/i, '')
              .replace(/zadul-ma'?ad.*?with\s+sh\.?\s*ali\s*mashhour\s*[-|]?\s*/i, '')
              .trim()
            const displayTitle = partNum
              ? `Part ${partNum} — ${strippedTitle || v.title}`
              : v.title

            return (
              <li key={v.video_id}>
                <Link
                  href={`/lecture/${v.video_id}`}
                  className="group flex items-center gap-4 py-3 px-2 hover:bg-warm rounded-lg transition-colors"
                >
                  {/* Part number bubble */}
                  <span className="flex-shrink-0 w-10 text-right text-xs font-medium text-muted tabular-nums">
                    {partNum ? `${partNum}` : '—'}
                  </span>

                  {/* Title */}
                  <span className="flex-1 text-sm text-ink group-hover:text-teal-700 transition-colors leading-snug">
                    {displayTitle}
                  </span>

                  {/* Duration */}
                  {duration && (
                    <span className="flex-shrink-0 text-xs text-muted tabular-nums">
                      {duration}
                    </span>
                  )}

                  {/* Arrow */}
                  <span className="flex-shrink-0 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                    →
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
