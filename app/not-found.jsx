export default function NotFound() {
  return (
    <div className="text-center py-32 max-w-sm mx-auto">
      <div className="text-5xl mb-6">◌</div>
      <h2 className="font-display text-2xl font-semibold text-ink mb-3">
        Khutba not found
      </h2>
      <p className="text-dim text-sm mb-8 leading-relaxed">
        This sermon may not be in the archive yet, or the link may be incorrect.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-white bg-amber hover:bg-amber-dark rounded-xl px-5 py-2.5 transition-colors"
      >
        ← Back to archive
      </a>
    </div>
  )
}
