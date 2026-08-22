---
phase: 1 — Medium effort (selected) — "accounts + history" scope, implemented WITHOUT real accounts
status: ready to implement (after Spec 02 — see reconciliation note)
touches: lib/matcherHistory.ts (new), components/MatcherHistory.tsx (new), app/history/page.tsx (new), components/CareerMatcher.tsx, components/Navbar.tsx
depends_on: Spec 02 (lib/referenceCode.ts) — see reconciliation note below
estimated_effort: ~2 days
---

# Spec 05 — Local-only matcher run history

## ⚠️ Reconciliation note — apply this before implementing

This spec was drafted in parallel with Spec 02 (blueprint export) without visibility into it,
and independently defined its own `generateReferenceCode()` (a random `Date.now()` + `Math.random()`
string, see original sketch below) inside `lib/matcherHistory.ts`. **Spec 02 already defines a
better one** — deterministic (same pathway + same subjects always produce the same code), in
`lib/referenceCode.ts`. Resolution:

- **Do not** define a second `generateReferenceCode()` in `lib/matcherHistory.ts`.
- **Do** implement Spec 02 first (it has no dependency on this spec).
- **Do** import `generateReferenceCode` from `lib/referenceCode.ts` in `matcherHistory.ts`'s
  `LocalHistoryStore.add()` method, calling it as `generateReferenceCode(run.pathway, run.selectedSubjects)`
  instead of the random generator shown in the original sketch.
