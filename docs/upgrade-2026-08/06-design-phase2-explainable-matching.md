---
phase: 2 — later, sequenced (explicitly NOT this round)
status: design sketch only — no implementation planned yet
touches (when eventually built): lib/matching.ts, components/CareerCard.tsx, app/career/[id]/page.tsx
depends_on: Phase 1 shipping first; a real signal that users want this (see revisit trigger)
---

# Design sketch 06 — Deterministic match explanations (no external AI)

**Status:** Not scheduled — exploratory design note for a future phase. No implementation work is planned against this doc yet.

## Overview & rationale

A competitor site added an AI chat panel that explains match results in natural language, backed by an external LLM API (Gemini). That integration is currently down in their production and represents a recurring cost and maintenance surface — API keys, rate limits, prompt drift, latency, and a new failure mode layered on top of the core product. The site owner explicitly decided against an external AI dependency for now.

The good news: `lib/matching.ts` already computes almost everything an explanation needs. `matchCareers()` returns `matchedSubjects`/`missingSubjects` (already split via `.filter()` against the student's normalized subject list) and a `matchPercentage`. One nuance worth flagging: `matchPercentage` is computed as `matchCount / selectedSubjects.length`, not `matchCount / totalRequired` — i.e. "how much of the career's requirement set is drawn from what you picked," not "how much of the career's requirements you meet." A student can easily misread a bare percentage this way, which is the strongest concrete case for a plain-language sentence adding real value here rather than being decorative. `getRelatedCareers()` similarly already scores relatedness by subject-set overlap but never says which subjects drove the score.

In both cases the reasoning already exists as data — turning it into a sentence is a pure string-templating problem over data already computed, with no new I/O, no async, no external call, and no new failure mode.

## What "explainable" would concretely add

Real records from `lib/career-data.ts`:

1. **Strong match** — Medical Doctor / Surgeon (`Biology, Chemistry, Physics, Mathematics, English, Kiswahili`), student selected the first 5:
   > "Matches 5 of your 5 selected subjects: Biology, Chemistry, Physics, Mathematics, English. Medical Doctor / Surgeon also requires Kiswahili, which isn't in your current subject list."

2. **Partial match, gap made explicit** — same career, student selected Biology, Chemistry, Mathematics, Geography:
   > "Matches 3 of your 4 selected subjects: Biology, Chemistry, Mathematics. This career also needs Physics, English, and Kiswahili, which you haven't selected — that's why it's not a 100% match."
   (This is exactly the case where the existing percentage math can mislead — an explicit sentence removes the ambiguity.)

3. **Related-career reasoning** — Dentist related to Medical Doctor / Surgeon:
   > "Related to Medical Doctor / Surgeon — both careers require Biology, Chemistry, Physics, Mathematics, and English (5 shared subjects)."

4. **Non-STEM example** — Lawyer / Advocate (`History, English, CRE, Kiswahili`), student selected History, English, Kiswahili, Geography:
   > "Matches 3 of your 4 selected subjects: History, English, Kiswahili. Lawyer / Advocate also requires Christian Religious Education, which isn't in your subject list."

## Sketch of the approach

Extend, don't rewrite. Add one new pure function and one new field:

```ts
function explainMatch(
  career: Career,
  matchedSubjects: string[],
  missingSubjects: string[],
  selectedCount: number
): string {
  // Deterministic template — special-case 0 missing (no second sentence)
  // and 1 missing (singular phrasing).
}
```

`MatchResult` gains: `explanation: string;` — populated by `explainMatch()` inside `matchCareers()`.

`getRelatedCareers()` currently returns bare `Career[]`. Adding relation-explanation requires widening this — either return `{ career, sharedSubjects, explanation }[]` (updating the one call site in `app/career/[id]/page.tsx`), or add a separate `explainRelatedCareer(career, related)` helper called independently, leaving `getRelatedCareers()` untouched. Either is a same-file, few-line change, not a rewrite of the scoring logic.

No new npm packages, no new module boundary, no async.

## Where it would surface in the UI

- `components/CareerMatcher.tsx` — step 3 results already render `results.map(...)` into `<CareerCard>`. The explanation sentence would sit as a caption under the match bar (which today shows only a bare `{matchPercentage}%`), or behind an expandable "why this match?" affordance.
- `components/CareerCard.tsx` — would need an optional `explanation?: string` prop, following the same pattern already used for `matchPercentage`/`matchedSubjects`.
- `app/career/[id]/page.tsx` — the "Related Careers" section's static caption would be replaced/augmented with `explainRelation()` output per related card.

No new components required — this rides on props/fields already threaded through the existing pipeline.

## Explicit non-goals for Phase 2

- No external API calls of any kind — no Gemini, no OpenAI, no hosted LLM.
- No new npm dependencies — plain template strings and array joins.
- No chat UI, no conversational interface, no free-text input — static, deterministic explanation text on results that already exist.
- No changes to the matching/scoring algorithm itself — `matchCareers()`'s filtering/percentage math and `getRelatedCareers()`'s overlap threshold/sort stay unchanged. Purely additive derived text.
- No localization/i18n work.

## Rough effort estimate and revisit trigger

**Effort:** Small — roughly half a day to a day. `explainMatch()`/`explainRelation()` are template functions over already-computed data; the `matchCareers()` change is a one-line addition; `getRelatedCareers()` needs one return-shape change plus one call-site update. UI work is two small edits.

**Revisit trigger:** After Phase 1 ships and real usage/feedback comes in — specifically if students report not understanding *why* a career matched or why a related career is suggested (i.e. the bare percentage and subject chips aren't self-explanatory enough on their own). Bump to active planning then, not speculatively now.
