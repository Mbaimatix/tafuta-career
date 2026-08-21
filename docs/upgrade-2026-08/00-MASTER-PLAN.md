# TAFUTA CAREER — Upgrade Plan (August 2026)

**Prepared for:** Mbai · Tafuta Career
**Date:** 21 Aug 2026
**Trigger:** Competitive teardown of `cbc-careers.vercel.app` ("CareerPathway") vs. `tafutacareer.com`

This is the execution-focused companion to `DOCUMENTATION.md` (the narrative/rationale doc) and the seven spec files in this folder. Read this file first for sequencing and decisions; open the numbered spec files only when you're actually implementing that item.

---

## How this plan was built

1. Live-crawled the reference site (`cbc-careers.vercel.app`) myself — found every app route (`/dashboard`, `/dashboard/tracks`, `/onboarding`, etc.) 404s on direct load. This turned out to be a known bug in that site, not a dead end: its own teardown (below) explains it as client-side-only routing with no server fallback.
2. You supplied an existing "Competitive Teardown" document (a Claude artifact, `Pathway Selector Teardown`) built from an authenticated click-through of the live reference site — this is the real source of truth for what CareerPathway actually does, and is the basis for every recommendation below.
3. I cloned your actual GitHub repo (`Mbaimatix/tafuta-career`) and read the real source — architecture, every route, every lib file, `README.md`, `RESTORING-PAYWALL.md` — before writing any spec.
4. You made four scoping decisions with me (recorded below).
5. Seven specialist review passes each read the real repo files for their area and produced surgical, code-grounded specs — not generic advice. I then reconciled one conflict between two of them (see Spec 05's note).

## Decisions on record

| Decision | Choice | Rationale |
|---|---|---|
| **Accounts** | No real accounts this round. Build history/state locally (`localStorage`), architected so a real account system can swap in later without a UI rewrite. | Zero new infrastructure, zero cost, matches the site's existing deliberate "no login" philosophy. Full reasoning in `DOCUMENTATION.md`. |
| **Monetization** | Not touched this round. Flagged for later. | No paying users yet; premature to build gating. Dormant M-Pesa code stays dormant. |
| **AI / "explainability"** | No external AI API. Extend the existing deterministic `lib/matching.ts` instead. | Avoids an ongoing cost/maintenance commitment — the reference site's own AI panel is broken in production right now, which is a live cautionary example. |
| **Local folder** | Deliverables written into `tafuta-career/` (the actual repo root, confirmed via folder listing) and `docs/upgrade-2026-08/` inside it. | So they sit next to the code they describe and are visible to your VS Code Claude agent. |

## Scope for this round (Phase 1)

You selected these five items. All are independent of each other — implement and ship in any order, or in parallel branches.

| # | Item | Spec | Effort | Files touched |
|---|---|---|---|---|
| 1 | Progress indicator + breadcrumb on `/matcher` | `01-spec-matcher-progress-indicator.md` | ~1 day | `components/CareerMatcher.tsx` |
| 2 | Shareable "blueprint" results card + PDF export | `02-spec-blueprint-export.md` | ~1–2 days | new `lib/referenceCode.ts`, new `components/MatcherBlueprint.tsx`, `components/CareerMatcher.tsx`, `app/globals.css` |
| 3 | Fix `sitemap.ts` (373 vs 1,252 careers) | `03-spec-sitemap-fix.md` | ~1 hour | `app/sitemap.ts` |
| 4 | Audience-aware homepage copy (student/parent toggle, no login) | `04-spec-homepage-audience-toggle.md` | ~1 day | new `components/Hero.tsx`, `app/page.tsx` |
| 5 | Local-only matcher run history | `05-spec-matcher-history.md` | ~2 days | new `lib/matcherHistory.ts`, new `components/MatcherHistory.tsx`, new `app/history/page.tsx`, `components/CareerMatcher.tsx`, `components/Navbar.tsx` |

**Total estimated effort: ~5–6 working days** for one engineer working sequentially; less if parallelized across independent files.

### ⚠️ Required build order for items 2 and 5

Specs 02 and 05 were drafted by separate reviewers in parallel and each independently invented a "reference code" generator. **Spec 02's version is the one to keep** (deterministic — same pathway+subjects always produce the same code). Build order:

1. Implement Spec 02 first (creates `lib/referenceCode.ts`).
2. When implementing Spec 05, import `generateReferenceCode` from `lib/referenceCode.ts` instead of the random generator shown in that spec's original sketch — the spec file itself has been corrected with a reconciliation note at the top; follow it.

This also means a saved history entry's reference code will always match the blueprint card shown at the time of that run — a free consistency win.

### Investigation finding worth knowing about

Spec 03's investigation found **no bug in the current source** for the sitemap undercount — `app/sitemap.ts` already dynamically derives all 1,252 career URLs with no cap or hardcoded list anywhere. The likely real cause is a stale production build (the sitemap route had no revalidation, so it was frozen at whatever `lib/career-data.ts` looked like at the last build). The spec still gives you a hardening fix (adds `revalidate = 3600` + a defensive dedup guard) and the exact `curl` commands to verify your *live* `sitemap.xml` is actually serving 1,252 URLs after deploying it.

## Deferred to later phases (not this round)

You chose to sequence these rather than drop them — they're designed, not scheduled.

| Phase | Item | Doc | Why deferred |
|---|---|---|---|
| 2 | Explainable matching engine (deterministic, no AI) | `06-design-phase2-explainable-matching.md` | Wait for Phase 1 usage/feedback to confirm students actually want this before building it |
| 3 | Schools/counsellor tier | `07-design-phase3-schools-tier.md` | Requires real accounts + a real database — genuine product pivot, not justified without a school actually asking |

## How to use this with your VS Code Claude agent

1. Open the `tafuta-career` repo in VS Code with Claude Code.
2. `CLAUDE.md` at the repo root is auto-loaded by Claude Code and contains the execution rules (branch discipline, one-spec-at-a-time, testing requirements, explicit boundaries). Read it before starting.
3. Work through the Phase 1 table above in whatever order you like, respecting the Spec 02 → Spec 05 build order above.
4. For each item: open its spec file, read it fully, verify the "Current behavior" section against the actual current file (code may have moved since this was written), implement the "Exact changes," run the "Testing checklist," then move on.
5. Do not open or act on the Phase 2/3 files (`06-`, `07-`) as implementation work — they are explicitly designs for later.

## Verification already performed

- Every spec's "Current behavior" section was written by an agent that actually read the real file (line numbers cited) — not generic assumptions.
- The sitemap "bug" claim was independently verified against the real data file and found not to reproduce in source — corrected before being handed to you as a spec, not left as an unverified claim.
- The reference-code duplication between Specs 02 and 05 was caught during synthesis and reconciled with an explicit build-order note, rather than shipped as two conflicting implementations.
