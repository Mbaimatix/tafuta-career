import { MetadataRoute } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';

// Force this route to be re-evaluated periodically instead of being
// frozen at build time — closes the most likely real cause of a sitemap
// that silently falls behind lib/career-data.ts after a data update.
export const revalidate = 3600; // 1 hour

export default function sitemap(): MetadataRoute.Sitemap {
  // Must match the canonical production domain. A sitemap served from
  // tafutacareer.com that lists URLs on another host is largely discounted
  // by search engines, so this has to stay in step with the OpenGraph URLs
  // in app/layout.tsx and the Sitemap line in public/robots.txt.
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

  // /saved and /history are deliberately absent — both set robots noindex
  // because their content lives in the visitor's own browser.
  // /search is also intentionally excluded: it is a client component with no
  // meaningful static content at the bare URL.
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
