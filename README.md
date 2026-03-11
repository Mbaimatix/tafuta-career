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
| Payments | Safaricom Daraja API (M-Pesa STK Push) |
| Persistence | Vercel KV (Redis) for payment results |
| ORM | Prisma 7 + SQLite (schema reference only — static data at runtime) |
| Deployment | Vercel |

---

## Project Structure

```
app/
  api/
    mpesa/
      callback/   POST — receives Safaricom STK Push callbacks
      query/      POST — polls payment status (KV → Daraja fallback)
      stkpush/    POST — initiates M-Pesa payment
      token/      GET  — fetches Daraja OAuth token
    pro/
      activate/   POST — records server-side PRO activation in KV
  career/[id]/    1,252 statically pre-rendered career pages
  matcher/        3-step subject selection wizard
  search/         Fuzzy career search
components/
  CareerMatcher.tsx     — wizard UI (client)
  SearchAutocomplete.tsx — fuzzy search (client)
context/
  ProContext.tsx    — PRO subscription state (localStorage + KV)
lib/
  career-data.ts    — all 1,252 careers as static TypeScript (714 KB)
  matching.ts       — career matching algorithm
  rateLimit.ts      — in-memory rate limiter (safe try/catch wrapper)
  search.ts         — Fuse.js helpers
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

## PRO Subscription Tiers

| Plan | Price | Duration |
|------|-------|----------|
| Monthly | KES 199 | 30 days |
| Annual | KES 999 | 365 days |

Payment is via M-Pesa STK Push. On success the Daraja callback fires `POST /api/mpesa/callback`, which stores the result in Vercel KV. The frontend polls `POST /api/mpesa/query` until confirmed, then calls `POST /api/pro/activate` to persist PRO status server-side and activates it in localStorage via `ProContext`.
