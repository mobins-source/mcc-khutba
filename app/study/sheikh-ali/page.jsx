import Link from 'next/link'
import {
  getSheikhAliSeriesWithCounts,
  SHEIKH_ALI_SERIES,
} from '../../../lib/data'
import StudySeriesCard from '../../../components/StudySeriesCard'

export const metadata = {
  title:       'Sh. Ali Mashhour — Lecture Series — MCC Tucson',
  description: 'Browse lecture series by Sh. Ali Mashhour of The Mosque Foundation: tafsir, seerah, fiqh, and more.',
}

export default async function SheikhAliPage() {
  const series = await getSheikhAliSeriesWithCounts()

  return (
    <div>
      {/* Back link */}
      <Link
        href="/study"
        className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-amber transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        Study Guide
      </Link>

      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-teal-600 uppercase tracking-widest mb-2">
          Lecture Series
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2 leading-tight">
          Sh. Ali Mashhour
        </h1>
        <p className="text-sm text-dim mb-4 font-reading">
          The Mosque Foundation · Bridgeview, IL
        </p>
        <p className="text-dim text-base leading-relaxed">
          Lectures from ongoing and completed series — covering Quran tafsir,
          prophetic biography (seerah), and Islamic law (fiqh).
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {series.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No series available yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {series.map(s => <StudySeriesCard key={s.slug} series={s} />)}
        </div>
      )}
    </div>
  )
}
