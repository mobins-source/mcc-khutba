'use client'
import { useState, useMemo } from 'react'
import KhutbaCard from './KhutbaCard'

export default function KhutbaGrid({ khutbas, tags, years }) {
  const [query, setQuery]     = useState('')
  const [yearFilter, setYear] = useState('all')
  const [tagFilter, setTag]   = useState('all')

  const filtered = useMemo(() => {
    let list = khutbas
    if (yearFilter !== 'all') list = list.filter(k => String(k.year) === yearFilter)
    if (tagFilter  !== 'all') list = list.filter(k => (k.topic_tags || []).includes(tagFilter))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(k =>
        k.catchy_title?.toLowerCase().includes(q) ||
        k.suggested_title?.toLowerCase().includes(q) ||
        k.summary?.toLowerCase().includes(q) ||
        (k.topic_tags || []).some(t => t.includes(q))
      )
    }
    return list
  }, [khutbas, query, yearFilter, tagFilter])

  const hasFilter = query || yearFilter !== 'all' || tagFilter !== 'all'

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-56">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base pointer-events-none">
            ⌕
          </span>
          <input
            className="w-full bg-white border border-border rounded-xl px-4 py-2.5 pl-9 text-sm text-ink placeholder-placeholder outline-none focus:border-amber focus:ring-2 focus:ring-amber/10 transition-all"
            placeholder="Search titles, topics, summaries…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Year */}
        <select
          className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-amber cursor-pointer"
          value={yearFilter}
          onChange={e => setYear(e.target.value)}
        >
          <option value="all">All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Topic */}
        <select
          className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-amber cursor-pointer"
          value={tagFilter}
          onChange={e => setTag(e.target.value)}
        >
          <option value="all">All topics</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {hasFilter && (
          <button
            className="text-xs text-dim border border-border rounded-xl px-4 py-2.5 bg-white hover:text-amber hover:border-amber transition-colors"
            onClick={() => { setQuery(''); setYear('all'); setTag('all') }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs font-medium text-dim">
          {filtered.length} sermon{filtered.length !== 1 ? 's' : ''}
          {hasFilter ? ' found' : ''}
        </span>
        {hasFilter && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber" />
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-4xl mb-4">◌</div>
          <p className="text-dim">No sermons match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(k => <KhutbaCard key={k.video_id} khutba={k} />)}
        </div>
      )}
    </div>
  )
}
