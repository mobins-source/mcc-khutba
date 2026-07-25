import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getSheikhAliSeriesConfig,
  getSheikhAliSeriesVideos,
  getAllSheikhAliSeriesSlugs,
  SHEIKH_ALI_SERIES,
} from '../../../../lib/data'
import LectureCard from '../../../../components/LectureCard'

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

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">
            No lectures available yet — the backfill is still in progress.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(v => (
            <LectureCard key={v.video_id} video={v} />
          ))}
        </div>
      )}
    </div>
  )
}
