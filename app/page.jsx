import { getAllKhutbas, getAllTopicTags, getAllYears } from '../lib/data'
import KhutbaGrid from '../components/KhutbaGrid'

export default async function HomePage() {
  const khutbas = await getAllKhutbas()
  const tags    = await getAllTopicTags()
  const years   = await getAllYears()

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-3">
          Friday Sermons
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink mb-4 leading-tight">
          Jumaa Khutba<br />Archive
        </h1>
        <p className="text-dim text-base leading-relaxed">
          {khutbas.length} Friday sermons from MCC Tucson — searchable,
          readable, with full transcripts and summaries.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-10" />

      {/* Grid */}
      <KhutbaGrid khutbas={khutbas} tags={tags} years={years} />
    </div>
  )
}
