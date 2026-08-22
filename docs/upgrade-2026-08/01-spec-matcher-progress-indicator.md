---
phase: 1 — Do first
status: ready to implement
touches: components/CareerMatcher.tsx (only)
depends_on: none
estimated_effort: ~1 day
---

# Spec 01 — Matcher progress indicator + breadcrumb

> Read this entire file before touching any code. Then read `components/CareerMatcher.tsx`
> yourself and confirm the line numbers/behavior below still match the current state of the
> file before making changes — the codebase may have moved on since this spec was written.

## Overview

The Career Matcher (`components/CareerMatcher.tsx`) is a 3-step client wizard (Pathway → Subjects → Results) that already has a labeled circle-progress bar and a `Back` button, but no breadcrumb and no way to jump backward except that single Back button. This spec adds a breadcrumb trail (Pathway label → dominant subject category → current step) reusing data already computed in the file, and makes the completed steps in the existing progress indicator clickable, giving a one-click jump back to any prior step — without fabricating a 4th step or touching matching/validation logic.

## Files to modify/create

- **Modify only:** `components/CareerMatcher.tsx`

No new files, no new components, no new npm packages. `ChevronRight` is already imported (line 5) and is reused for breadcrumb separators — no new icon import needed.

## Current behavior (as read from the file)

- Wizard state: `step` (`useState(1)`, values `1|2|3`), `direction` (for Framer Motion slide direction), `selectedPathway: string` (`''` until chosen), `selectedSubjects: string[]` — lines 46–53.
- `goTo(nextStep)` (lines 57–60) is a `useCallback` that sets `direction` based on `nextStep > step` and calls `setStep(nextStep)`. It is already direction-aware and safe to call for backward jumps — no new navigation primitive is needed.
- `handleNext()` (lines 70–79) only allows **forward** progression, gated by `canProceed` (line 111: step 1 needs `selectedPathway`, step 2 needs `selectedSubjects.length >= MIN_SUBJECTS`).
- The only existing "back" affordance is the `Back` button at lines 393–400: `onClick={() => step > 1 ? goTo(step - 1) : null}`, `disabled={step === 1}`. It decrements one step at a time; there is no way to jump directly from step 3 to step 1, and no breadcrumb of any kind exists anywhere in this component.
- The current "progress bar" (lines 115–138) is a `[1,2,3].map` rendering, per step `s`: a non-interactive `<div>` circle (lines 120–126, filled green + `CheckCircle2` if `s < step`, outlined green if `s === step`, gray otherwise), a label `<p>` (lines 127–131, text hidden below `sm:` breakpoint via `hidden sm:block`) reading `'Choose Pathway' | 'Pick Subjects' | 'Your Matches'`, and a connector bar (lines 132–134). None of this is clickable today — it's pure display.
- `SUBJECT_GROUPS` (lines 22–31) is a static, already-defined categorization of subject names into labeled groups (`'Sciences'`, `'Technical & Applied'`, `'Computer & ICT'`, `'Languages'`, `'Humanities & Social'`, `'Business & Economics'`, `'Arts, Sports & Creative'`, `'Mathematics'`) — this is the natural, already-existing source for a "STEM → <category>" style breadcrumb second segment. (Note: `lib/career-data.ts` also defines a real `subTracks` array with entries like `"A1" / "Pure & Applied Sciences"`, but `CareerMatcher.tsx` never imports or uses subtracks/subTracks today — there is no subtrack-inference logic anywhere in `lib/matching.ts`. Wiring that in would be a much larger, riskier change; this spec deliberately uses the file's existing `SUBJECT_GROUPS` instead. See Edge cases.)
- `PATHWAY_INFO` (lines 15–19) maps `'A'|'B'|'C'` → `{ label, icon, gradient, desc }`, e.g. `A → 'STEM'`.
- Breadcrumb precedent elsewhere in the repo (`app/career/[id]/page.tsx` lines 86–98) uses this exact pattern, which the new breadcrumb should visually match: `<nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">`, `ChevronRight className="w-4 h-4"` separators, `hover:text-slate-700 dark:hover:text-slate-200 transition-colors` on clickable crumbs, and `text-slate-700 dark:text-slate-200 font-medium` on the final/current crumb.
- No tests, no snapshots, no Playwright/Jest config exist in the repo referencing this component's markup — no test suite to break.

## Exact changes

### 1. Add a `getDominantSubjectGroup` helper (module scope)

Insert immediately after the `SUBJECT_GROUPS` constant (after line 31, before line 33 `const MAX_SUBJECTS = 8;`):

```ts
/** Returns the SUBJECT_GROUPS label with the most overlap with `selected`, or null if none selected. Ties go to the earliest group in SUBJECT_GROUPS order. */
function getDominantSubjectGroup(selected: string[]): string | null {
  if (selected.length === 0) return null;
  let bestLabel: string | null = null;
  let bestCount = 0;
  for (const group of SUBJECT_GROUPS) {
    const count = group.subjects.filter(s => selected.includes(s)).length;
    if (count > bestCount) {
      bestCount = count;
      bestLabel = group.label;
    }
  }
  return bestLabel;
}
```

### 2. Derive breadcrumb data in the component body

Immediately after line 111 (`const canProceed = ...`), add:

```ts
const pathwayLabel = selectedPathway
  ? PATHWAY_INFO[selectedPathway as keyof typeof PATHWAY_INFO]?.label ?? null
  : null;
const dominantGroup = getDominantSubjectGroup(selectedSubjects);

type Crumb = { label: string; onClick?: () => void };
const currentStepLabel =
  step === 1 ? 'Choose Pathway' : step === 2 ? (dominantGroup ?? 'Pick Subjects') : 'Your Matches';
const crumbs: Crumb[] = [];
if (step >= 2 && pathwayLabel) crumbs.push({ label: pathwayLabel, onClick: () => goTo(1) });
if (step >= 3) crumbs.push({ label: dominantGroup ?? 'Pick Subjects', onClick: () => goTo(2) });
crumbs.push({ label: currentStepLabel }); // current step, never clickable
```

This yields:
- Step 1: `crumbs.length === 1` → breadcrumb hidden entirely (nothing to show a path *back from* yet).
- Step 2, no subjects yet: `STEM` (clickable) → `Pick Subjects` (current, bold).
- Step 2, subjects picked: `STEM` (clickable) → `Sciences` (current, bold).
- Step 3: `STEM` (clickable→1) → `Sciences` (clickable→2) → `Your Matches` (current, bold).

### 3. Render the breadcrumb `<nav>`

Replace lines 137–138:

```tsx
        </div>
      </div>
```

with:

```tsx
        </div>

        {crumbs.length > 1 && (
          <nav aria-label="Wizard breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 flex-wrap mt-1">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
                {c.onClick ? (
                  <button
                    type="button"
                    onClick={c.onClick}
                    className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 rounded"
                  >
                    {c.label}
                  </button>
                ) : (
                  <span className="text-slate-700 dark:text-slate-200 font-medium" aria-current="step">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
```

(The outer `</div>` on the new last line closes the `mb-8` wrapper from line 116, same as the original line 138 did — just with the breadcrumb inserted as a new sibling before it.)

### 4. Make completed progress-bar steps clickable

Replace the circle `<div>` at lines 120–126:

```tsx
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                s < step ? 'bg-green-600 border-green-600 text-white' :
                s === step ? 'border-green-600 text-green-600 bg-white dark:bg-slate-900' :
                'border-slate-300 dark:border-slate-600 text-slate-400 bg-white dark:bg-slate-900'
              }`}>
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
```

with a conditional that renders a `<button>` (same visual classes plus interaction affordances) when the step is completed, and keeps a plain `<div>` for the current/future steps:

```tsx
              {s < step ? (
                <button
                  type="button"
                  onClick={() => goTo(s)}
                  aria-label={`Back to step ${s}: ${s === 1 ? 'Choose Pathway' : s === 2 ? 'Pick Subjects' : 'Your Matches'}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all bg-green-600 border-green-600 text-white cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  s === step ? 'border-green-600 text-green-600 bg-white dark:bg-slate-900' :
                  'border-slate-300 dark:border-slate-600 text-slate-400 bg-white dark:bg-slate-900'
                }`}>
                  {s}
                </div>
              )}
