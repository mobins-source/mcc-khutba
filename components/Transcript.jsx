'use client'
import { useState } from 'react'

function formatSrtTime(secs) {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function Paragraph({ text }) {
  if (text === '[Arabic recitation]')
    return (
      <p>
        <span className="marker-arabic">
          [Arabic recitation]
        </span>
      </p>
    )
  if (text === '[Silence]')
    return <p><span className="marker-silence">[Silence]</span></p>
  return <p>{text}</p>
}

export default function Transcript({ text, videoUrl, segments }) {
  const [view, setView] = useState('clean')
  const paragraphs = text.split('\n\n').filter(Boolean)

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'clean',       label: 'Clean reading' },
          { id: 'timestamped', label: 'Timestamped' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`text-xs font-medium px-5 py-2 rounded-full border transition-all ${
              view === id
                ? 'bg-amber text-white border-amber shadow-sm'
                : 'bg-white border-border text-dim hover:border-amber/40 hover:text-amber-dark'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Clean transcript */}
      {view === 'clean' && (
        <div className="transcript-body">
          {paragraphs.map((p, i) => <Paragraph key={i} text={p} />)}
        </div>
      )}

      {/* Timestamped */}
      {view === 'timestamped' && segments?.length > 0 && (
        <div className="divide-y divide-border">
          {segments.map((seg, i) => (
            <div key={i} className="flex gap-5 py-3 group">
              <a
                href={`${videoUrl}&t=${Math.floor(seg.start)}`}
                target="_blank" rel="noreferrer"
                className="text-amber text-xs font-mono min-w-[44px] flex-shrink-0 hover:text-amber-dark transition-colors pt-0.5 group-hover:underline"
              >
                {formatSrtTime(seg.start)}
              </a>
              <span className="font-reading text-[15px] text-body leading-relaxed">{seg.text}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'timestamped' && !segments?.length && (
        <p className="text-dim text-sm">Timestamped view unavailable for this sermon.</p>
      )}
    </div>
  )
}
