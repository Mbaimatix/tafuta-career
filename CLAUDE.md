# CLAUDE.md — Tafuta Career upgrade guardrails

You are working in the `tafuta-career` repo (Next.js 16 App Router + TypeScript + Tailwind 4). This file is auto-loaded by Claude Code — read it before touching any file.

There is an active upgrade plan in `docs/upgrade-2026-08/`. **Read `docs/upgrade-2026-08/00-MASTER-PLAN.md` in full before starting any work from this plan.** It links to `DOCUMENTATION.md` (why each decision was made) and seven numbered spec files (exactly what to change, file by file).

## Non-negotiable rules while executing this plan

1. **One spec file, one focused change.** Do not batch multiple specs into a single sweeping edit. Each of the five Phase 1 specs (`01`–`05`) is scoped to touch a specific, small set of files — stay inside that boundary. If you find yourself editing a file the spec didn't name, stop and re-read the spec.

2. **Read before you write, every time — even if you already read this file today.** Every spec's "Current behavior" section cites line numbers and quotes real code as of when the spec was written. The codebase may have moved since. Before implementing, open the actual current file and confirm the cited behavior still matches. If it's drifted, adapt the spec's intent to the current code rather than blindly pasting old line numbers.

3. **Respect the Spec 02 → Spec 05 build order.** Spec 05 (matcher history) depends on `lib/referenceCode.ts`, which Spec 02 (blueprint export) creates. Build 02 first. Spec 05's file has an explicit reconciliation note at the top — follow it exactly; do not implement the alternate reference-code generator sketched earlier in that same file.

4. **Do not touch `06-design-phase2-explainable-matching.md` or `07-design-phase3-schools-tier.md` as implementation work.** Both are explicitly deferred design docs, not specs — building against them without being asked is scope creep, not thoroughness.

5. **No accounts, no login, no new backend, no new database — this phase.** This is a repeated, deliberate decision (see `DOCUMENTATION.md` §5), not an oversight to "fix." If a spec's approach seems like it's missing a login system, it isn't — re-read the spec's "Future-proofing" section; the local-only approach is intentional.

6. **Don't touch the dormant M-Pesa / PRO code** (`app/api/mpesa/*`, `app/api/pro/activate`, `@vercel/kv` usage) as part of this plan. It's intentionally left in place per `RESTORING-PAYWALL.md`. If a task ever does touch monetization, re-read that file first — it documents a real security mistake (client-side-only paywall gating) that must not be repeated.

7. **Follow existing patterns over inventing new ones.** This codebase has consistent conventions: `localStorage` stores keyed `tafuta_*`, hydration-safe browser-only UI via `useIsHydrated()` (`lib/hydration.ts`), state stores via `useSyncExternalStore` (see `lib/savedCareers.ts`), print/share/save patterns established on the career detail page (`app/career/[id]/ShareButton.tsx`, `CareerExtras.tsx`). Every spec in this plan was written by mirroring one of these existing patterns — don't introduce a new state-management approach, a new PDF library, or a new styling convention without flagging it first.

8. **No new npm dependencies unless a spec explicitly calls for one.** None of the Phase 1 specs require a new dependency. If you think you need one, stop and reconsider — the specs were deliberately written to reuse what's already in `package.json`.

## Workflow per spec

1. Create a branch named for the spec (e.g. `upgrade/01-matcher-progress-indicator`).
2. Read the full spec file.
3. Read every file it names as "current behavior" and confirm the spec's claims against the live code.
4. Implement exactly the "Exact changes" section — no unrelated cleanup, refactors, or "while I'm in here" changes bundled into the same commit.
5. Work through the spec's "Testing checklist" item by item before considering the task done. For anything requiring a running dev server or a browser, actually run it — don't mark a checklist item done from reading the code alone.
6. Note anything from the spec's "Risk notes" that you had to make a judgment call on, in your PR/commit description.
7. Do not merge to `main` without the user's review — these are surgical changes to a live, deployed site (`tafutacareer.com`).

## If a spec and the live code disagree

The specs were written by reading the repository at a point in time (21 Aug 2026, commit checked at spec-writing time). If you find the current code has diverged meaningfully from what a spec describes as "current behavior," don't force the spec's exact diff onto code it no longer matches. Instead: re-derive the same *intent* (described in the spec's Overview) against the current code, and flag the discrepancy back to the user rather than silently improvising a different design.

## Where things are

```
tafuta-career/
  CLAUDE.md                          <- this file
  docs/upgrade-2026-08/
    00-MASTER-PLAN.md                <- start here: sequencing, decisions, build order
    DOCUMENTATION.md                 <- narrative: why each decision was made
    01-spec-matcher-progress-indicator.md
    02-spec-blueprint-export.md      <- build before 05
    03-spec-sitemap-fix.md
    04-spec-homepage-audience-toggle.md
    05-spec-matcher-history.md       <- depends on 02
    06-design-phase2-explainable-matching.md   <- DO NOT implement yet
    07-design-phase3-schools-tier.md           <- DO NOT implement yet
  app/            Next.js App Router routes
  components/     Shared React components
  lib/            Data, matching logic, localStorage stores
  prisma/         Schema reference only — not a live database
```
