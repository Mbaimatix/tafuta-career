---
phase: 1 — Medium effort (selected)
status: ready to implement
touches: components/Hero.tsx (new), app/page.tsx
depends_on: none
estimated_effort: ~1 day
---

# Spec 04 — Student / Parent audience toggle on homepage hero

## Overview

Add a small, no-login, client-side "I'm a student / I'm a parent" segmented toggle to the homepage hero. Flipping it swaps only the hero's headline, subhead, and CTA button labels between a student-voiced variant and a parent-voiced variant. Purely presentational copy — it does not gate content, does not change routing, does not touch the career matcher, search, or any other page. Defaults to the student (neutral) copy on first load; once the user interacts, the choice is remembered in `localStorage` for that browser (no cookie, no server involvement).

`app/page.tsx` is currently a **server component** with no `'use client'` directive. Because the toggle needs `useState`/browser storage, the hero must be extracted into a new client component, reusing the `useIsHydrated()` hook (`lib/hydration.ts`) already proven in `components/SavedCareers.tsx` for exactly this "browser-only UI without a hydration mismatch" problem.

## Files to modify/create

- **Create:** `components/Hero.tsx` — owns the entire hero `<section>` currently inlined in `app/page.tsx`, plus the toggle.
- **Modify:** `app/page.tsx` — remove the inline hero JSX, render `<Hero careers={careers} />` instead. Keep the `ArrowRight` import (still used elsewhere in the file for other CTAs).
- No changes to `lib/hydration.ts`, `components/Navbar.tsx`, `components/Footer.tsx`, `components/SearchAutocomplete.tsx`, or any route under `/matcher`, `/search`, `/subjects`, `/pathway`, `/career`, `/saved`, `/about`.
- New localStorage key: `tafuta_hero_audience` (matches the `tafuta_*` convention).

## Current homepage hero (verbatim, from `app/page.tsx`)

```tsx
<section className="hero-gradient relative overflow-hidden">
  <div className="absolute inset-0 bg-black/30" />
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
    <div className="flex justify-center mb-8"> ... flag stripe ... </div>
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight animate-fade-in">
      Discover Your Future <span style={{ color: '#F59E0B' }}>Career Path</span>
    </h1>
    <p className="text-xl text-white/80 mb-1 italic font-medium">Gundua Njia Yako ya Kazi</p>
    <p className="text-sm text-white/60 mb-8 italic">(Discover Your Career Path)</p>
    <p className="text-base text-white/70 mb-8 max-w-2xl mx-auto">
      The most comprehensive CBC career guidance platform for Kenyan students.
      Match your subjects to 1,252 careers across all three pathways.
    </p>
    <div className="flex ... gap-4 mb-8">
      <Link href="/matcher" style={{ background: '#006600' }}>Start Career Matching <ArrowRight/></Link>
      <Link href="/subjects">Explore by Subject</Link>
    </div>
    <div className="max-w-2xl mx-auto mb-8">
      <SearchAutocomplete careers={careers} placeholder="Search 1,252 careers..." />
    </div>
  </div>
</section>
```

Key facts this spec depends on:
- CTA styling is inline `style={{ background: '#006600' }}` / `'#BB0000'`, not Tailwind color utilities — reuse these exact inline colors.
- `SearchAutocomplete` is a client component already rendered inside the hero, taking `careers` + `placeholder` props.
- `lib/hydration.ts` exports `useIsHydrated()`, already consumed via `const hydrated = useIsHydrated();`.

## Exact changes

### `components/Hero.tsx` (new)

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Career } from '@/lib/career-data';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { useIsHydrated } from '@/lib/hydration';

type Audience = 'student' | 'parent';
const AUDIENCE_KEY = 'tafuta_hero_audience';

function readStoredAudience(): Audience {
  if (typeof window === 'undefined') return 'student';
  try {
    const raw = localStorage.getItem(AUDIENCE_KEY);
    return raw === 'parent' ? 'parent' : 'student';
  } catch {
    return 'student';
  }
}

