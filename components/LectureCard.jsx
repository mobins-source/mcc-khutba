import Link from 'next/link'

const TIME_BADGE = {
  Fajr: { bg: 'bg-blue/10',     text: 'text-blue' },
  Zuhr: { bg: 'bg-amber-bg',    text: 'text-amber-dark' },
  Isha: { bg: 'bg-purple-bg',   text: 'text-purple' },
}

function formatDur(secs) {
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function LectureCard({ video: v }) {
  const duration = formatDur(v.duration_seconds)
  const title    = v.catchy_title || v.suggested_title || v.title
  const isKhutba = v.time_slot === 'Jumaa Khutba'
  const href     = isKhutba ? `/khutba/${v.video_id}` : `/lecture/${v.video_id}`

  const badge = isKhutba
    ? { bg: 'bg-amber-bg', text: 'text-amber-dark', label: 'Jumaa Khutba' }
    : TIME_BADGE[v.time_of_day]
      ? { ...TIME_BADGE[v.time_of_day], label: v.time_of_day }
      : null

  return (
    <Link href={href}>
      <article className="group bg-white border border-border rounded-xl p-5 card-shadow transition-all duration-200 cursor-pointer h-full flex flex-col hover:border-amber/40">

        {/* Top bar: time-of-day badge + duration */}
        <div className="flex items-center justify-between mb-3">
          {badge ? (
            <span className={`text-[11px] font-medium ${badge.bg} ${badge.text} rounded-full px-2.5 py-1`}>
              {badge.label}
            </span>
          ) : <span />}
          {duration && (
            <span className="text-[11px] text-muted bg-warm rounded-full px-2 py-0.5">
              {duration}
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-display font-semibold text-[15px] text-ink leading-snug mb-3 group-hover:text-amber-dark transition-colors line-clamp-3 flex-1">
          {title}
        </h2>

        {/* Summary excerpt */}
        {v.summary && (
          <p className="text-xs text-dim leading-relaxed mb-4 line-clamp-2 font-reading">
            {v.summary.split('\n')[0]}
          </p>
        )}

        {/* Footer: book / tags + arrow */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/60">
          {v.hadith_book ? (
            <span className="text-[10px] text-green bg-green-bg rounded-full px-2 py-0.5">
              {v.hadith_book}
            </span>
          ) : v.topic_tags?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {v.topic_tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[10px] text-muted bg-warm rounded-full px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          ) : <span />}
          <span className="text-amber opacity-0 group-hover:opacity-100 transition-opacity text-sm">
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
