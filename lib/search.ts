import Fuse from 'fuse.js';
import type { Career } from './career-data';

export function createSearchIndex(careers: Career[]): Fuse<Career> {
  return new Fuse(careers, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'subjects', weight: 2 },
      { name: 'description', weight: 1 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
}

export function searchCareers(query: string, careers: Career[]): Career[] {
  if (!query.trim()) return careers;
  const fuse = createSearchIndex(careers);
  return fuse.search(query).map(r => r.item);
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>');
}
