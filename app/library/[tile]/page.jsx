import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getLibraryTileConfig, getLibraryTileVideos, getAllLibraryTileSlugs,
  getLibraryTileYears, getLibraryTileMonths,
} from '../../../lib/data'
import LibraryGrid from '../../../components/LibraryGrid'

export async function generateStaticParams() {
  return getAllLibraryTileSlugs().map(tile => ({ tile }))
}

export async function generateMetadata({ params }) {
  const tile = getLibraryTileConfig(params.tile)
  if (!tile) return {}
  return {
    title:       `${tile.label} — MCC Tucson`,
    description: `All ${tile.label.toLowerCase()} from MCC Tucson, newest first.`,
  }
}

export default async function LibraryTilePage({ params }) {
  const tile = getLibraryTileConfig(params.tile)
  if (!tile) notFound()

  const videos = await getLibraryTileVideos(params.tile)
  const years  = await getLibraryTileYears(params.tile)
  const months = await getLibraryTileMonths(params.tile)

  return (
    <div>
      {/* Back link */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-amber transition-colors mb-8 group"
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        Library
      </Link>

      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Library
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-2 leading-tight">
          {tile.label}
        </h1>
        <p className="text-dim text-base leading-relaxed">
          {videos.length} lecture{videos.length !== 1 ? 's' : ''}, newest first.
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No lectures here yet.</p>
        </div>
      ) : (
        <LibraryGrid videos={videos} years={years} months={months} />
      )}
    </div>
  )
}
