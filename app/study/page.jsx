import { getStudyBooksWithCounts, getSheikhAliSeriesWithCounts } from '../../lib/data'
import StudyBookCard from '../../components/StudyBookCard'
import StudySeriesCard from '../../components/StudySeriesCard'

export const metadata = {
  title:       'Study Guide — MCC Tucson',
  description: 'Browse Islamic lectures by book and series — hadith, tafsir, and seerah.',
}

export default async function StudyPage() {
  const [books, series] = await Promise.all([
    getStudyBooksWithCounts(),
    getSheikhAliSeriesWithCounts(),
  ])

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Study Guide
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
          Browse by Book &amp; Series
        </h1>
        <p className="text-dim text-base leading-relaxed">
          Lectures organized by the text or series they follow — in the order
          they were given, with chapters labeled wherever they could be matched
          to the published text.
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* MCC Tucson — Hadith Programs */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
          <h2 className="font-display text-lg font-semibold text-ink">
            MCC Tucson — Hadith Programs
          </h2>
        </div>
        {books.length === 0 ? (
          <p className="text-dim text-sm">No study guides available yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map(b => <StudyBookCard key={b.slug} book={b} />)}
          </div>
        )}
      </section>

      {/* Sh. Ali Mashhour — Series */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Sh. Ali Mashhour — Lecture Series
          </h2>
        </div>
        <p className="text-xs text-dim mb-6 ml-5">
          The Mosque Foundation, Bridgeview, IL
        </p>
        {series.length === 0 ? (
          <p className="text-dim text-sm">No series available yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {series.map(s => <StudySeriesCard key={s.slug} series={s} />)}
          </div>
        )}
      </section>

      <p className="text-xs text-muted mt-4">
        More books and series will appear as their content is added.
      </p>
    </div>
  )
}
