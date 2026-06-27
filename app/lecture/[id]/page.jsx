import { notFound } from 'next/navigation'
import Link         from 'next/link'
import {
  getVideo, getAllVideoIds,
  getCleanTranscript, getTranscriptJson,
  formatDuration, formatTime, formatHijriDate,
} from '../../../lib/data'
import Transcript           from '../../../components/Transcript'
import TranscriptDisclaimer from '../../../components/TranscriptDisclaimer'
import BackLink             from '../../../components/BackLink'

export async function generateStaticParams() {
  const ids = await getAllVideoIds()
  return ids.map(id => ({ id }))
}

export async function generateMetadata({ params }) {
  const v = await getVideo(params.id)
  if (!v) return {}
  const title = v.catchy_title || v.suggested_title || v.title
  return {
    title:       `${title} — MCC Tucson`,
    description: v.summary?.split('\n')[0] ?? '',
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`
}

export default async function LecturePage({ params }) {
  const v = await getVideo(params.id)
  if (!v) notFound()

  const cleanTxt = v.channel_id ? await getCleanTranscript(v.channel_id, v.video_id) : null
  const tx       = v.channel_id ? await getTranscriptJson(v.channel_id, v.video_id)  : null
  const duration = formatDuration(v.duration_seconds)
  const time     = formatTime(v.post_time)
  const hijri    = formatHijriDate(v.post_date)
  const hasTranscript = Boolean(cleanTxt || tx?.clean_text)

  // Title hierarchy: catchy_title (public headline) -> suggested_title (descriptive) -> raw title
  const primaryTitle = v.catchy_title || v.suggested_title || v.title
  const showSuggestedAsSecondary = v.catchy_title && v.suggested_title && v.suggested_title !== primaryTitle

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back link */}
      <BackLink
        fallbackHref="/this-week"
        fallbackLabel="This Week"
        className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-amber transition-colors mb-10 group"
      />

      {/* Article header */}
      <header className="mb-10">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-dim mb-5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber" />
          <span className="font-medium">{formatDate(v.post_date)}</span>
          {hijri && (
            <>
              <span>·</span>
              <span
                className="text-muted"
                title="Calculated Hijri date — confirm with MCC Tucson for exact religious observance dates"
              >
                {hijri}
              </span>
            </>
          )}
          {time         && <><span>·</span><span className="text-blue">{time}</span></>}
          {duration     && <><span>·</span><span>{duration}</span></>}
          {v.time_slot  && <><span>·</span><span className="text-amber-dark font-medium">{v.time_slot}</span></>}
        </div>

        {/* Title */}
        <h1 className={`font-display font-bold text-3xl sm:text-4xl text-ink leading-tight ${showSuggestedAsSecondary ? 'mb-2' : 'mb-6'}`}>
          {primaryTitle}
        </h1>
        {showSuggestedAsSecondary && (
          <p className="text-sm text-dim mb-6">{v.suggested_title}</p>
        )}

        {/* Topic tags (hadith book intentionally not shown here) */}
        {v.topic_tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {v.topic_tags.map(tag => (
              <span
                key={tag}
                className="text-xs text-amber-dark bg-amber-bg border border-amber/20 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Watch button */}
        <a
          href={v.url}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-amber hover:bg-amber-dark rounded-xl px-5 py-2.5 transition-colors"
        >
          <span>▶</span> Watch on YouTube
        </a>
      </header>

      {/* Decorative rule */}
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 border-t border-border" />
        <span className="text-amber text-lg">✦</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Summary */}
      {v.summary && (
        <section className="mb-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-5">
            Summary
          </h2>
          <div className="font-reading text-[16px] text-body leading-relaxed space-y-4">
            {v.summary.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* Transcript divider */}
      <div className="flex items-center gap-4 my-10">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs font-medium uppercase tracking-widest text-muted px-2">
          Transcript
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Transcript */}
      <section className="mb-16">
        {hasTranscript && <TranscriptDisclaimer />}
        {cleanTxt ? (
          <Transcript text={cleanTxt} videoUrl={v.url} segments={tx?.segments} />
        ) : tx?.clean_text ? (
          <div className="font-reading text-reading text-body leading-relaxed">
            <p>{tx.clean_text}</p>
          </div>
        ) : (
          <div className="text-center py-12 text-dim">
            <p className="text-sm">Transcript not yet available for this lecture.</p>
          </div>
        )}
      </section>

      {/* Footer nav */}
      <div className="pt-8 border-t border-border flex items-center justify-between">
        <BackLink
          fallbackHref="/this-week"
          fallbackLabel="This Week"
          className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-amber transition-colors group"
        />
        <a
          href={v.url}
          target="_blank" rel="noreferrer"
          className="text-xs text-muted hover:text-amber transition-colors"
        >
          ↗ YouTube
        </a>
      </div>
    </div>
  )
}
