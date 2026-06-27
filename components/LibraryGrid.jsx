'use client'
import { useState, useMemo } from 'react'
import LibraryVideoRow from './LibraryVideoRow'

export default function LibraryGrid({ videos, years, months }) {
  const [yearFilter, setYearFilter]   = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = videos
    if (yearFilter  !== 'all') list = list.filter(v => String(v.year) === yearFilter)
    if (monthFilter !== 'all') list = list.filter(v => v.month === monthFilter)
    return list
  }, [videos, yearFilter, monthFilter])

  const hasFilter = yearFilter !== 'all' || monthFilter !== 'all'

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
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
            onClick={() => { setYearFilter('all'); setMonthFilter('all') }}
          >
            Clear filters
          </button>
        )}

        <span className="text-xs font-medium text-dim ml-auto">
          {filtered.length} lecture{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table-style list — one line per lecture, mobile included */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No lectures match these filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-border rounded-xl overflow-hidden card-shadow">
          {/* Column header — sm and up only, mirrors the columns shown per row */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-warm border-b border-border text-[10px] font-semibold uppercase tracking-wide text-muted">
            <span className="w-20 flex-shrink-0">Date</span>
            <span className="flex-shrink-0 w-56">Hijri Date</span>
            <span className="flex-1">Title</span>
            <span className="flex-shrink-0 w-10 text-right">Time</span>
            <span className="flex-shrink-0 w-4" />
          </div>
          {filtered.map(v => <LibraryVideoRow key={v.video_id} video={v} />)}
        </div>
      )}
    </div>
  )
}
