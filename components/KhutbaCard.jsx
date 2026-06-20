import Link from 'next/link'

function formatDur(secs) {
  if (!secs) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

export default function KhutbaCard({ khutba: k }) {
  const duration = formatDur(k.duration_seconds)
  const date     = formatDate(k.post_date)
  const title    = k.catchy_title || k.suggested_title || k.title

  return (
    <Link href={`/khutba/${k.video_id}`}>
      <article className="group bg-white border border-border rounded-xl p-5 card-shadow transition-all duration-200 cursor-pointer h-full flex flex-col hover:border-amber/40">

        {/* Top bar: date + duration */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber/60 flex-shrink-0" />
            <span className="text-xs text-dim">{date}</span>
          </div>
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
        {k.summary && (
          <p className="text-xs text-dim leading-relaxed mb-4 line-clamp-3 font-reading">
            {k.summary.split('\n')[0]}
          </p>
        )}

        {/* Footer: tags + arrow */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border/60">
          {k.topic_tags?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {k.topic_tags.slice(0, 3).map(tag => (
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
