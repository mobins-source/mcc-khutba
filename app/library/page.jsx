import { getLibraryTilesWithCounts } from '../../lib/data'
import LibraryTileCard from '../../components/LibraryTileCard'

export const metadata = {
  title:       'Library — MCC Tucson',
  description: 'Browse all Fajr, Isha, and Ramadan lectures from MCC Tucson.',
}

export default async function LibraryPage() {
  const tiles = await getLibraryTilesWithCounts()

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Library
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-4 leading-tight">
          Browse All Lectures
        </h1>
        <p className="text-dim text-base leading-relaxed">
          Every Fajr, Isha, and Ramadan lecture from MCC Tucson, in one place —
          across every topic, not just hadith. Jumma khutbas have their own
          archive on the Khutba Archive page.
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* Tiles */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(t => <LibraryTileCard key={t.slug} tile={t} />)}
      </div>
    </div>
  )
}
