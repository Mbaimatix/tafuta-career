# TAFUTA CAREER — Upgrade Documentation

This is the narrative reference for the August 2026 upgrade: what prompted it, what we found, what was decided, and why. Pair with `00-MASTER-PLAN.md` for execution order and the seven numbered spec files for implementation detail.

---

## 1. Background — how this started

You asked for a plan to bring `tafutacareer.com` up to feature parity with a reference site you'd seen, `cbc-careers.vercel.app/dashboard/tracks`.

That exact URL turned out to be a real 404 — confirmed by direct crawl of every plausible route (`/dashboard`, `/dashboard/tracks`, `/onboarding`, `/select-pathway`, `/get-started`, all Vercel-platform 404s, not the app's own not-found page). This wasn't a dead end: you separately supplied a "Competitive Teardown" document (an existing Claude artifact) built from an authenticated click-through of the live site, which explained the 404s as a real bug in that site — client-side-only routing with no server fallback, so any hard refresh or direct link to an inner page 404s. That teardown became the actual source of truth for what the reference site does, and everything in this plan traces back to it.

## 2. What the reference site (CareerPathway) actually does

Per the teardown, once you're logged in and navigating client-side (not hitting routes directly):

- **Persona-split onboarding** — "Get Started" branches into Learner/Parent vs. School/Institution, each with its own login screen and language.
- **Persona dashboard** — a time-of-day greeting, "Who's using CareerPathway today?", with a skip-to-pathways option.
- **Guided 3-step selection** — Pathway → Track → Electives, with a 4-dot progress bar, a breadcrumb, and one-click back.
- **Coded, searchable elective combinations** — ~90 pre-approved combinations per track, each with an official-style code, searchable by code/number/subject.
- **"Career Blueprint" report** — a document-styled result page (header block, subjects as "Pillars," careers grouped by elective) with a PDF download.
- **AI Career Forecast panel** — a floating chat launcher calling a Gemini model for on-demand narrative forecasts. **Currently broken in their production** (API error, retired model version) — a live example of what an AI feature commits you to.
- **Selection history** — every past run logged with a relative timestamp and a "View Report" restore link.
- **Account profile** — name/display-name settings, locked email.

Three caveats the teardown itself raises, which shaped our recommendations:

1. It is **not** an official Ministry of Education site, despite the branding — personal Vercel subdomain, placeholder phone number, unverifiable support email. Its "10,000+ Users" counter and testimonials should be treated as unverified placeholder content.
2. Its AI feature is broken right now — a maintenance-commitment warning, not a one-time build.
3. Its routing has a real bug (no server fallback for inner pages) — worth avoiding, not copying. Your existing `/career/[id]` URLs already handle this correctly; that's a strength to protect.

## 3. What your site (Tafuta Career) actually has today

Verified by cloning and reading the real repository (`Mbaimatix/tafuta-career`), not by guessing:

- **Tech stack:** Next.js 16 (App Router) + TypeScript, Tailwind CSS 4, Framer Motion, Fuse.js fuzzy search.
- **1,252 career profiles**, statically pre-rendered, each with salary range (KSH), growth outlook, required subjects, a university guide, and a visual career roadmap.
- **Career Matcher** — a 3-step wizard (pathway → subjects → results), already has print/share actions.
- **Fuzzy search**, **saved careers with 4-way comparison** (localStorage-only), **an AI-powered chatbot** (`ChatBot.tsx` — already free, never gated).
- **Deliberately no accounts, no login, no paywall.** Per your own `README.md`: "The site has no PRO tier, no subscription, and no login." A PRO paywall existed and was **intentionally removed on 2026-07-30** — see `RESTORING-PAYWALL.md`, which documents exactly what was taken out and warns explicitly that the old paywall was client-side-only and cosmetic ("Anyone could read it from devtools... gate on the server or the paywall will be cosmetic again").
- **Dormant payment infrastructure** — M-Pesa STK Push routes and Vercel KV integration still exist in the codebase, unreferenced by any UI, kept for possible future monetization.

**Your structural advantage over the reference site:** real depth (1,252 full profiles with salary/university/roadmap data) vs. their interaction-layer polish over much shallower content (career names grouped by subject, no salary/university data observed in the teardown). Nothing here should risk that advantage.

## 4. The gap, and what's worth building

Summarized from the teardown's comparison table, then scoped down through conversation with you:

| Area | Reference site | Your site | What we're doing about it |
|---|---|---|---|
| Selection flow UX | Progress dots, breadcrumbs | 3-step matcher, no visible progress indicator | **Building** — Spec 01 |
| Result format | Branded "Blueprint" doc + PDF | Career pages already have save/share/print | **Building** — Spec 02, extending the same treatment to matcher results |
| Discoverability | — | Sitemap only lists 373 of 1,252 careers (or did — see investigation note) | **Building** — Spec 03 |
| Audience segmentation | Student/Parent/School branching at login | Single generic experience | **Building, without a login wall** — Spec 04 |
| Accounts & history | Full login, persisted history | None — local bookmarks only | **Building the history half, without real accounts** — Spec 05 |
| AI layer | On-demand AI forecast (currently broken) | None — static rule-based matching | **Deferred, and deliberately not copying their approach** — Design doc 06 |
| Monetization / B2B | "School/Institution" portal (unclear if built out) | None | **Deferred** — Design doc 07 |
| Career data depth | Names only, grouped by subject | 1,252 full profiles, salary, universities, roadmap | **Already ahead — nothing to copy, protect this** |

## 5. Decisions made together, and why

### Accounts — decided: no real accounts this round

Three options were laid out: (1) stay accountless, simulate a dashboard/history with `localStorage`; (2) lightweight passwordless accounts for cross-device sync; (3) full accounts with student/parent/school roles, matching the reference site's persona split.

We chose (1), explicitly designed so (2) can be added later without rewriting UI components. Reasoning: your site's own README frames accountlessness as a deliberate choice, not an oversight ("no sign-up, no subscription, and no server-side account"). Adding real accounts is a genuine infrastructure commitment — a database that's actually live (today's Prisma+SQLite is schema-reference-only), an auth provider, session handling, and an ongoing privacy/data-handling surface for what would eventually include minors' data if a schools tier is ever built on top. None of that is justified by a competitor's login screen alone. We pushed back on jumping straight to option 3 for exactly this reason — it roughly triples the project's scope for a feature nobody has asked for yet.

The concrete engineering choice that makes this reversible: Spec 05's `HistoryStore` interface is async (`Promise`-returning) even though today's only implementation is synchronous `localStorage`. That's the one decision that lets a real API-backed store swap in later — component code never touches `localStorage` directly, only the interface.

### Monetization — decided: not touched this round, flagged for later

The dormant M-Pesa/PRO code stays dormant. If it's ever revisited, `RESTORING-PAYWALL.md`'s own warning applies with even more force for anything touching cohort/school data: gate on the server, never repeat the old client-side-only flag pattern.

### AI — decided: no external API, extend the deterministic matcher instead

The reference site's AI panel is broken in production right now — a concrete, current example of what an LLM-API dependency costs in maintenance, not a hypothetical risk. We chose instead to extend `lib/matching.ts`'s already-computed match/overlap data into human-readable explanation sentences — zero external calls, zero new dependencies, zero ongoing cost, and arguably more trustworthy than a model's narrative gloss since it's grounded in the actual matching logic rather than paraphrasing it. Full design in `06-design-phase2-explainable-matching.md`, deferred to Phase 2.

## 6. How the specs were produced

Once scope was agreed, seven parallel technical reviews were run, each reading the actual repository files relevant to its area (not writing from general knowledge) and returning a spec detailed enough to implement without guesswork — exact file paths, exact current code cited with line numbers, exact proposed changes, edge cases, and a testing checklist. One conflict surfaced during synthesis: Specs 02 and 05 each independently invented a "reference code" generator for a matcher run. This was caught, and Spec 05 was corrected to reuse Spec 02's deterministic version rather than shipping two incompatible ones — noted explicitly in both files so nothing is silently inconsistent.

Spec 03 (the sitemap fix) is worth calling out specifically: the investigation found the reported bug does **not** reproduce in the current source — the file already handles all 1,252 careers dynamically, with no bug found in the underlying data or logic. Rather than writing a fix for a bug that doesn't exist in the code, the spec documents that finding, proposes the most likely real explanation (a stale production build, since the route had no revalidation), and still ships a hardening change plus the exact commands to verify your live site.

## 7. What to do with this

See `00-MASTER-PLAN.md` for the execution-ready task list and sequencing, and `CLAUDE.md` at the repo root for the rules your VS Code Claude agent should follow while implementing.
