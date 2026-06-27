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
  return `${months[parseInt(m) - 1]} ${parseInt(d)} '${y.slice(-2)}`
}

function formatWeekdayShort(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return days[new Date(y, m - 1, d).getDay()]
}

/** Calculated Hijri date, e.g. "Dhul-Hijjah 5, 1447 AH" — same islamic-umalqura
    approach as lib/data.js's formatHijriDate, duplicated locally per this
    codebase's existing convention of small per-card formatters. */
function formatHijriShort(dateStr) {
  if (!dateStr) return null
  try {
    const date = new Date(`${dateStr}T00:00:00`)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-US', {
      calendar: 'islamic-umalqura',
      day:   'numeric',
      month: 'long',
      year:  'numeric',
      era:   'short',
    }).format(date)
  } catch {
    return null
  }
}

/**
 * Compact single-line table row for the Library pages (Fajr / Isha /
 * Ramadan). Mobile shows just the short Gregorian date to keep the row to
 * one line; sm and up adds the weekday + calculated Hijri date. The
 * content_type pill was removed per feedback — not useful enough to keep.
 */
export default function LibraryVideoRow({ video: v }) {
  const duration = formatDur(v.duration_seconds)
  const date     = formatDateShort(v.post_date)
  const weekday  = formatWeekdayShort(v.post_date)
  const hijri    = formatHijriShort(v.post_date)
  const title    = v.catchy_title || v.suggested_title || v.title
  const href     = `/lecture/${v.video_id}`

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-border/60 last:border-b-0 hover:bg-warm transition-colors"
    >
      {/* Date (Gregorian, short) */}
      <span className="w-16 sm:w-20 flex-shrink-0 text-[11px] text-dim">
        {date}
      </span>

      {/* Weekday + Hijri date — sm and up only */}
      {(weekday || hijri) && (
        <span
          className="hidden sm:inline-block flex-shrink-0 w-56 truncate text-[11px] text-muted"
          title={[weekday, hijri].filter(Boolean).join(' · ')}
        >
          {weekday && <span className="text-dim">{weekday}</span>}
          {weekday && hijri && ' · '}
          {hijri}
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
