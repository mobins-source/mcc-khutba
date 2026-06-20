import './globals.css'

export const metadata = {
  title:       'Jumaa Khutba Archive — MCC Tucson',
  description: 'Friday sermon archive from Muslim Community Center of Tucson',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink">

        {/* Top accent strip */}
        <div className="pattern-strip" />

        {/* Header */}
        <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="group flex items-center gap-3">
              {/* Geometric mark */}
              <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold font-display">م</span>
              </div>
              <div>
                <div className="font-display font-semibold text-lg text-ink leading-tight group-hover:text-amber transition-colors">
                  Jumaa Khutba Archive
                </div>
                <div className="text-[11px] text-muted">Muslim Community Center of Tucson</div>
              </div>
            </a>

            <nav className="flex items-center gap-2 sm:gap-4">
              <a
                href="/this-week"
                className="text-xs sm:text-sm font-medium text-dim hover:text-amber transition-colors px-2 py-1"
              >
                This Week
              </a>
              <a
                href="/"
                className="text-xs sm:text-sm font-medium text-dim hover:text-amber transition-colors px-2 py-1"
              >
                Khutba Archive
              </a>
              <a
                href="https://www.youtube.com/@mcctucson"
                target="_blank" rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-xs text-dim border border-border rounded-full px-4 py-2 hover:border-amber hover:text-amber transition-colors"
              >
                <span>↗</span> YouTube
              </a>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-5xl mx-auto px-6 py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-warm mt-24 py-10">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-amber flex items-center justify-center">
                <span className="text-white text-xs font-bold">م</span>
              </div>
              <span className="text-sm text-dim">Muslim Community Center of Tucson</span>
            </div>
            <a
              href="https://www.youtube.com/@mcctucson"
              target="_blank" rel="noreferrer"
              className="text-xs text-muted hover:text-amber transition-colors"
            >
              @mcctucson on YouTube
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}
