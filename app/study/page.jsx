import { getStudyBooksWithCounts } from '../../lib/data'
import StudyBookCard from '../../components/StudyBookCard'

export const metadata = {
  title:       'Hadith Study Guide — MCC Tucson',
  description: 'Browse hadith lectures chapter by chapter, book by book.',
}

export default async function StudyPage() {
  const books = await getStudyBooksWithCounts()

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Hadith Study Guide
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
          Browse by Book
        </h1>
        <p className="text-dim text-base leading-relaxed">
          Lectures from each hadith collection, in the order they were given,
          with chapters labeled wherever they could be matched to the
          published text.
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* Grid */}
      {books.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No study guides are available yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map(b => <StudyBookCard key={b.slug} book={b} />)}
        </div>
      )}

      <p className="text-xs text-muted mt-10">
        More books will appear here as their published chapter lists are added.
      </p>
    </div>
  )
}
