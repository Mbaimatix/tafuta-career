---
phase: 1 — Do first
status: ready to implement
touches: lib/referenceCode.ts (new), components/MatcherBlueprint.tsx (new), components/CareerMatcher.tsx, app/globals.css
depends_on: none (but see reconciliation note — spec 05 must reuse this file's generateReferenceCode)
estimated_effort: ~1-2 days
---

# Spec 02 — Shareable "blueprint" results card + PDF export

> ⚠️ **Reconciliation note (read this first):** Spec 05 (matcher history) was written by a
> separate reviewer without visibility into this spec, and independently invented its own
> `generateReferenceCode()` (random-based) inside `lib/matcherHistory.ts`. **Do not implement
> both.** Implement `lib/referenceCode.ts` from *this* spec (deterministic, hash-based) first,
> and have Spec 05's history entries import and use `generateReferenceCode` from here instead
> of defining a second, incompatible generator. See Spec 05's own updated note for the exact
> change required there.

## Overview

The Career Matcher's step-3 results screen (`components/CareerMatcher.tsx`) currently shows a plain text summary above the result cards, with **Share Results** and **Print** buttons. The individual career detail page already has a "doc-style" pattern for share/print/save that this repo's authors clearly intend as the house style. This spec turns the matcher's results screen into a similarly document-like "blueprint" — a header block with pathway, subject chips, and a short deterministic reference code — sitting above the existing action buttons, and reuses the *existing* `window.print()` mechanism rather than introducing a new print/PDF pipeline or a new dependency.

No new runtime dependency is needed. `package.json` has no PDF library and the only export mechanism anywhere in the repo is `window.print()` gated by the `.no-print` / `@media print` convention in `app/globals.css`.

## Files to modify/create

**New:**
- `lib/referenceCode.ts` — pure, deterministic reference-code generator (no framework imports).
- `components/MatcherBlueprint.tsx` — the new "doc header" presentational component.

**Modified:**
- `components/CareerMatcher.tsx` — import and render `MatcherBlueprint` inside the `step === 3` block; compute the reference code.
- `app/globals.css` — small additions to the existing `@media print { }` block for page-break control.

No changes needed to `lib/matching.ts` or the career-detail-page files (read-only reference for the pattern being reused).

## Current behavior (what career-page share/print/save actually does today)

**Career detail page** (`app/career/[id]/ShareButton.tsx`, lines 12–58):
- `handleShare()` calls the native `navigator.share()` API when available, falling back to `navigator.clipboard.writeText(window.location.href)` with a 2-second "Copied!" state.
- The Print button: `onClick={() => window.print()}`, labeled **"Print / PDF"** — the repo already treats "print" and "PDF" as the same action/label via the browser's native print-to-PDF.
- Both buttons sit in a `<div className="flex items-center gap-3 no-print flex-wrap">` — stripped from the printout by the global `.no-print` rule.

**Global print CSS** (`app/globals.css`, lines 56–59):
```css
@media print {
  nav, footer, .no-print { display: none !important; }
  body { font-size: 12pt; }
}
```
This is the entire print stylesheet today. No page-break handling, no `@page` rule.

**Career Matcher's own share/print** (`components/CareerMatcher.tsx`):
- `handleShare()` (lines 90–98) is **not** the Web Share API — it sets `?pathway=`/`?subjects=` query params and copies the URL. Note: these params are never read back anywhere (`useSearchParams()` is not used in this file) — the shared link is currently decorative. This is a pre-existing quirk, not something this task fixes (see Non-goals).
- `handlePrint()` (lines 100–108) is `window.print()`, guarded: if not all results are visible (pagination), it first expands to full count and delays 150ms before printing. Preserve this exactly.
- Button labels today: **"Share Results"** and **"Print"**, both inside a `no-print` wrapper.

## Exact changes

### 1. `lib/referenceCode.ts` (new)

```ts
/**
 * Deterministic, short "blueprint" reference code for a matcher result set.
 * NOT a guaranteed-unique identifier — it's a compact human-shareable label,
 * not a database key. Same pathway + same subject set (any order) => same code.
 */
export function generateReferenceCode(pathwayCode: string, subjects: string[]): string {
  const normalized = [...subjects]
    .map(s => s.trim().toLowerCase())
    .sort()
    .join('|');
  const input = `${pathwayCode.toUpperCase()}::${normalized}`;

  // Simple FNV-1a 32-bit hash — deterministic, dependency-free, works client-side.
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const code = (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);

  return `TC-${pathwayCode.toUpperCase()}-${code}`;
}
```
Example output: `TC-A-4H2K9Q`. Format mirrors the repo's existing short mono badges (`#{career.number}` in `CareerCard.tsx`).

### 2. `components/MatcherBlueprint.tsx` (new)

Props (all sourced from `CareerMatcher`'s existing state):
```ts
interface MatcherBlueprintProps {
  pathwayCode: string;        // selectedPathway, e.g. "A"
  pathwayLabel: string;       // PATHWAY_INFO[selectedPathway].label, e.g. "STEM"
  subjects: string[];         // selectedSubjects
  matchCount: number;         // results.length
  referenceCode: string;      // generateReferenceCode(selectedPathway, selectedSubjects)
}
```
Render, reusing existing pieces:
- Reuse `SubjectTag` (`components/SubjectTag.tsx`) for each subject chip, passing `pathway={pathwayCode}` so color-coding matches the rest of the site.
- Reuse `Badge` (`components/ui/Badge.tsx`) for the pathway label.
- Reference code as a small `font-mono` pill, consistent with `#{career.number}` styling.
- A "Generated on {date}" line using `new Date().toLocaleDateString()`.
- Wrap in a bordered card matching the site's existing card idiom (`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4/p-6`).

### 3. `CareerMatcher.tsx` wiring

- Import `generateReferenceCode` and `MatcherBlueprint`.
- Compute once with `useMemo`, keyed on `[selectedPathway, selectedSubjects]`.
- Render `<MatcherBlueprint ... />` above the existing plain-text summary block, only when `results.length > 0`.
- Leave `handleShare`/`handlePrint` logic untouched. Recommended: rename the Print button label from `"Print"` to `"Print / PDF"` to match the career page's exact existing wording — do not add a second separate "Download PDF" button, since there's only one export mechanism.

### 4. Print CSS

Extend (not replace) the existing `@media print { }` block:
```css
@media print {
  nav, footer, .no-print { display: none !important; }
  body { font-size: 12pt; }
  .blueprint-header { break-inside: avoid; page-break-inside: avoid; }
}
```
Apply `blueprint-header` as a class on `MatcherBlueprint`'s root element.

### 5. PDF approach: use `window.print()`, not a library

Every existing print/PDF affordance in the codebase is `window.print()` + CSS. No PDF library exists in `package.json`. Introducing one here would create two incompatible export mechanisms in one app, add bundle weight, and add new failure modes — not worth it for what CSS + native print already handles adequately.

## Edge cases & non-goals

- `results.length === 0`: do not render `MatcherBlueprint` — keep the existing empty-state panel unchanged.
- Subject chip row must wrap (`flex flex-wrap`) for 3–8 selected subjects, matching the existing step-2 preview.
- Going Back and changing subjects recomputes both `results` and the `referenceCode` memo — no stale-code risk.
- The reference code is **not** unique-guaranteed (6-char base36 space) — never use it as a lookup key or database primary key, only as a shareable label.
- **Non-goal:** fixing the pre-existing dead `?pathway=`/`?subjects=` share query params — flag it, don't silently fix it as a side effect.
- **Non-goal:** adopting `navigator.share()` for the matcher's Share button — out of scope.
- **Non-goal:** wiring the reference code into any backend/API/lookup — no such endpoint exists or is requested.
- **Non-goal:** a real PDF-generation library.

## Testing checklist

- [ ] Blueprint header renders with correct pathway label, subject chips, non-empty reference code.
- [ ] Same pathway + same subjects (different click order) → same code; changing one subject → different code.
- [ ] `results.length === 0` → blueprint does not render.
- [ ] MIN/MAX subject counts (3 and 8) render the chip row without breakage, light and dark mode.
- [ ] Print with "Show more" not fully expanded — confirm existing reveal-then-print behavior still fires and the printout includes the header plus every card.
- [ ] Print preview: action buttons hidden, blueprint header visible, no page-break split.
- [ ] Share Results button still works, unaffected.
- [ ] Back → change subjects → forward: blueprint updates with no stale data.
- [ ] Dark mode contrast check.
- [ ] No new dependency added to `package.json`; `tsc`/`next build` passes cleanly.

## Risk notes

- `CareerMatcher.tsx` already duplicates a subset of `lib/career-data.ts`'s `pathways` export as a local `PATHWAY_INFO` const — this spec reuses that as-is rather than reconciling drift, which is out of scope here.
- Reference code is derived from subject/pathway *names* — renaming a subject later would silently change codes. Acceptable for a decorative label.
- Print fidelity (`window.print()` → "Save as PDF") is inherently browser-dependent — pre-existing characteristic of the repo's approach, not a regression.
- No automated test coverage exists for print/share behavior anywhere in the repo — manual verification per the checklist is required.