- This also means a history entry's `referenceCode` will exactly match the `MatcherBlueprint`
  reference code shown at the time that run was made — which is a nice, unplanned consistency
  win (a student's "blueprint" and its history-list entry always show the same code).

Everything else below is unchanged from the original spec.

## Overview

Add a **Selection History** feature to the Career Matcher: every time a student completes a matcher run (reaches step 3 with results), the run is logged to `localStorage` with a relative timestamp, a reference code, and enough information to fully reconstruct the result screen later via a "View Report" link at `/history`. No accounts, no server calls, no new dependencies.

Built in two layers, mirroring the codebase's existing `pro/activate` precedent of "local-first, server-optional":

1. **Today**: a `localStorage`-backed store (`lib/matcherHistory.ts`), following the exact `useSyncExternalStore` pattern already proven in `lib/savedCareers.ts`.
2. **The seam**: a small async `HistoryStore` interface that both today's local implementation and a hypothetical future API-backed implementation satisfy, so `MatcherHistory.tsx` and `app/history/page.tsx` never call `localStorage` directly and never need to change when real accounts arrive.

Storage strategy: **persist run inputs, not the full result payload.** A history entry stores `{ pathway, selectedSubjects }` plus a small display snapshot (`resultCount`). "View Report" recomputes the full `MatchResult[]` on demand via the existing pure `matchCareers()` function — the same "store IDs/inputs, hydrate at render" pattern `savedCareers.ts` already uses.

## Files to create/modify

| Path | Action | Purpose |
|---|---|---|
| `lib/matcherHistory.ts` | create | localStorage store + `useSyncExternalStore` hook, mirrors `lib/savedCareers.ts` |
| `components/MatcherHistory.tsx` | create | List view + "View Report" detail rendering, mirrors `components/SavedCareers.tsx` |
| `app/history/page.tsx` | create | Route shell, mirrors `app/saved/page.tsx` |
| `components/CareerMatcher.tsx` | modify | Log a run when step 3 is entered with results |
| `components/Navbar.tsx` | modify | Add `{ href: '/history', label: 'History' }` to `navLinks` |

No changes to `lib/hydration.ts`, `lib/matching.ts`, `lib/savedCareers.ts`, `components/SavedCareers.tsx`, `app/saved/page.tsx`, or `components/CareerCard.tsx`.

## Current precedent to mirror (`lib/savedCareers.ts` + `/saved`)

- Storage key constant: `export const SAVED_CAREERS_KEY = 'tafuta_saved_careers';`
- Module-level `listeners: Set<() => void>` + a `cachedRaw`/`cachedIds` memo pair so `getSnapshot()` returns a referentially-stable array unless the raw string actually changed (required — `useSyncExternalStore` infinite-loops otherwise).
- `getSnapshot()` guards `typeof window === 'undefined'`, wraps `localStorage.getItem` in try/catch, returns a shared `EMPTY` array on failure.
- `getServerSnapshot()` always returns `EMPTY` — makes SSR safe.
- `subscribe()` registers the listener locally *and* on the native `storage` event (cross-tab sync); same-tab writes call `emit()`.
- Mutators funnel through one `writeSavedCareerIds()` (try/catch swallowed, quota errors don't throw into the UI) then call `emit()`.
- Public hook: `useSavedCareerIds = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`.
- `SavedCareers.tsx` gates on `useIsHydrated()` before rendering real data (avoids a flash of empty state during hydration), joins stored IDs against `allCareers` via a `useMemo` `Map`, silently drops IDs with no matching career.
- `app/saved/page.tsx` sets `metadata.robots = { index: false, follow: true }` — bookmarks aren't indexable. Same logic applies to `/history`.

`CareerMatcher.tsx`'s run-producer: `handleNext()` at `step === 2` calls `matchCareers(selectedSubjects, allCareers, selectedPathway || undefined, 1)`, stores into `results`, transitions to `step 3`. `selectedPathway`/`selectedSubjects` are the two inputs; every step-2→3 transition is exactly one "run."

`lib/matching.ts`'s `matchCareers()` is a **pure function** — given the same static `allCareers` dataset, same inputs always reproduce the same output. This is what makes "persist inputs, recompute output" safe and cheap.

## Data model

```ts
/** One completed Career Matcher run, as persisted to localStorage. */
export interface MatcherHistoryEntry {
  /** Stable identity for React keys and removal. */
  id: string;
  /** Short, student-facing label — from generateReferenceCode() in lib/referenceCode.ts (see reconciliation note above). Cosmetic only, not used for lookups. */
  referenceCode: string;
  /** Date.now() at the moment step 2 -> step 3 completed. */
  timestamp: number;
  /** The pathway selected in step 1 ('A' | 'B' | 'C'). */
  pathway: string;
  /** The subjects selected in step 2, in selection order. */
  selectedSubjects: string[];
  /** Snapshot of results.length at run time. */
  resultCount: number;
}
```

- **Storage key:** `export const MATCHER_HISTORY_KEY = 'tafuta_matcher_history';`
- **Cap:** `export const MAX_HISTORY_ENTRIES = 20;` — stored newest-first (`unshift`); write path slices to the cap, evicting the oldest.

## Future-proofing for real accounts (the concrete seam)

`HistoryStore` — deliberately async even though today's only implementation is synchronous localStorage, so a fetch()-based implementation can swap in later without touching any component:

```ts
export interface HistoryStore {
  list(): Promise<MatcherHistoryEntry[]>;
  add(run: { pathway: string; selectedSubjects: string[]; resultCount: number }): Promise<MatcherHistoryEntry>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

class LocalHistoryStore implements HistoryStore {
  async list(): Promise<MatcherHistoryEntry[]> {
    return readMatcherHistory();
  }
  async add(run): Promise<MatcherHistoryEntry> {
    const entry: MatcherHistoryEntry = {
      id: makeId(),
      referenceCode: generateReferenceCode(run.pathway, run.selectedSubjects), // from lib/referenceCode.ts — see reconciliation note
      timestamp: Date.now(),
      ...run,
    };
    writeMatcherHistory([entry, ...readMatcherHistory()].slice(0, MAX_HISTORY_ENTRIES));
    return entry;
  }
  async remove(id: string): Promise<void> {
    writeMatcherHistory(readMatcherHistory().filter(e => e.id !== id));
  }
  async clear(): Promise<void> {
    writeMatcherHistory([]);
  }
}

/** The module's single active store instance. Swapping to a server-backed
 *  implementation later is a one-line change here — nothing else in the
 *  codebase imports LocalHistoryStore directly. */
export const historyStore: HistoryStore = new LocalHistoryStore();
```

A **future** (not this phase) `ApiHistoryStore` would implement the same interface via `fetch('/api/history')` calls — proving the interface holds up, not part of this build. This mirrors the precedent `app/api/pro/activate/route.ts` already establishes: local state today, optional server sync later, no breaking client change. `prisma/schema.prisma` would eventually gain `User`/`HistoryEntry` models to back it — again, no UI change required when that happens.

**React reactivity** stays a separate concern from the interface: `useMatcherHistory()` uses `useSyncExternalStore` internally today (reading through the same sync helpers `useSavedCareerIds()` uses), returning `{ entries: MatcherHistoryEntry[]; hydrated: boolean }`. A future API-backed hook would use `useState`/`useEffect` or SWR internally but return the identical shape — so `MatcherHistory.tsx` never changes. **Mutations** should be called through `historyStore` (the async interface) from `CareerMatcher.tsx` and `MatcherHistory.tsx`, not the raw sync helpers — this is what makes the future swap invisible.

## Exact changes

**`components/CareerMatcher.tsx`** — inside the existing `handleNext()`, `step === 2` branch, after `setResults(matched)`:
```ts
if (matched.length > 0) {
  historyStore.add({
    pathway: selectedPathway,
    selectedSubjects,
    resultCount: matched.length,
  });
}
```
Only log when `matched.length > 0`. No dedup against back-to-back identical runs — every completed run is a new entry, including resubmits after Back. `handleReset()`/`handleShare()` are untouched.

**`components/MatcherHistory.tsx`** (new) — mirrors `SavedCareers.tsx`:
- Props: `{ allCareers: Career[] }`.
- `useIsHydrated()` gate → "Loading your history…" placeholder.
- `useMatcherHistory()` → `{ entries, hydrated }`.
- Local state: `openEntryId: string | null` — which entry's report is expanded inline (simpler than a per-entry route; see Risk notes).
- List view per entry: relative timestamp (implement a small local `formatRelativeTime()` helper — no new dependency, repo has no `date-fns`/`dayjs`), `referenceCode` in a `font-mono` badge, pathway badge (reuse the `pathwayVariant`/`pathwayLabel` local-duplication convention already used in `SavedCareers.tsx`/`CareerCard.tsx`), `selectedSubjects.join(', ')`, `"{resultCount} matches"`.
- "View Report" → recomputes `matchCareers(entry.selectedSubjects, allCareers, entry.pathway || undefined, 1)` via `useMemo` keyed on `openEntryId`, toggles `openEntryId`. Render results with the existing `<CareerCard>` component (same props `CareerMatcher.tsx` already passes) — no new result-rendering code.
- Per-entry remove button (`historyStore.remove(entry.id)`); "Clear history" header action (`historyStore.clear()`), same placement/styling as `SavedCareers.tsx`'s "Clear all".
- Empty state mirrors `SavedCareers.tsx`'s: icon, heading, CTA link to `/matcher`.

**`app/history/page.tsx`** (new) — mirrors `app/saved/page.tsx`: gradient header, `History` icon, `metadata.robots = { index: false, follow: true }`, a one-line disclosure ("Your history is stored in this browser only — nothing is uploaded and no account is needed"), then `<MatcherHistory allCareers={careers} />`.

**`components/Navbar.tsx`** — add `{ href: '/history', label: 'History' }` after `/matcher`, before `/about`.

## Edge cases & non-goals

- No login, no server calls, no PII beyond what's already client-side (`pathway` + `selectedSubjects`, same category as `tafuta_saved_careers`).
- Must not touch `lib/savedCareers.ts`, `SAVED_CAREERS_KEY`, or its shared listener set — fully independent storage key/module.
- **Dataset drift:** "View Report" recomputes against the *current* `allCareers`, so a future content update could make a restored report differ from the original run. Accepted tradeoff for tiny storage; optionally compare stored `resultCount` to the recomputed count at render time and show a "results may have changed" note — nice-to-have, not required.
- **No dedup** — resubmitting the same selection creates a new entry each time; a future dedup-by-recent-identical-run is a follow-up, not part of this spec.
- Zero-match runs are not logged.
- Storage quota/private browsing: writes wrapped in try/catch and swallowed — a logging failure must never block step 3 from rendering.
- SSR/hydration: `useMatcherHistory()` returns empty/`hydrated: false` on server and first client render, mirroring `useSavedCareerIds()`.
- Cross-tab sync: free, via the same `storage` event pattern copied from `savedCareers.ts`.
- **Out of scope:** editing/renaming entries, exporting history, syncing across devices, any real accounts/login.

## Testing checklist

- Complete a matcher run → exactly one new `/history` entry appears, newest first.
- Complete 21 runs → store caps at 20, oldest evicted.
- "View Report" on an entry → restored list matches what step 3 originally showed (spot-check `matchPercentage`/`matchedSubjects`).
- Remove one entry → only that entry disappears, rest unaffected.
- "Clear history" → list empties, empty-state CTA renders.
- Reload → entries persist, no hydration warning.
- Second tab, after logging a run in the first → list updates via storage event.
- Hard-refresh `/history` directly → no hydration mismatch, brief "Loading…" placeholder.
- Mock/fill localStorage quota → matcher still completes runs normally; logging failure doesn't block step 3.
- `/saved` and its bookmarks fully unaffected (regression pass).
- `/history` confirmed `noindex`.
- Zero-match run does not create an entry.

## Risk notes

- **Main risk is scope creep** — resist building a separate `app/history/[id]/page.tsx` detail route; history entries aren't shareable/bookmarkable URLs by design (recomputed client-side from local state — a dedicated URL visited fresh with no localStorage would show nothing). The inline-expand pattern above is the right size for this phase.
- `HistoryStore` being async for a synchronous localStorage implementation is deliberate (the future-proofing seam) — don't "simplify" it back to sync calls.
- `prisma/schema.prisma` and `@vercel/kv` already exist in the repo but are unused by this phase — do not wire real persistence to them now; they're evidence the future server-backed path is architecturally cheap, not work to do in this pass.
- **Apply the reconciliation note at the top of this file** — do not ship a second, incompatible reference-code generator.
