import Link from 'next/link'

export default function LibraryTileCard({ tile }) {
  return (
    <Link href={`/library/${tile.slug}`}>
      <article className="group bg-white border border-border rounded-xl p-5 card-shadow transition-all duration-200 cursor-pointer h-full flex flex-col hover:border-amber/40">

        <div className="flex items-center justify-between mb-4">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${tile.dot}`} />
          <span className="text-[11px] text-muted bg-warm rounded-full px-2 py-0.5">
            {tile.videoCount} lecture{tile.videoCount !== 1 ? 's' : ''}
          </span>
        </div>

        <h2 className="font-display font-semibold text-lg text-ink leading-snug mb-2 group-hover:text-amber-dark transition-colors flex-1">
          {tile.label}
        </h2>

        <div className="flex items-center justify-end mt-auto pt-3 border-t border-border/60">
          <span className="text-amber opacity-0 group-hover:opacity-100 transition-opacity text-sm">
            →
          </span>
        </div>
      </article>
    </Link>
  )
}
