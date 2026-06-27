import Link from 'next/link'

export default function StudyBookCard({ book }) {
  return (
    <Link href={`/study/${book.slug}`}>
      <article className="group bg-white border border-border rounded-xl p-5 card-shadow transition-all duration-200 cursor-pointer h-full flex flex-col hover:border-amber/40">

        {/* Top bar: marker + video count */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber/60 flex-shrink-0" />
          <span className="text-[11px] text-muted bg-warm rounded-full px-2 py-0.5">
            {book.videoCount} lecture{book.videoCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display font-semibold text-lg text-ink leading-snug mb-2 group-hover:text-amber-dark transition-colors">
          {book.displayName}
        </h2>

        {/* Author */}
        {book.author && (
          <p className="text-xs text-dim leading-relaxed mb-4 font-reading flex-1">
            {book.author}
          </p>
        )}

        {/* Footer: chapter count + arrow */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/60">
          <span className="text-[10px] text-muted bg-warm rounded-full px-2 py-0.5">
            {book.canonical?.chapters?.length ?? 0} chapters
          </span>
          <span className="text-amber opacity-0 group-hover:opacity-100 transition-opacity text-sm">
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
