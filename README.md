# MCC Tucson — Jumaa Khutba Archive

Public-facing Next.js site for MCC Tucson lecture content — Friday khutbas,
recent weekly lectures, full transcripts, and AI summaries.

## Local development

```bash
cd mcc-khutba
npm install
npm run dev   # → http://localhost:3000
```

## Data source

All data is fetched at request/build time from the **yt-transcript-pipeline**
repo's GitHub raw URLs (no local filesystem dependency):

```
https://raw.githubusercontent.com/mobins-source/yt-transcript-pipeline/main/data/metadata/index.json
https://raw.githubusercontent.com/mobins-source/yt-transcript-pipeline/main/data/transcripts/{channel}/{id}.json
https://raw.githubusercontent.com/mobins-source/yt-transcript-pipeline/main/data/transcripts/{channel}/{id}.clean_en.txt
```

Fetches use Next.js ISR (`revalidate: 3600`) — the site automatically picks up
new pipeline data within an hour, with **no rebuild or redeploy required**.

**Important:** any change in the pipeline (new videos, `catchy_title` backfill,
SRT approvals, metadata overrides) is only visible here after that change is
committed and pushed to the `yt-transcript-pipeline` repo on GitHub.

## Structure

```
app/
  layout.jsx              header (nav: This Week / Khutba Archive), footer
  page.jsx                home — Khutba archive grid
  this-week/page.jsx      last 7 days, all lecture types, grouped by day
  khutba/[id]/page.jsx    individual Friday khutba
  lecture/[id]/page.jsx   individual Fajr/Zuhr/Isha lecture
  not-found.jsx           404 page
components/
  KhutbaGrid.jsx          client: search + year/topic filters + grid (khutbas only)
  KhutbaCard.jsx          khutba card — headline prefers catchy_title
  LectureCard.jsx         generic card for any lecture (This Week page)
  Transcript.jsx          clean / timestamped transcript toggle
lib/
  data.js                 server-side data fetchers (GitHub raw + ISR)
```

## Title display

Every page follows the same fallback: `catchy_title → suggested_title → title`.
`catchy_title` is the punchy public headline; `suggested_title` is shown as a
secondary line when it differs from the catchy title.

## Deploy to Vercel (Strategy A)

1. Push this repo to GitHub (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/mcc-khutba.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub
3. "Add New..." → "Project" → select the `mcc-khutba` repo
4. Leave all settings as default (Vercel auto-detects Next.js) → **Deploy**
5. Done — every future `git push` to `main` redeploys automatically, and
   pipeline data updates appear within the hour via ISR with no redeploy needed
6. Optional: add a custom domain under Project → Settings → Domains
