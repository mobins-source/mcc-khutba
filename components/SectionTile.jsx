import Link from 'next/link'

/**
 * Generic homepage section tile — links to a major site section (Khutba
 * Archive, Library, Study Guide). `muted` gives a section a visually
 * quieter, dashed-border treatment for things that are still filling in
 * (currently used for Study Guide, which only has one book so far) without
 * making it non-functional.
 */
export default function SectionTile({ href, title, description, badge, muted = false }) {
  return (
    <Link href={href}>
      <article className={`group rounded-xl p-5 transition-all duration-200 cursor-pointer h-full flex flex-col ${
        muted
          ? 'bg-warm border border-dashed border-border-strong'
          : 'bg-white border border-border card-shadow hover:border-amber/40'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${muted ? 'bg-muted' : 'bg-amber/60'}`} />
          {badge && (
            <span className={`text-[11px] rounded-full px-2 py-0.5 ${muted ? 'text-muted bg-white' : 'text-muted bg-warm'}`}>
              {badge}
            </span>
          )}
        </div>

        <h2 className={`font-display font-semibold text-base mb-2 transition-colors flex-1 ${
          muted ? 'text-dim' : 'text-ink group-hover:text-amber-dark'
        }`}>
          {title}
        </h2>

        <p className={`text-xs leading-relaxed mb-4 ${muted ? 'text-muted' : 'text-dim'}`}>
          {description}
        </p>

        <div className="flex items-center justify-end mt-auto">
          <span className={`text-sm transition-opacity ${
            muted ? 'text-muted opacity-0' : 'text-amber opacity-0 group-hover:opacity-100'
          }`}>
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
