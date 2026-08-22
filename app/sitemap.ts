import { MetadataRoute } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';

// Re-generate hourly rather than serving a response frozen at build time.
// Note what this does and does not buy: `careers` is a static compile-time
// import, so revalidation re-runs the same bundled module and cannot pick up
// an edited lib/career-data.ts without a redeploy. What it does prevent is a
// stale CDN/edge copy outliving a deploy.
export const revalidate = 3600; // 1 hour

// lastModified must NOT be `new Date()`. With revalidate above, that would
// restamp all ~1,268 URLs every hour, telling crawlers every career page
// changed hourly — a false freshness signal that search engines discount,
// which would undermine the indexing this file is meant to fix. The career
// catalogue only changes on deploy, so this is a fixed date: bump it when
// lib/career-data.ts actually changes.
const CONTENT_LAST_MODIFIED = new Date('2026-08-22T00:00:00Z');

export default function sitemap(): MetadataRoute.Sitemap {
  // Must match the canonical production domain. A sitemap served from
  // tafutacareer.com that lists URLs on another host is largely discounted
  // by search engines, so this has to stay in step with the OpenGraph URLs
  // in app/layout.tsx and the Sitemap line in public/robots.txt.
  const baseUrl = 'https://tafutacareer.com';

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
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const pathwayUrls = pathways.map(p => ({
    url: `${baseUrl}/pathway/${p.code}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const subTrackUrls = subTracks.map(st => ({
    url: `${baseUrl}/pathway/${st.pathwayCode}/${st.code}`,
    lastModified: CONTENT_LAST_MODIFIED,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // /saved is deliberately absent — it sets robots noindex
  // because its content lives in the visitor's own browser.
  // /search is also intentionally excluded: it is a client component with no
  // meaningful static content at the bare URL.
  return [
    { url: baseUrl, lastModified: CONTENT_LAST_MODIFIED, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/matcher`, lastModified: CONTENT_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: CONTENT_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: CONTENT_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.6 },
    ...pathwayUrls,
    ...subTrackUrls,
    ...careerUrls,
  ];
}