function writeStoredAudience(value: Audience) {
  try {
    localStorage.setItem(AUDIENCE_KEY, value);
  } catch {
    // Storage full or blocked — toggle still works this render, just isn't remembered.
  }
}

const COPY: Record<Audience, { headline: React.ReactNode; subhead: string; primaryCta: string; secondaryCta: string }> = {
  student: {
    headline: <>Discover Your Future <span style={{ color: '#F59E0B' }}>Career Path</span></>,
    subhead: 'The most comprehensive CBC career guidance platform for Kenyan students. Match your subjects to 1,252 careers across all three pathways.',
    primaryCta: 'Start Career Matching',
    secondaryCta: 'Explore by Subject',
  },
  parent: {
    headline: <>Help Your Child Choose the Right <span style={{ color: '#F59E0B' }}>Career Path</span></>,
    subhead: "A clear, CBC-aligned guide to Kenya's career pathways — see which subjects lead to which careers, so you can support your child's choices with confidence.",
    primaryCta: 'See Career Matches',
    secondaryCta: 'Explore Pathways by Subject',
  },
};

export default function Hero({ careers }: { careers: Career[] }) {
  const hydrated = useIsHydrated();
  const [override, setOverride] = useState<Audience | null>(null);
  const effectiveAudience: Audience = override ?? (hydrated ? readStoredAudience() : 'student');

  function selectAudience(next: Audience) {
    setOverride(next);
    writeStoredAudience(next);
  }

  const copy = COPY[effectiveAudience];

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        {/* flag stripe accent — unchanged, copy verbatim from current page.tsx */}

        {/* Audience toggle */}
        <div className="flex justify-center mb-6">
          <div role="group" aria-label="View this page as" className="inline-flex rounded-full bg-white/10 border border-white/25 p-1 backdrop-blur-sm">
            <button type="button" aria-pressed={effectiveAudience === 'student'} onClick={() => selectAudience('student')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${effectiveAudience === 'student' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}>
              I&apos;m a Student
            </button>
            <button type="button" aria-pressed={effectiveAudience === 'parent'} onClick={() => selectAudience('parent')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${effectiveAudience === 'parent' ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white'}`}>
              I&apos;m a Parent
            </button>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight animate-fade-in">{copy.headline}</h1>
        <p className="text-xl text-white/80 mb-1 italic font-medium">Gundua Njia Yako ya Kazi</p>
        <p className="text-sm text-white/60 mb-8 italic">(Discover Your Career Path)</p>
        <p className="text-base text-white/70 mb-8 max-w-2xl mx-auto">{copy.subhead}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/matcher" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-2xl transition-transform hover:scale-105" style={{ background: '#006600' }}>
            {copy.primaryCta} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/subjects" className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white/20 text-white text-lg border-2 border-white/40 hover:bg-white/30 transition-colors">
            {copy.secondaryCta}
          </Link>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <SearchAutocomplete careers={careers} placeholder="Search 1,252 careers — e.g. Doctor, Software Engineer, Teacher..." />
        </div>
      </div>
    </section>
  );
}
```

### State-management approach (why it avoids a hydration mismatch)

1. Server render and the first client (hydrating) render always show `student` copy — `useIsHydrated()` returns `false` in both, so `effectiveAudience` is hard-pinned to `'student'`. SSR HTML and first paint match byte-for-byte.
2. Once hydrated, `effectiveAudience` becomes `override ?? readStoredAudience()` — reading `localStorage` **at render time** (not in a `useEffect`), which is safe because it's only reached once `hydrated` is `true`. This is the exact pattern `lib/hydration.ts`'s own docblock recommends ("without a hydration mismatch and without setState-in-effect") — do not "simplify" this into a `useEffect` sync, which would reintroduce an extra-render flash.
3. `writeStoredAudience` wraps `localStorage.setItem` in try/catch, matching `lib/savedCareers.ts`'s defensive pattern.
4. No `useSyncExternalStore` cross-tab store needed — this preference has no cross-component or cross-tab consumers.

### `app/page.tsx` changes

Remove the inline hero `<section>` block; replace with `<Hero careers={careers} />`. Remove the now-unused `SearchAutocomplete` import from `page.tsx` if nothing else there uses it (verify before removing — `ArrowRight` is still used further down in "How It Works"/"Final CTA" sections, keep that import).

## Copy variants

| Field | Student (default, byte-identical to current copy) | Parent |
|---|---|---|
| Headline | "Discover Your Future **Career Path**" | "Help Your Child Choose the Right **Career Path**" |
| Subhead | (unchanged current subhead) | "A clear, CBC-aligned guide to Kenya's career pathways — see which subjects lead to which careers, so you can support your child's choices with confidence." |
| Primary CTA | "Start Career Matching" | "See Career Matches" |
| Secondary CTA | "Explore by Subject" | "Explore Pathways by Subject" |

Both `Link` `href`s (`/matcher`, `/subjects`) stay identical in both states — only labels change.

## Edge cases & non-goals

- No accounts, no session, no server round-trip — pure UI preference.
- No routing changes — do not create `?audience=parent` query variants.
- No effect on `CareerMatcher.tsx`, `lib/matching.ts`, `lib/search.ts`, `SearchAutocomplete`, or `lib/savedCareers.ts`/`/saved`.
- SSR/SEO: server-rendered HTML must always show student copy — do not attempt to read localStorage/cookies during SSR.
- Storage failures are silent — must not throw or break the toggle.
- No cross-tab sync needed (unlike `savedCareers.ts`) — acceptable and intentionally simpler.
- Accessibility: real `<button type="button">` with `aria-pressed`, keyboard-reachable.
- Do not introduce Framer Motion into the hero for this change — keep the diff minimal, consistent with the file's current lack of `motion.*` usage.
- Do not change the Kiswahili tagline, flag-stripe accent, stats strip, pathway cards, "How It Works," featured careers, or final CTA — none reference `audience`.
- **Non-goal:** persisting the preference server-side, showing it in the navbar/footer, or letting it influence which careers/pathways are shown.

## Testing checklist

1. Cleared localStorage → load `/` → student copy renders, "I'm a Student" pill active. View source (JS disabled): confirm SSR HTML is student copy.
2. Console check on load (both empty and pre-set `parent` localStorage) — zero hydration mismatch warnings.
3. Click "I'm a Parent" — copy updates immediately; `/matcher`/`/subjects` hrefs unchanged (inspect DOM). Click back — copy reverts exactly.
4. Set to "Parent," reload same tab — parent copy resolves within one paint after hydration (a brief pre-hydration flash to student copy is expected/acceptable).
5. Confirm only `tafuta_hero_audience` is written to localStorage, no other keys.
6. Simulate blocked storage (private mode) — toggle still switches copy for the current view, no thrown error.
7. Regression: `/matcher`, `/search`, `/subjects`, `/saved`, `/about`, `/pathway/[code]` all load and behave as before.
8. Keyboard accessibility: Tab to toggle, Enter/Space activates; `aria-pressed` reflects state.
9. Responsive: 375px viewport, toggle doesn't overflow or wrap awkwardly.
10. Dark/light mode: toggle styling remains legible (hero background is a fixed gradient, not theme-aware, so should be a non-issue — verify no regression).
11. `npm run build` passes with no new TypeScript errors.

## Risk notes

- Main structural risk is the client-component extraction — verify no other part of `page.tsx` relied on hero-local variables (a scan shows it doesn't).
- Student copy must stay byte-identical to current production copy for SSR/SEO parity — copy exact strings, don't paraphrase.
- The render-time `localStorage` read (`hydrated ? readStoredAudience() : 'student'`) is intentional, not a bug to "fix" into a `useEffect` — flag this to reviewers so it isn't reintroduced.
- Low blast radius: only `app/page.tsx` and the new `Hero.tsx` are touched; reverting is a two-file operation.
