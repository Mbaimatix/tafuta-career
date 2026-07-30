# TAFUTA CAREER

CBC career guidance platform for Kenyan students — helps learners discover the right career path based on their KCSE subject choices, interests, and personality.

Live at **[tafutacareer.com](https://tafutacareer.com)**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 (configured via `app/globals.css @theme`) |
| Animations | Framer Motion 12 |
| Search | Fuse.js 7 (fuzzy search) |
| Payments | None — every feature is free. Dormant M-Pesa routes remain (see [RESTORING-PAYWALL.md](./RESTORING-PAYWALL.md)) |
| Persistence | `localStorage` only (saved careers). Vercel KV is used by the dormant payment routes |
| ORM | Prisma 7 + SQLite (schema reference only — static data at runtime) |
| Deployment | Vercel |

> **No paywall.** The site has no PRO tier, no subscription, and no login. The
> university guide, career roadmap, career report PDF/print, full Career Matcher
> results, and saved-career comparison are all available to everyone.

---

## Project Structure

```
app/
  api/
    mpesa/          DORMANT — no UI calls these. Kept for future monetisation.
      callback/   POST — receives Safaricom STK Push callbacks
      query/      POST — polls payment status (KV → Daraja fallback)
      stkpush/    POST — initiates M-Pesa payment
      token/      GET  — fetches Daraja OAuth token
    pro/
      activate/   POST — DORMANT — records an activation in KV
    random/       GET  — random career
    search/       GET  — career search (rate limited)
  career/[id]/    1,252 statically pre-rendered career pages
    CareerExtras.tsx — university guide + roadmap + save button (client)
    ShareButton.tsx  — share / print / find-similar actions (client)
  matcher/        3-step subject selection wizard
  saved/          Side-by-side comparison of bookmarked careers
  search/         Fuzzy career search
components/
  CareerMatcher.tsx     — wizard UI (client)
  SavedCareers.tsx      — saved list + comparison table (client)
  SearchAutocomplete.tsx — fuzzy search (client)
lib/
  career-data.ts    — all 1,252 careers as static TypeScript (714 KB)
  matching.ts       — career matching algorithm
  savedCareers.ts   — localStorage bookmark store (useSyncExternalStore)
  hydration.ts      — useIsHydrated() for browser-only UI
  rateLimit.ts      — in-memory rate limiter (safe try/catch wrapper)
  search.ts         — Fuse.js helpers
  universityData.ts — sub-track → Kenyan university programmes + roadmap
```

---

## Local Development Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

- `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` — from [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- `MPESA_CALLBACK_URL` — your ngrok URL (see step 4)
- `KV_*` — from your Vercel KV store (optional; in-memory fallback is used without it)

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Set up ngrok for M-Pesa callbacks (required for local STK Push testing)

Safaricom needs a publicly reachable HTTPS URL to send payment callbacks. ngrok creates a secure tunnel from the internet to your local server.

```bash
# Authenticate once (replace with your token from dashboard.ngrok.com)
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN

# Start the tunnel
ngrok http 3000
```

Copy the `https://...ngrok-free.app` URL shown and set it in `.env.local`:

```
MPESA_CALLBACK_URL=https://YOUR_NGROK_URL/api/mpesa/callback
```

Restart the dev server after changing `.env.local`.

---

## Vercel Deployment

### 1. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/tafuta-career.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo
2. Framework preset: **Next.js** (auto-detected)
3. No build command changes needed

### 3. Add Environment Variables in Vercel Dashboard

Go to **Project → Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `MPESA_CONSUMER_KEY` | From Daraja portal |
| `MPESA_CONSUMER_SECRET` | From Daraja portal |
| `MPESA_SHORTCODE` | `174379` (sandbox) or your paybill |
| `MPESA_PASSKEY` | From Daraja portal |
| `MPESA_CALLBACK_URL` | `https://tafutacareer.com/api/mpesa/callback` |
| `MPESA_ENV` | `sandbox` or `production` |
| `KV_URL` | From Vercel KV store |
| `KV_REST_API_URL` | From Vercel KV store |
| `KV_REST_API_TOKEN` | From Vercel KV store |
| `KV_REST_API_READ_ONLY_TOKEN` | From Vercel KV store |

### 4. Create Vercel KV Store

1. Vercel Dashboard → **Storage** → **Create** → **KV**
2. Link it to your project — the four `KV_*` variables are auto-populated

---

## Switching M-Pesa from Sandbox to Production

1. On Daraja portal, go live and get your **production** consumer key/secret and paybill shortcode/passkey
2. Update Vercel env vars:
   - `MPESA_ENV=production`
   - `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` → production values
   - `MPESA_CALLBACK_URL=https://tafutacareer.com/api/mpesa/callback`
3. Redeploy (or Vercel auto-deploys on env var change)

---

## Career Data

- **1,252 careers** parsed from the CBC Comprehensive Career Guidance Booklet
- **3 pathways**: A (STEM), B (Arts & Sports), C (Social Sciences)
- **9 sub-tracks**: A1–A3, B1–B3, C1–C3
- **34 unique subjects**
- Source: `lib/career-data.ts` (static TypeScript, ~714 KB)
- All 1,252 career pages are statically pre-rendered at build time

---

## Features (all free)

| Feature | Where |
|---------|-------|
| Browse 1,252 careers across 3 pathways / 9 sub-tracks | `/pathway/[code]`, `/career/[id]` |
| Career Matcher — full result set, 24 per page via "Show more" | `/matcher` |
| Fuzzy career search | `/search` |
| University guide per career (UoN, JKUAT, Strathmore & more) | `/career/[id]` |
| Visual Career Roadmap — CBC to employment | `/career/[id]` |
| Career report print / PDF | `/career/[id]`, `/matcher`, `/saved` |
| Save careers and compare up to 4 side-by-side | `/saved` |
| AI-powered Career Counselor chatbot | Floating widget, all pages |

There is no sign-up, no subscription, and no server-side account. Saved careers
live in the visitor's `localStorage` under `tafuta_saved_careers`.

The M-Pesa routes under `app/api/mpesa/` and `app/api/pro/activate/` are still
present but **dormant** — nothing in the UI calls them. See
[RESTORING-PAYWALL.md](./RESTORING-PAYWALL.md) if you ever want to monetise again.
