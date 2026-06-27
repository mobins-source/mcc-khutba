'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

/**
 * Smart back navigation for the lecture/khutba pages. These are now linked
 * to from many places (This Week, Study Guide, Library, Khutba Archive),
 * so a single hardcoded destination is wrong most of the time. Instead:
 *   - If the visitor actually navigated here from elsewhere on this site,
 *     "Back" uses real browser history (router.back()) — it returns to
 *     exactly where they were, filters and scroll position intact.
 *   - Otherwise (direct visit, bookmark, opened in a new tab — no in-app
 *     history to go back to) it falls back to a fixed link + label.
 */
export default function BackLink({ fallbackHref, fallbackLabel, className }) {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    let sameOrigin = false
    try {
      sameOrigin = Boolean(document.referrer) &&
        new URL(document.referrer).origin === window.location.origin
    } catch {
      sameOrigin = false
    }
    setCanGoBack(sameOrigin && window.history.length > 1)
  }, [])

  if (canGoBack) {
    return (
      <button
        onClick={() => router.back()}
        className={className}
        style={{ font: 'inherit', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
      >
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
        Back
      </button>
    )
  }

  return (
    <Link href={fallbackHref} className={className}>
      <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
      {fallbackLabel}
    </Link>
  )
}
