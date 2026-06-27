import { getAllKhutbas, getAllTopicTags, getAllYears, getAllMonths } from '../../lib/data'
import KhutbaGrid from '../../components/KhutbaGrid'

export const metadata = {
  title:       'Khutba Archive — MCC Tucson',
  description: 'Every Friday sermon from MCC Tucson — searchable by year, month, and topic, with full transcripts and summaries.',
}

export default async function KhutbaArchivePage() {
  const khutbas = await getAllKhutbas()
  const tags    = await getAllTopicTags()
  const years   = await getAllYears()
  const months  = await getAllMonths()

  return (
    <div>
      {/* Hero */}
      <div className="mb-10 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-2">
          Friday Sermons
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2 leading-tight">
          Jumaa Khutba Archive
        </h1>
        <p className="text-dim text-base leading-relaxed">
          {khutbas.length} Friday sermons from MCC Tucson — searchable,
          readable, with full transcripts and summaries.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-10" />

      {/* Grid */}
      <KhutbaGrid khutbas={khutbas} tags={tags} years={years} months={months} />
    </div>
  )
}
