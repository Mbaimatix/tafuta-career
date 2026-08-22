---
phase: 3 — later, sequenced (explicitly NOT this round)
status: concept doc only — no schema, code, or UI should be built from this yet
touches (if ever built): new auth system, new database, new app/(school)/* routes
depends_on: Phase 1 local history shipping and getting real usage first; ideally a real school asking for it
---

# Concept doc 07 — Schools / counsellor tier

**Status: concept only — explicitly NOT scoped for this round. No code, schema, or UI referenced here should be built now.**

## A note before the doc itself

Tafuta Career today has zero accounts, zero paying users, and zero revenue. This document exists because the site owner is curious about a competitor's "School/Institution" login gesture, not because a school has asked for this. That's reasonable to think through on paper, but worth saying plainly: **building a schools tier before Phase 1 (local matcher history) ships and gets used is premature scope.** Right sequencing: (1) ship local-only history, (2) watch if individual usage justifies accounts at all, (3) only then consider whether a second, much bigger persona (institutions) is worth the server/database/auth investment below. Treat everything here as "what we'd need to know before saying yes," not a queued backlog item.

## Overview & who this is for

Not student- or parent-facing. A hypothetical tier for a **school counsellor or careers-master** — an adult, semi-technical, acting on behalf of ~20–200 minors at once, not a self-directed learner. That distinction matters for almost every decision below: consent, data ownership, and liability shift the moment one adult account can see many students' results.

## What "bulk cohort tools" would concretely mean

1. **Cohort roster + matcher status** — counsellor creates a cohort, generates a join code, students associate their result with it, counsellor sees who has/hasn't completed the matcher.
2. **Aggregate pathway distribution view** — one dashboard chart: how many students matched into Pathway A/B/C and which sub-tracks are most common.
3. **Exportable class report** — CSV/PDF export (student name/ID, top matched pathway/sub-track, top career matches) — the single most concretely useful artifact for a real counsellor's workflow.
4. *(Stretch)* **Per-student drill-down** — same detail a student already sees, for 1:1 prep.

Deliberately absent: messaging/chat, grading, admin-approval workflows — that's scope creep into a full school-management product.

## Why this requires real server-side accounts + a real database

Phase 1's history is explicitly local-only (`localStorage`, same pattern as `savedCareers.ts`). That's a hard ceiling for cohort tools:

- **No cross-device visibility** — `localStorage` is scoped to one browser on one device; a counsellor's dashboard needs data generated on 30+ different students' devices. Some server has to sit in between.
- **No concept of "a cohort" without a shared record** — aggregating across students requires a query over many rows at once; `localStorage` only ever answers "what does *this* browser know."
- **No durable identity** — a roster needs to persist independent of any one browser, survive a cleared cache, and attach to a verified account. `localStorage` has no login.
- **No access control** — a counsellor should see only their own cohort, which requires a server checking "is this request from counsellor X, and is student Y in one of X's cohorts" before returning data. Unenforceable from a browser alone.

Local history is fine for "remember what I did last time" (single-user, single-device). Cohort aggregation is inherently multi-party, multi-device — it needs a shared backend of record by definition.

## Recommended architecture direction (high level — no need to pick now)

**Auth.** No existing auth in the app. Reasonable options for a Next.js/Vercel stack: **Auth.js (NextAuth)** — free, self-hosted, flexible providers (Google login fits Kenyan schools already on Google Workspace for Education); more integration work. Or **Clerk**/**Supabase Auth** — hosted, faster to stand up, Clerk especially has "organization" primitives that map naturally onto "a school" and its members, worth a look specifically because the cohort model is org-shaped. Two account types minimum: a lightweight **student** identity (this is a minor — collect the least PII possible, let the school/counsellor mediate enrollment) and a verified **counsellor** identity (not self-serve signup, given the visibility into minors' data it grants — some manual/school-domain-verified onboarding is a real product/ops cost, not just engineering).

**Database.** The repo's current Prisma+SQLite is explicitly schema-reference-only (per README: "static data at runtime") — not live, and SQLite as a single file is a poor fit for Vercel's serverless functions anyway (no persistent disk across invocations, no safe concurrent writes across regions). A real cohort feature needs an actual managed, network-attached database: **Vercel Postgres (Neon)** — first-party, zero-config with the existing project, generous free tier — or **Supabase** — Postgres plus built-in auth/row-level security, potentially covering both auth and database in one service.

**Session/data handling.** The load-bearing rule: **cohort aggregation and per-student results must be computed and authorized server-side**, never a client-side fetch of "all students" filtered in the browser.

## How this relates to monetization

If this tier existed, "the school/counsellor pays" is the obvious hook — plausibly the first paid tier this site would ever have. The repo already has dormant M-Pesa payment infrastructure from the PRO paywall removed 2026-07-30. That is not much of a head start, and `RESTORING-PAYWALL.md` says why in its own words:

> "All gated data was already shipped to the browser... the 'locked' content was only visually blurred. Anyone could read it from devtools."
> "If you rebuild this, gate on the server... or the paywall will be cosmetic again."

The old paywall was a `localStorage` flag checked client-side with zero server enforcement. That must not be repeated here — and the stakes are concretely higher than the old consumer paywall, because this would be gating access to *other people's* (minors') data, not a PDF download. A client-side flag deciding "am I allowed to see this cohort's results" would be a real data-exposure bug, not just lost revenue.

If ever built as paid: the M-Pesa STK Push/callback/token routes are plausibly reusable as payment-collection plumbing (that was never the flawed part). What must be built new is server-side entitlement checking — a paid/active flag in the real database next to the school/counsellor account, checked on every server-side query returning cohort or student data, never trusted from a client-supplied flag.

## Explicit non-goals for now

- No accounts of any kind ship this round.
- No production database ships this round — Phase 1's history stays local-only.
- No schools/counsellor UI, roster, or dashboard is built this round.
- No auth provider or database vendor is selected or integrated this round.
- No changes to the dormant M-Pesa/KV code this round.
- This document is the only deliverable: a framing for a future decision.

## Suggested trigger for revisiting

Don't schedule this. Revisit when a concrete signal shows up:

- A real school or counsellor actually asks for it — inbound interest, not a competitor's marketing page.
- Phase 1's local history ships and shows meaningful organic usage/retention, suggesting individual accounts (a smaller step than a full schools tier) might be worth doing next on their own merits.
- The site has a first real cohort of engaged individual users at all — a schools tier for a site with no accounts and no paying users is solving a problem two steps ahead of where the product currently is.
