import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getStudyBookConfig, getStudyBookVideos, getAllStudyBookSlugs,
  getStudyBookYears, getStudyBookMonths,
  normalizeChapter, STUDY_BOOKS,
} from '../../../lib/data'
import StudyBookGrid from '../../../components/StudyBookGrid'

export async function generateStaticParams() {
  return getAllStudyBookSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }) {
  const book = getStudyBookConfig(params.slug)
  if (!book) return {}
  return {
    title:       `${book.displayName} — Hadith Study Guide — MCC Tucson`,
    description: `Lectures from ${book.displayName}, in order, browsable by chapter.`,
  }
}

export default async function StudyBookPage({ params }) {
  const book = getStudyBookConfig(params.slug)
  if (!book) notFound()

  const videos = await getStudyBookVideos(params.slug)
  const years  = await getStudyBookYears(params.slug)
  const months = await getStudyBookMonths(params.slug)

  // Compute each video's normalized chapter label server-side, once, so the
  // client component below just renders — no matching logic on the client.
  const enriched = videos.map(v => {
    const ch = normalizeChapter(v.hadith_chapter, params.slug)
    return { ...v, chapterLabel: ch.displayTitle, chapterMatched: ch.matched }
  })

  // Distinct chapter labels actually present in this book's data, in the
  // order they first appear chronologically — used for the filter dropdown.
  const seen = new Set()
  const chapterOptions = []
  enriched.forEach(v => {
    if (v.chapterLabel && !seen.has(v.chapterLabel)) {
      seen.add(v.chapterLabel)
      chapterOptions.push(v.chapterLabel)
    }
  })

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

      {/* Book-switcher pill bar — only shows once there's more than one
          book to switch between; sticky + scroll-snap for mobile swiping */}
      {STUDY_BOOKS.length > 1 && (
        <div className="sticky top-[73px] z-40 bg-cream/95 backdrop-blur-sm -mx-6 px-6 py-3 mb-8 border-b border-border">
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {STUDY_BOOKS.map(b => (
              <Link
                key={b.slug}
                href={`/study/${b.slug}`}
                className={`flex-shrink-0 snap-start text-sm font-medium rounded-full px-4 py-2 transition-colors ${
                  b.slug === book.slug
                    ? 'bg-amber text-white'
                    : 'bg-white border border-border text-dim hover:border-amber hover:text-amber'
                }`}
              >
                {b.displayName}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Hadith Study Guide
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2 leading-tight">
          {book.displayName}
        </h1>
        {book.author && (
          <p className="text-sm text-dim mb-3 font-reading">{book.author}</p>
        )}
        <p className="text-dim text-base leading-relaxed">
          {videos.length} lecture{videos.length !== 1 ? 's' : ''}, in the order they were given (2025 onward).
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No lectures from this book yet.</p>
        </div>
      ) : (
        <StudyBookGrid
          videos={enriched}
          chapterOptions={chapterOptions}
          years={years}
          months={months}
        />
      )}
    </div>
  )
}
