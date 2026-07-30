# Restoring the TAFUTA PRO paywall

The PRO paywall was removed on **2026-07-30**. Every feature that used to sit
behind it is now free for everyone. This file records exactly what was taken out
and what was left behind, so the paywall can be rebuilt without re-deriving it.

If the removal is landed as a single commit, `git revert` of that commit is the
fastest path back. This document covers the case where you want to rebuild it
differently — e.g. with real server-side entitlements instead of a `localStorage`
flag.

---

## 1. What the paywall actually was

A **client-side `localStorage` flag**, with no server-side enforcement:

- `context/ProContext.tsx` held `isPro` in React context, persisted to
  `localStorage` under the key `tafuta_pro_status` as
  `{ isPro, expiry, phone, plan }` with a 30-day (monthly) or 365-day (annual)
  expiry.
- Every gate was conditional rendering on that flag — `{isPro && <Content/>}` next
  to `{!isPro && <LockedOverlay/>}`.
- **All gated data was already shipped to the browser.** The university list and
  roadmap were computed client-side from `lib/universityData.ts`, and the full
  matcher result set was in client memory — the "locked" content was only visually
  blurred. Anyone could read it from devtools.

> If you rebuild this, gate on the **server** (move `getUniversitiesForCareer` /
> `getCareerRoadmap` behind a route handler that checks a real session) or the
> paywall will be cosmetic again.

## 2. Files deleted

| File | What it did |
|------|-------------|
| `context/ProContext.tsx` | `ProContextProvider`, `useProStatus()`, `activatePro()`, `checkProStatus()` |
| `components/ProUpgradeModal.tsx` | The paywall modal — `PRO_BENEFITS` list, monthly/annual toggle (KSH 199 / KSH 999, "-58%"), "Upgrade with M-Pesa" CTA. This was the only pricing UI; there was never a `/pricing` route. |
| `components/MpesaPayment.tsx` | STK Push form — phone input, `POST /api/mpesa/stkpush`, then polled `POST /api/mpesa/query` 12× at 5s intervals, calling `activatePro()` on `ResultCode === 0` |
| `app/career/[id]/ProCareerSections.tsx` | Replaced by `CareerExtras.tsx` — same university/roadmap content, minus `LockedOverlay` and the blurred placeholders |

## 3. Gates removed

| Feature | File | Old behaviour |
|---------|------|---------------|
| Career Matcher results | `components/CareerMatcher.tsx` | `results.slice(0, isPro ? 50 : FREE_LIMIT)` with `FREE_LIMIT = 5`; blurred ghost cards + "🔒 N more matches" banner. **Now:** all results, 24 at a time via "Show more" (`RESULTS_PAGE_SIZE`), plus "Show all". `handlePrint()` expands everything first so printouts aren't truncated. |
| Print / PDF on career pages | `app/career/[id]/ShareButton.tsx` | `if (isPro) window.print(); else setProModalOpen(true)` + amber `PRO` badge. **Now:** always prints. (The matcher's own Print button was never gated.) |
| University guide | `app/career/[id]/CareerExtras.tsx` | Blurred skeleton + `LockedOverlay`; real `<UniversityList/>` only when `isPro`. **Now:** always rendered. |
| Career Roadmap | `app/career/[id]/CareerExtras.tsx` | Same pattern with `<RoadmapTimeline/>`. **Now:** always rendered. |
| Save Career | `app/career/[id]/CareerExtras.tsx` | `if (!isPro) { openModal('Save & Compare Careers'); return; }`. **Now:** always saves. |
| Nav upsells | `components/Navbar.tsx` | Amber "Try PRO" desktop button, `PRO` star badge for subscribers, "Upgrade to TAFUTA PRO" mobile row. **Now:** replaced by a bookmark icon linking to `/saved`. |
| AI chatbot | `components/ChatBot.tsx` | Advertised in `PRO_BENEFITS` but **never actually gated** — it was always free. No change needed. |

## 4. What was built to finish the job

"Save & compare up to 4 careers side-by-side" was advertised in the PRO modal but
the compare UI **never existed** — only the bookmark button did. It now exists:

- `app/saved/page.tsx` — `/saved` route, `robots: { index: false }` since the
  content is per-browser.
- `components/SavedCareers.tsx` — saved list, per-item remove, "Clear all",
  print, and a horizontally-scrollable comparison table (pathway, sub-track,
  salary, growth, university needed, CBC subjects, where to study, description).
  Selection is capped at `MAX_COMPARE = 4`.
- `lib/savedCareers.ts` — the bookmark store for key `tafuta_saved_careers`,
  exposed via `useSyncExternalStore` so the career page and `/saved` stay in sync
  (including across tabs). Replaced the ad-hoc inline `localStorage` reads.
- `lib/hydration.ts` — `useIsHydrated()` for browser-only UI without a
  hydration mismatch or a `setState`-in-effect lint error.

## 5. What was deliberately LEFT IN PLACE (dormant)

Nothing in the UI calls any of these. They are unreferenced but functional:

- `app/api/mpesa/stkpush/route.ts` — Daraja STK Push (`amount = plan === 'annual' ? 999 : 199`)
- `app/api/mpesa/query/route.ts` — payment status poll (KV → Daraja fallback)
- `app/api/mpesa/callback/route.ts` — Safaricom webhook → Vercel KV `mpesa:<id>`
- `app/api/mpesa/token/route.ts` — cached Daraja OAuth token
- `app/api/pro/activate/route.ts` — writes `pro:<sha256(phone)>` to Vercel KV
- `@vercel/kv` in `package.json`
- `MPESA_*` env vars in `.env.local` / `.env.example`, and the
  `https://sandbox.safaricom.co.ke` entry in the `connect-src` CSP in `next.config.ts`

> ⚠️ **Rotate the sandbox Daraja credentials.** `.env.local` still holds live
> sandbox `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` values. The file is
> gitignored, but since nothing uses them now, the safe move is to revoke them on
> the Daraja portal and delete the lines. Also remove the `MPESA_*` and `KV_*`
> vars from the Vercel project settings.

## 6. Stale `localStorage` on returning visitors

Anyone who previously subscribed still has a `tafuta_pro_status` key in their
browser. It is now simply ignored — nothing reads it — so no cleanup is required.
If you want to tidy it up, delete the key once on mount; if you rebuild the
paywall, note that these old keys will still be present and may need honouring or
clearing.