```

Notes for the implementer:
- `s === step` and `s > step` stay as plain, non-interactive `<div>`s — only completed steps (`s < step`) become clickable. This preserves the existing rule that users can't skip *forward*.
- The label `<p>` at lines 127–131 is left untouched — only the circle becomes clickable, keeping the touch target change minimal and low-risk.
- `goTo` is unchanged and already reused as-is; no new navigation function needed.

## Edge cases & non-goals

- **Do not fabricate a 4th step.** The wizard has exactly 3 steps — keep 3 progress indicators.
- **Do not wire in `lib/career-data.ts`'s real `subTracks`** for the breadcrumb's category segment — reuse `SUBJECT_GROUPS` as specified. Building subtrack inference is out of scope.
- **Do not change `canProceed`, `handleNext`, `matchCareers`, `MIN_SUBJECTS`/`MAX_SUBJECTS`, or any validation gate.** Backward navigation is intentionally ungated, consistent with the existing `Back` button.
- **Do not allow forward jumps** from the breadcrumb or progress circles.
- **Do not touch `handleShare`, `handlePrint`, or `handleReset`.**
- Pre-existing `resultsRef` double-attachment quirk (`ref={step !== 3 ? undefined : resultsRef}`) is unrelated — do not "fix" it here; just don't attach `resultsRef` to any new element.
- Neither the existing progress bar nor the new breadcrumb should get `.no-print` — both already print today, keep it that way.

## Testing checklist

1. Load `/matcher`. On step 1, confirm no breadcrumb renders.
2. Select a pathway, click Next. Confirm breadcrumb shows `STEM` (clickable) → `Pick Subjects` (bold).
3. Select subjects from different groups; confirm the second breadcrumb segment updates to whichever group has the most overlap (verify the tie-break order).
4. Click the pathway breadcrumb segment from step 2 — jumps to step 1, pathway selection preserved.
5. Reach step 3; confirm breadcrumb shows `Pathway → Group → Your Matches`.
6. From step 3, click the group segment — jumps to step 2, subjects preserved. Click the pathway segment — jumps directly to step 1 (skipping step 2), all state preserved.
7. In the progress bar: from step 3, click step-1 and step-2 circles — confirm both jump correctly; confirm the current/future circles are not clickable.
8. Keyboard test: Tab to a completed circle and a breadcrumb link; confirm a visible focus ring and Enter/Space activation.
9. Narrow viewport (375px): breadcrumb wraps, no horizontal scroll.
10. Dark mode: confirm colors/contrast.
11. `Start Over` from step 3: breadcrumb disappears, state clears.
12. Regression: `Share Results`, `Print`, `Show more matches`, forward `Next`/`Find Matches` all still work.

## Risk notes

- Converting completed-step circles from `<div>` to `<button>` changes the DOM element type — visually diff before/after to confirm no default browser button chrome leaks through.
- `aria-current`/`aria-label` additions are additive, low risk.
- The breadcrumb depends on `selectedSubjects` (re-rendered on every checkbox toggle) — watch for jarring flicker between group labels; debouncing is out of scope, raise as a follow-up if it feels distracting.
- No changes to matching logic, types, or dependencies — zero risk to the actual matching algorithm or result data.
