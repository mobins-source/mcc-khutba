'use client'
import { useState } from 'react'

// Set in .env.local (see .env.local.example) and in your Vercel project's
// env vars. This is a Formspree form ID, not a secret — it's meant to be
// visible client-side (that's how Formspree's whole model works), so the
// NEXT_PUBLIC_ prefix here is intentional, not an oversight.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID
const ENDPOINT = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : null

export default function FeedbackForm() {
  const [status, setStatus]     = useState('idle') // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target

    if (!ENDPOINT) {
      setStatus('error')
      setErrorMsg('The feedback form isn\u2019t fully set up yet \u2014 missing Formspree ID.')
      return
    }

    const data = new FormData(form)

    // Honeypot: real visitors never see or fill this field (hidden via the
    // `hidden` attribute + sr-only-style styling below). If it's filled in,
    // a bot probably did it \u2014 pretend success and silently drop the submission
    // rather than telling the bot it found a real field.
    if (data.get('_gotcha')) {
      setStatus('success')
      form.reset()
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        const json = await res.json().catch(() => null)
        const message =
          json?.errors?.map(err => err.message).join(', ') ||
          'Something went wrong sending your feedback. Please try again.'
        setStatus('error')
        setErrorMsg(message)
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error \u2014 please check your connection and try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white border border-border rounded-xl p-8 text-center card-shadow">
        <div className="text-3xl mb-3 text-green">\u2713</div>
        <h2 className="font-display text-lg font-semibold text-ink mb-2">
          Thank you
        </h2>
        <p className="text-dim text-sm leading-relaxed">
          Your feedback has been received. We read every message.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-5 text-xs text-amber hover:text-amber-dark transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      action={ENDPOINT || undefined}
      method="POST"
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-xl p-6 sm:p-8 card-shadow space-y-5"
    >
      {/* Honeypot field \u2014 hidden from real visitors, left for bots that fill every input */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label htmlFor="name" className="block text-xs font-medium text-dim mb-1.5">
          Name <span className="text-muted">(optional)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className="w-full bg-white border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/10 transition-all"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-dim mb-1.5">
          Email <span className="text-muted">(optional \u2014 only if you&rsquo;d like a reply)</span>
        </label>
        <input
          id="email"
          name="_replyto"
          type="email"
          autoComplete="email"
          className="w-full bg-white border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/10 transition-all"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-medium text-dim mb-1.5">
          Your feedback <span className="text-red">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full bg-white border border-border rounded-lg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-amber focus:ring-2 focus:ring-amber/10 transition-all resize-none"
          placeholder="What's working, what's not, what you'd like to see..."
        />
      </div>

      {status === 'error' && (
        <p className="text-xs text-red bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-amber text-white font-medium text-sm rounded-lg px-4 py-2.5 hover:bg-amber-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending\u2026' : 'Send feedback'}
      </button>
    </form>
  )
}
