import Link from 'next/link'

const TYPE_COLORS = {
  'Tafsir':      'bg-blue-50 text-blue-700 border-blue-100',
  'Seerah & Fiqh': 'bg-amber-50 text-amber-700 border-amber-100',
  'Lecture':     'bg-warm text-dim border-border',
}

export default function StudySeriesCard({ series }) {
  const typeStyle = TYPE_COLORS[series.type] ?? TYPE_COLORS['Lecture']

  return (
    <Link href={`/study/sheikh-ali/${series.slug}`}>
      <article className="group bg-white border border-border rounded-xl p-5 card-shadow transition-all duration-200 cursor-pointer h-full flex flex-col hover:border-teal-400/40">

        {/* Top bar: type badge + video count */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-[10px] font-medium border rounded-full px-2 py-0.5 ${typeStyle}`}>
            {series.type}
          </span>
          <span className="text-[11px] text-muted bg-warm rounded-full px-2 py-0.5">
            {series.videoCount} lecture{series.videoCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display font-semibold text-base text-ink leading-snug mb-1 group-hover:text-teal-700 transition-colors">
          {series.displayName}
        </h2>

        {/* Arabic name */}
        {series.arabicName && (
          <p className="text-xs text-dim mb-2 font-reading" dir="rtl">
            {series.arabicName}
          </p>
        )}

        {/* Author */}
        {series.author && (
          <p className="text-xs text-dim leading-relaxed mb-3 font-reading flex-1">
            {series.author}
          </p>
        )}

        {/* Description */}
        {series.description && (
          <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-2">
            {series.description}
          </p>
        )}

        {/* Footer: arrow */}
        <div className="flex items-end justify-end mt-auto pt-3 border-t border-border/60">
          <span className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
