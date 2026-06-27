'use client'
import { useState } from 'react'

const LINKS = [
  { href: '/this-week', label: 'This Week' },
  { href: '/khutba',    label: 'Khutba Archive' },
  { href: '/library',   label: 'Library' },
  { href: '/study',     label: 'Study Guide' },
]

const EXTERNAL_LINKS = [
  { href: 'https://mcctucson.org',               label: 'mcctucson.org' },
  { href: 'https://www.youtube.com/@mcctucson',  label: 'YouTube' },
]

/**
 * Mobile-only hamburger menu — replaces the inline nav row below the `sm`
 * breakpoint, where the 4 page links + logo no longer fit the viewport
 * width. Also surfaces the two external links (mcctucson.org, YouTube)
 * that were previously hidden entirely on mobile with no other way to
 * reach them. Shown via `<div className="sm:hidden">` in layout.jsx; the
 * existing inline <nav> stays `hidden sm:flex` and handles sm and up.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-white text-ink text-lg hover:border-amber hover:text-amber transition-colors"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <>
          {/* Tap outside to close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            {LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-dim hover:text-amber hover:bg-warm transition-colors border-b border-border/60"
              >
                {link.label}
              </a>
            ))}
            {EXTERNAL_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank" rel="noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs text-muted hover:text-amber hover:bg-warm transition-colors ${
                  i < EXTERNAL_LINKS.length - 1 ? 'border-b border-border/60' : ''
                }`}
              >
                <span>↗</span> {link.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
