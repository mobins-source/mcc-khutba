'use client'
import { useState, useMemo } from 'react'
import HadithVideoCard from './HadithVideoCard'

const TIME_OF_DAY_TABS = [
  { key: 'all',  label: 'All' },
  { key: 'Fajr', label: 'Fajr' },
  { key: 'Isha', label: 'Isha' },
]

export default function StudyBookGrid({ videos, chapterOptions, years, months }) {
  const [chapterFilter, setChapterFilter] = useState('all')
  const [yearFilter, setYearFilter]       = useState('all')
  const [monthFilter, setMonthFilter]     = useState('all')
  const [timeFilter, setTimeFilter]       = useState('all')

  // Chapter/year/month narrow the set first; the time-of-day tab is applied
  // on top of that, and its live counts reflect those other filters too.
  const beforeTimeFilter = useMemo(() => {
    let list = videos
    if (chapterFilter !== 'all') list = list.filter(v => v.chapterLabel === chapterFilter)
    if (yearFilter   !== 'all') list = list.filter(v => String(v.year) === yearFilter)
    if (monthFilter  !== 'all') list = list.filter(v => v.month === monthFilter)
    return list
  }, [videos, chapterFilter, yearFilter, monthFilter])

  const timeCounts = useMemo(() => {
    const counts = { all: beforeTimeFilter.length, Fajr: 0, Isha: 0 }
    beforeTimeFilter.forEach(v => {
      if (counts[v.time_of_day] !== undefined) counts[v.time_of_day]++
    })
    return counts
  }, [beforeTimeFilter])

  const filtered = useMemo(() => {
    // Chapter is a filter/label only, never a grouping structure — the list
    // always stays chronological regardless of which filters are active.
    if (timeFilter === 'all') return beforeTimeFilter
    return beforeTimeFilter.filter(v => v.time_of_day === timeFilter)
  }, [beforeTimeFilter, timeFilter])

  const hasFilter = chapterFilter !== 'all' || yearFilter !== 'all' || monthFilter !== 'all' || timeFilter !== 'all'

  return (
    <div>
      {/* Fajr / Isha view tabs — like a dedicated section toggle, not a
          dropdown, since this is the primary way to jump to one series */}
      <div className="flex gap-2 mb-5">
        {TIME_OF_DAY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTimeFilter(tab.key)}
            className={`text-sm font-medium rounded-full px-4 py-2 transition-colors ${
              timeFilter === tab.key
                ? 'bg-amber text-white'
                : 'bg-white border border-border text-dim hover:border-amber hover:text-amber'
            }`}
          >
            {tab.label} <span className="opacity-70">({timeCounts[tab.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {chapterOptions.length > 0 && (
          <select
            className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-amber cursor-pointer max-w-full"
            value={chapterFilter}
            onChange={e => setChapterFilter(e.target.value)}
          >
            <option value="all">All chapters</option>
            {chapterOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <select
          className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-amber cursor-pointer"
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
        >
          <option value="all">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select
          className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-amber cursor-pointer"
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
        >
          <option value="all">All months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        {hasFilter && (
          <button
            className="text-xs text-dim border border-border rounded-xl px-4 py-2.5 bg-white hover:text-amber hover:border-amber transition-colors"
            onClick={() => {
              setChapterFilter('all'); setYearFilter('all'); setMonthFilter('all'); setTimeFilter('all')
            }}
          >
            Clear filters
          </button>
        )}

        <span className="text-xs font-medium text-dim ml-auto">
          {filtered.length} lecture{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table-style chronological list — one line per lecture so many more
          fit on screen at once than a card grid would, mobile included */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No lectures match these filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden card-shadow">
          {/* Column header — sm and up only, mirrors the columns shown per row */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-warm border-b border-border text-[10px] font-semibold uppercase tracking-wide text-muted">
            <span className="w-14 flex-shrink-0">Date</span>
            <span className="flex-shrink-0 w-[200px]">Chapter</span>
            <span className="flex-1">Title</span>
            <span className="flex-shrink-0 w-10 text-right">Time</span>
            <span className="flex-shrink-0 w-4" />
          </div>
          {filtered.map(v => <HadithVideoCard key={v.video_id} video={v} />)}
        </div>
      )}
    </div>
  )
}
