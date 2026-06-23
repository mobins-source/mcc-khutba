import { getRecentVideos, formatHijriDate } from '../../lib/data'
import LectureCard from '../../components/LectureCard'

function formatDateHeader(dateStr) {
  if (!dateStr || dateStr === 'unknown') return 'Date unknown'
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const gregorian = `${days[date.getDay()]}, ${months[m - 1]} ${d}`
  const hijri = formatHijriDate(dateStr)
  return { gregorian, hijri }
}

export const metadata = {
  title:       'This Week — MCC Tucson',
  description: 'Lectures from the past 7 days — Fajr, Zuhr, Isha, and Jumaa Khutba.',
}

export default async function ThisWeekPage() {
  const videos = await getRecentVideos(7)

  // Group by post_date so multiple lectures on the same day sit together
  const groups = {}
  videos.forEach(v => {
    const key = v.post_date || 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  })
  const orderedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  return (
    <div>
      {/* Hero */}
      <div className="mb-12 max-w-2xl">
        <div className="text-xs font-medium text-amber uppercase tracking-widest mb-3">
          This Week
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink mb-4 leading-tight">
          Recent Lectures
        </h1>
        <p className="text-dim text-base leading-relaxed">
          {videos.length} lecture{videos.length !== 1 ? 's' : ''} from the last 7 days —
          Fajr, Zuhr, Isha, and Jumaa Khutba.
        </p>
      </div>

      <div className="border-t border-border mb-10" />

      {/* Empty state */}
      {videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No lectures found in the last 7 days yet.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {orderedDates.map(date => {
            const { gregorian, hijri } = formatDateHeader(date)
            return (
              <section key={date}>
                <h2 className="flex items-baseline gap-2 text-sm font-semibold text-ink mb-4 pb-2 border-b border-border">
                  <span>{gregorian}</span>
                  {hijri && (
                    <span
                      className="text-xs font-normal text-muted"
                      title="Calculated Hijri date — confirm with MCC Tucson for exact religious observance dates"
                    >
                      · {hijri}
                    </span>
                  )}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {groups[date].map(v => <LectureCard key={v.video_id} video={v} />)}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
