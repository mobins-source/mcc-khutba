# MCC Khutba — Project Summary (for a new chat)

This covers a full build session on the **mcc-khutba** Next.js 14 App Router
site (`/Users/mobin/Documents/mcc-khutba`). A companion repo,
`/Users/mobin/Documents/yt-transcript-pipeline`, produces the data this site
reads (`data/metadata/index.json`, ~732 videos, fetched at build time via
GitHub Raw — see `lib/data.js`'s `GITHUB_RAW`/`INDEX_URL` constants). Nothing
in the pipeline repo was touched this session; everything below is
mcc-khutba frontend work.

If you're picking this up fresh: read this whole file, then `lib/data.js`
top to bottom — almost every feature below hangs off a function added there.

## Site map (current)

| Route | What it is |
|---|---|
| `/` | **New homepage** — hero, featured-khutba spotlight, "This Week" preview strip, section tiles (Khutba Archive / Library / Study Guide) |
| `/khutba` | Full Khutba Archive — search, year/month/topic filters (this used to live at `/`) |
| `/khutba/[id]` | Single khutba — transcript, summary, smart back-link |
| `/lecture/[id]` | Single non-khutba lecture — same shape, smart back-link |
| `/this-week` | Last 7 days, all lecture types (unchanged this session) |
| `/study` | Study Guide landing — book cards (only Riyadul Saliheen has data so far) |
| `/study/[slug]` | One hadith book's lectures, chronological, chapter/year/month filters |
| `/library` | Library landing — Fajr / Isha / Ramadan tile cards |
| `/library/[tile]` | One tile's lectures, newest-first, year/month filters, compact table |

Nav order (mobile + desktop): **This Week → Khutba Archive → Library → Study
Guide** (Library was deliberately placed before Study Guide since the latter
isn't fully built out — only one of four qualifying hadith books has a
canonical chapter list sourced).

## What got built this session, in order

### 1. Study Guide (`/study`, `/study/[slug]`)
- Scope: `content_type === 'Hadith'` **and** `hadith_book === 'Riyadul Saliheen'`
  **and** `year >= 2025` (floors out 1 stray 2013-dated video) → **89 videos**.
- `STUDY_BOOKS` registry in `lib/data.js` — add a book here once its
  canonical chapter list exists under `lib/canonical/`.
- **`normalizeChapter(rawChapter, bookSlug)`** — the hard part. `hadith_chapter`
  is free-form AI text with huge phrasing variance for the same real chapter.
  Matches raw text against the canonical list via Jaccard token overlap,
  with an embedded "Chapter N" number as a *secondary* signal (the AI
  sometimes states a confident wrong number — e.g. labels Friday-prayer
  videos "Chapter 136", which is actually "Greeting the Children"; the real
  Friday Prayer chapter is 210). Tuned and verified against all 90 real
  videos: **37/90 (41%) get a confident match**; the rest fall back to
  showing the raw AI text unchanged rather than guessing. Thresholds (don't
  change without re-running the test harness against real data):
  `CHAPTER_KEYWORD_THRESHOLD=0.34`, `CHAPTER_NUM_DISTRUST=0.10`,
  `CHAPTER_OVERRIDE_LEAD=0.20`, `CHAPTER_OVERRIDE_MIN=0.30`. Domain stopwords
  strip near-universal canonical-title words ("prohibition", "excellence",
  "allah", etc.) that otherwise create false matches.
- Sort: chronological **oldest → newest** (this is the one place on the site
  that isn't newest-first — it's meant to be followed like a course).
- Chapter is a **filter/label only**, never a grouping structure (locked
  decision — tried sectioning by Fajr/Isha at one point, user reverted it).
- Filters: chapter dropdown + year + month (all independent, not cascading).
- Compact one-line-per-row table (not cards) so far more rows fit per
  screen, mobile included — `components/HadithVideoCard.jsx` +
  `StudyBookGrid.jsx`.
- **Deliberately not built**: the other 3 qualifying hadith books
  (Al-Wajeez 50, Sahih Bukhari 48, Sahih Muslim 42 videos) — blocked on
  sourcing their canonical chapter lists. Web search is now available in
  this environment, unlike when that limitation was first noted, so this is
  unblockable whenever wanted. Also not built: chapter-coverage progress
  bar, "continue where you left off" (localStorage), and cross-links from
  individual lecture pages back into the study guide — these were explicitly
  scoped out as a separate future step, not forgotten.

### 2. Library (`/library`, `/library/[tile]`)
- A general "browse everything" archive, separate from both the Khutba
  Archive (Khutbas excluded everywhere here — they have their own page) and
  the Study Guide (this spans **every** `content_type`, not just Hadith).
- Three tiles: **Fajr (292)**, **Isha (281)**, **Ramadan (110, floored at
  year >= 2024 — drops 5 stray 2014 videos)**.
- Ramadan is **date-based**, not topic-tag-based — computed via
  `Intl.DateTimeFormat` with `calendar: 'islamic-umalqura'`, checking for
  Hijri month 9. (A topic-tag approach existed too — 105 videos tagged
  "ramadan"-something — but only ~84 overlap with the date-based set; the
  date-based one was the explicit choice, since it means "actually delivered
  during Ramadan" not "happens to discuss Ramadan.")
- Sort: **newest-first** (unlike Study Guide — this is a general archive,
  not a course to follow in order).
- Compact table rows (`LibraryVideoRow.jsx` + `LibraryGrid.jsx`), year+month
  filters. No chapter filter (doesn't apply here). The content-type pill
  column was tried and then removed per feedback; a weekday + calculated
  Hijri date column was added instead, **desktop-only** (mobile keeps just
  the short Gregorian date to stay one line).

### 3. Smart back-navigation (`components/BackLink.jsx`)
- Lecture/khutba pages are now linked to from many places (This Week, Study
  Guide, Library, Khutba Archive), so a single hardcoded destination was
  wrong most of the time (it was always `/this-week`, even from Library).
- Fix: `router.back()` when the visitor actually came from elsewhere on the
  site (checked via `document.referrer` same-origin + `window.history.length
  > 1`), with a named fallback link for direct visits/bookmarks where
  there's no in-app history. Used on both the lecture page (falls back to
  "This Week") and khutba page (falls back to "All sermons" / "Back to
  archive", matching its original distinct top/bottom labels).

### 4. Homepage rebuild (`/` + moved Khutba Archive to `/khutba`)
- Old `/` *was* the full Khutba Archive grid. As the site grew past "just
  khutbas," that stopped making sense as a front door.
- Moved the old homepage content verbatim to `app/khutba/page.jsx`.
- New `/` (`app/page.jsx`): hero → `FeaturedKhutba` spotlight (most recent
  khutba, distinct amber-left-border card) → "This Week" strip (3 latest
  non-khutba lectures via new `getLatestVideos(n)`, khutbas filtered out so
  the spotlight is never duplicated below it) → `SectionTile` grid (Khutba
  Archive / Library / Study Guide, the last one visually muted — dashed
  border, quieter text — since it's the one section that's not fully built).
- Fixed every stray link that assumed `/` was the archive: nav's "Khutba
  Archive" link, both `BackLink` fallbacks on the khutba page, and the 404
  page's "Back to archive" button — all now point to `/khutba`.

### 5. Mobile nav hamburger (`components/MobileNav.jsx`)
- The header was overflowing on mobile: logo block (~180px) + 4 nav links
  (~330px) needed ~510px against a ~325px usable mobile viewport width —
  this was a real overflow, not just cosmetic tightness.
- `MobileNav.jsx` (client component) replaces the inline `<nav>` below `sm`
  with a single hamburger button (`☰`/`✕`) opening a dropdown with all 4
  page links **plus** the 2 external links (mcctucson.org, YouTube) that
  were previously just `hidden sm:flex` and completely unreachable on
  mobile. Closes on link click or tap-outside. The desktop `<nav>` is now
  `hidden sm:flex`; `MobileNav` is `sm:hidden`.

### 6. Background texture (`public/pattern-star.svg`)
- Plain cream background → subtle Islamic 8-pointed-star geometric
  tessellation (the classic mosque-tilework/Quran-illumination motif).
- Kept deliberately faint (`opacity: 0.15`, 0.75px strokes, 60×60 tile)
  because khutba/lecture detail pages render their summary + full
  transcript **directly on the page background**, not inside a white card —
  the highest-risk spot for legibility, unlike the grid pages where
  everything sits on opaque white cards.
- **Gotcha for later edits**: `body` in `globals.css` now sets
  `background-image`/`background-repeat` as separate longhand properties,
  *not* the `background:` shorthand. The `<body>` tag in `layout.jsx` has
  Tailwind's `bg-cream` class for the solid color — a class selector beats
  a plain `body { }` element selector in specificity, so if you ever put the
  color back into the `background:` shorthand here, the pattern can get
  fought over while the color silently keeps working (since `bg-cream`
  wins on `background-color` either way). Keep them as separate properties.

## Known open items (not addressed this session, still real)

- **2 known pipeline data bugs**, need a manual call + an `overrides.csv` fix
  in the *other* repo: (1) one `hadith_book` value is literally
  `"Sahih Bukhari, Sahih Muslim"` (comma-joined, 2 videos), (2) one video has
  `hadith_chapter` = bare `"210"` with no book context recorded in earlier
  notes — needs the book identified before it can be fixed.
- **3 more hadith books** need canonical chapter lists sourced (Al-Wajeez,
  Sahih Bukhari, Sahih Muslim) before Study Guide can expand to them.
- **Study Guide "extras"** (progress bar, continue-reading, cross-links from
  lecture pages) — explicitly deferred, not forgotten.
- Total dataset for reference: **732 videos**, `content_type` breakdown:
  Hadith 271, Quran 156, Mixed 153, General 87, untagged 54, Announcement 11.

## Working notes for whoever (whatever) picks this up

- This is a **real local repo**, edited directly via filesystem
  read/write/edit tools — not artifacts. Every change in this session was
  verified with a syntax check (esbuild parse) and, where logic was
  non-trivial (chapter matching, Ramadan date detection, year floors), a
  real test run against the actual `index.json` data before being treated
  as done.
- The user prefers being asked before large/ambiguous builds, and likes
  seeing a quick visual mockup (via the Visualizer tool, styled to match the
  site's actual palette/fonts — not Claude's generic design system) before
  committing to a structural change. That pattern was used for: the
  homepage redesign, the mobile hamburger menu, and the background pattern
  options. Worth continuing.
- Mobile-friendliness has come up repeatedly as a priority — check it
  explicitly, don't just assume a desktop layout degrades gracefully.
