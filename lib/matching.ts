import type { Career } from './career-data';

export interface MatchResult {
  career: Career;
  matchCount: number;
  totalRequired: number;
  matchPercentage: number;
  matchedSubjects: string[];
  missingSubjects: string[];
}

export function matchCareers(
  selectedSubjects: string[],
  careersToSearch: Career[],
  pathwayFilter?: string,
  minPercentage: number = 50
): MatchResult[] {
  if (selectedSubjects.length === 0) return [];

  const normalizedSelected = selectedSubjects.map(s => s.toLowerCase().trim());

  const results: MatchResult[] = [];

  for (const career of careersToSearch) {
    if (pathwayFilter && career.pathwayCode !== pathwayFilter) continue;

    const matched = career.subjects.filter(s =>
      normalizedSelected.includes(s.toLowerCase().trim())
    );
    const missing = career.subjects.filter(s =>
      !normalizedSelected.includes(s.toLowerCase().trim())
    );

    const matchCount = matched.length;
    const totalRequired = career.subjects.length;
    const matchPercentage = totalRequired > 0
      ? Math.round((matchCount / totalRequired) * 100)
      : 0;

    if (matchPercentage >= minPercentage) {
      results.push({
        career,
        matchCount,
        totalRequired,
        matchPercentage,
        matchedSubjects: matched,
        missingSubjects: missing,
      });
    }
  }

  return results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
    return b.matchCount - a.matchCount;
  });
}

export function getRelatedCareers(career: Career, allCareers: Career[], limit: number = 6): Career[] {
  const careerSubjects = new Set(career.subjects.map(s => s.toLowerCase()));

  const scored = allCareers
    .filter(c => c.id !== career.id)
    .map(c => {
      const overlap = c.subjects.filter(s => careerSubjects.has(s.toLowerCase())).length;
      return { career: c, overlap };
    })
    .filter(x => x.overlap >= 2)
    .sort((a, b) => b.overlap - a.overlap);

  return scored.slice(0, limit).map(x => x.career);
}
