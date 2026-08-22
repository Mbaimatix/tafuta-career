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
