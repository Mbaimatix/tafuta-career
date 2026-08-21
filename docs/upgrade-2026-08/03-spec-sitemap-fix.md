---
phase: 1 — Do first
status: investigation complete — no code bug found in current source; hardening fix recommended
touches: app/sitemap.ts
depends_on: none
estimated_effort: ~1 hour
---

# Spec 03 — sitemap.ts (373 → 1,252 careers)

## Investigation note — read this first

Before proposing a fix, this was verified empirically against the actual repo (commit checked, clean working tree):

```
careers: 1252
unique ids: 1252
total sitemap entries (as coded): 1268   (= 4 static + 3 pathway + 9 subtrack + 1252 career)
```

`app/sitemap.ts` contains **no** `.slice()`, `.filter()`, page-size constant, or hardcoded list — it does an unconditional `careers.map(...)` over the full, live-imported `careers` array. A repo-wide grep for the literal `373` finds only `id: 373` on one career record — no cap or manual list matches that number anywhere.

**Conclusion: the sitemap-undercount bug does not reproduce from this repository's current source.** As written, `app/sitemap.ts` already dynamically derives every career URL and would emit all 1,252 entries. If a live/deployed `sitemap.xml` is actually showing ~373 URLs, the most likely cause is **outside this source tree**:

- **Stale build** — `sitemap.ts` has no route-segment config, so Next statically generates it once at build time. If `lib/career-data.ts` was expanded to 1,252 entries in a commit that was never redeployed (or deployed only to a preview), production keeps serving the sitemap baked from the old, smaller data file.
- A CDN/edge cache serving a pre-expansion response past its TTL.
- A Search Console "indexed" count, which reflects Google's own crawl state (lags real crawls by days) — not the same thing as what's actually in `sitemap.xml` right now.

The fix below hardens the file against exactly this failure mode (so it can self-heal on a schedule instead of freezing at build time) and gives you the concrete commands to check what your *live* site is actually serving.

## Files to modify

- `app/sitemap.ts`

**Related, found during audit but out of scope for this fix:** `app/pathway/[code]/page.tsx`'s `generateStaticParams` hardcodes `[{code:'A'},{code:'B'},{code:'C'}]` instead of deriving from the `pathways` export — the same "manual list next to a dynamic source" pattern. It happens to match today but is a latent drift risk if a 4th pathway is ever added. Flagged for a future pass, not required here.

## Exact fix

Replace `app/sitemap.ts` with:

```ts
import { MetadataRoute } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';

// Force this route to be re-evaluated periodically instead of being
// frozen at build time — closes the most likely real cause of a sitemap
// that silently falls behind lib/career-data.ts after a data update.
export const revalidate = 3600; // 1 hour

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tafutacareer.com';
  const now = new Date();

  // De-dupe defensively by id so a future data-entry mistake (duplicate
  // id) can never produce duplicate/conflicting sitemap rows.
  const seenCareerIds = new Set<number>();
  const careerUrls = careers
    .filter(c => {
      if (seenCareerIds.has(c.id)) return false;
      seenCareerIds.add(c.id);
      return true;
    })
    .map(c => ({
      url: `${baseUrl}/career/${c.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const pathwayUrls = pathways.map(p => ({
    url: `${baseUrl}/pathway/${p.code}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const subTrackUrls = subTracks.map(st => ({
    url: `${baseUrl}/pathway/${st.pathwayCode}/${st.code}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/matcher`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    ...pathwayUrls,
    ...subTrackUrls,
    ...careerUrls,
  ];
}
```

**Note:** confirm `baseUrl` matches production exactly (the original file may already have this — verify, don't assume `https://tafutacareer.com` is byte-correct against the current file before replacing).

### Full route audit — what's included/excluded and why

| Route | Include? | Why |
|---|---|---|
| `/`, `/about`, `/matcher`, `/subjects` | Yes | Static pages, no noindex |
| `/pathway/[code]` × 3 | Yes | Derived from `pathways` |
| `/pathway/[code]/[subtrack]` × 9 | Yes | Derived from `subTracks` |
| `/career/[id]` × 1,252 | Yes | Derived from `careers` |
| `/saved` | **No** | `app/saved/page.tsx` sets `robots: { index: false, follow: true }` — correctly excluded, per-browser content |
| `/search` | Judgment call | Client component, no meaningful static content at the bare URL, not currently noindexed either. Leave out (current behavior) or add at low priority (≤0.3) — not a bug either way, flag for a product decision if it matters |
| `/api/*` | No | Not indexable pages |

## Edge cases & non-goals

- `/saved` must stay excluded — confirmed via its own `robots` meta tag.
- `/search` is a judgment call, not a bug — do not silently add it without a decision.
- Dedup guard added defensively even though no duplicate ids exist today (verified 1,252 unique ints).
- `app/pathway/[code]/page.tsx`'s hardcoded params is a related but separate issue — track as a follow-up, don't fix here.
- No change to `robots.txt` — already correctly points to `/sitemap.xml` and allows crawling.

## Testing checklist

1. **Static count check:**
   ```bash
   node --experimental-strip-types -e "
   import('./lib/career-data.ts').then(m => {
     console.log('careers:', m.careers.length);
     console.log('unique ids:', new Set(m.careers.map(c=>c.id)).size);
   });"
   ```
   Expect `careers: 1252`, `unique ids: 1252`.

2. **Dev-server check:**
   ```bash
   npm install && npm run dev
   curl -s http://localhost:3000/sitemap.xml | grep -c "<url>"      # expect 1268
   curl -s http://localhost:3000/sitemap.xml | grep -c "/career/"   # expect 1252
   ```

3. **No duplicates:**
   ```bash
   curl -s http://localhost:3000/sitemap.xml | grep -o "<loc>[^<]*</loc>" | sort | uniq -d
   ```
   Expect empty output.

4. **`/saved` absence:** `curl -s http://localhost:3000/sitemap.xml | grep -c "/saved"` → expect `0`.

5. **Production build parity:** `npm run build && npm start`, repeat step 2.

6. **Post-deploy live check (this is the real regression test for the staleness theory):**
   ```bash
   curl -s https://tafutacareer.com/sitemap.xml | grep -c "/career/"
   ```
   Should read `1252`. If not immediately, remember `revalidate = 3600` means up to an hour after deploy before it self-heals — force a redeploy or re-check after the window.

## Risk notes

- Low risk — additive change (`revalidate` export + dedup filter), no change to URL shape, priorities, or frequencies.
- `revalidate = 3600` trades a little build-time caching efficiency for freshness — cheap at this scale (~1,300 rows), confirm it doesn't conflict with any Vercel-project-level CDN caching rules configured outside this repo.
- This fix alone cannot prove/disprove the "stale build" theory for the *live* site — that needs the actual Vercel deployment history/build logs, outside this repo. If the live count is still wrong after deploying this and waiting out the revalidate window, look there next.
