import Link from 'next/link'

function formatDur(secs) {
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}

/**
 * Compact single-line table row — used inside StudyBookGrid's table-style
 * list so far more lectures fit on screen at once, including on mobile.
 * Chapter and duration columns hide below `sm` so the row stays one line;
 * date + title + arrow always show.
 */
export default function HadithVideoCard({ video: v }) {
  const duration = formatDur(v.duration_seconds)
  const date     = formatDateShort(v.post_date)
  const title    = v.catchy_title || v.suggested_title || v.title
  const isKhutba = v.time_slot === 'Jumaa Khutba'
  const href     = isKhutba ? `/khutba/${v.video_id}` : `/lecture/${v.video_id}`

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-border/60 last:border-b-0 hover:bg-warm transition-colors"
    >
      {/* Date */}
      <span className="w-11 sm:w-14 flex-shrink-0 text-[11px] text-dim">
        {date}
      </span>

      {/* Chapter — sm and up only, to keep the mobile row to one line */}
      {v.chapterLabel && (
        <span
          className={`hidden sm:inline-block flex-shrink-0 max-w-[200px] truncate text-[10px] font-medium rounded-full px-2 py-0.5 ${
            v.chapterMatched ? 'bg-amber-bg text-amber-dark' : 'bg-warm text-dim'
          }`}
          title={v.chapterLabel}
        >
          {v.chapterLabel}
        </span>
      )}

      {/* Title */}
      <span className="flex-1 min-w-0 truncate text-sm font-medium text-ink group-hover:text-amber-dark transition-colors">
        {title}
      </span>

      {/* Duration — sm and up only */}
      {duration && (
        <span className="hidden sm:inline-block flex-shrink-0 w-10 text-right text-[11px] text-muted">
          {duration}
        </span>
      )}

      {/* Arrow */}
      <span className="flex-shrink-0 text-amber opacity-0 group-hover:opacity-100 transition-opacity text-sm">
        →
      </span>
    </Link>
  )
}
