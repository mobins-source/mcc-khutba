import Link from 'next/link'
import { getAllKhutbas, getLatestVideos } from '../lib/data'
import FeaturedKhutba from '../components/FeaturedKhutba'
import LectureCard from '../components/LectureCard'
import SectionTile from '../components/SectionTile'

export const metadata = {
  title:       'MCC Tucson Lectures',
  description: 'Lectures, Friday khutbas, and full transcripts from Muslim Community Center of Tucson',
}

export default async function HomePage() {
  const khutbas = await getAllKhutbas()
  const latestKhutba = khutbas[0] ?? null

  // Buffer the fetch and filter out khutbas — the most recent one already
  // gets its own spotlight above, so showing it again here would duplicate it.
  const recentBuffer = await getLatestVideos(6)
  const thisWeek = recentBuffer.filter(v => v.time_slot !== 'Jumaa Khutba').slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Muslim Community Center of Tucson
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-3 leading-tight">
          Lectures, khutbas, and Islamic knowledge
        </h1>
        <p className="text-dim text-base leading-relaxed">
          Lectures from MCC Tucson — fully transcribed and searchable.
        </p>
      </div>

      {/* Featured khutba */}
      {latestKhutba && (
        <div className="mb-10">
          <FeaturedKhutba khutba={latestKhutba} />
        </div>
      )}

      {/* This Week strip */}
      {thisWeek.length > 0 && (
        <div className="mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-dim">
              This Week
            </span>
            <Link href="/this-week" className="text-xs font-medium text-amber hover:text-amber-dark transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {thisWeek.map(v => <LectureCard key={v.video_id} video={v} />)}
          </div>
        </div>
      )}

      <div className="border-t border-border mb-10" />

      {/* Section tiles */}
      <div className="grid gap-5 sm:grid-cols-3">
        <SectionTile
          href="/khutba"
          title="Khutba Archive"
          description="Every Friday sermon, searchable by year, month, and topic."
          badge={`${khutbas.length} sermons`}
        />
        <SectionTile
          href="/library"
          title="Library"
          description="Browse all Fajr, Isha, and Ramadan lectures in one place."
        />
        <SectionTile
          href="/study"
          title="Study Guide"
          description="Hadith, chapter by chapter — Riyad as-Saliheen so far."
          muted
        />
      </div>
    </div>
  )
}
