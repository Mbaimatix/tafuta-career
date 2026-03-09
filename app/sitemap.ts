import { MetadataRoute } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tafuta-career.vercel.app';

  const careerUrls = careers.map(c => ({
    url: `${baseUrl}/career/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const pathwayUrls = pathways.map(p => ({
    url: `${baseUrl}/pathway/${p.code}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const subTrackUrls = subTracks.map(st => ({
    url: `${baseUrl}/pathway/${st.pathwayCode}/${st.code}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/matcher`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    ...pathwayUrls,
    ...subTrackUrls,
    ...careerUrls,
  ];
}
