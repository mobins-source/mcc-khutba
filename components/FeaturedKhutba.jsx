import Link from 'next/link'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

/**
 * Homepage spotlight for the most recent khutba — a single larger card,
 * distinct from the grid-sized KhutbaCard, so the homepage reads as a
 * preview rather than duplicating the full archive experience.
 */
export default function FeaturedKhutba({ khutba: k }) {
  if (!k) return null
  const title = k.catchy_title || k.suggested_title || k.title

  return (
    <Link href={`/khutba/${k.video_id}`}>
      <article className="group bg-white border border-border border-l-[3px] border-l-amber rounded-xl p-6 card-shadow transition-all duration-200 cursor-pointer hover:border-amber/40">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber mb-3">
          This Friday's Khutba
        </div>
        <h2 className="font-display font-semibold text-xl text-ink leading-snug mb-3 group-hover:text-amber-dark transition-colors">
          {title}
        </h2>
        {k.summary && (
          <p className="font-reading text-sm text-dim leading-relaxed mb-4">
            {k.summary.split('\n')[0]}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">{formatDate(k.post_date)}</span>
          <span className="text-sm font-medium text-amber group-hover:text-amber-dark transition-colors">
            Read full khutba →
          </span>
        </div>
      </article>
    </Link>
  )
}
