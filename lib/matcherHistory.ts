'use client';

/**
 * matcherHistory.ts
 * Local-only history of completed Career Matcher runs.
 *
 * Two layers, deliberately:
 *  1. A localStorage-backed store mirroring lib/savedCareers.ts exactly
 *     (referentially-stable snapshots, cross-tab `storage` sync).
 *  2. An async `HistoryStore` interface that today's local implementation
 *     satisfies, so a future server-backed implementation can swap in without
 *     any component changing. The async-ness is the seam — do not "simplify"
 *     it back to sync calls.
 *
 * Storage strategy: persist run INPUTS, not the result payload. matchCareers()
 * is pure, so "View Report" recomputes the full result set on demand — the same
 * store-ids-hydrate-at-render approach savedCareers.ts uses.
 */

import { useSyncExternalStore } from 'react';
import { generateReferenceCode } from '@/lib/referenceCode';

export const MATCHER_HISTORY_KEY = 'tafuta_matcher_history';

/** Newest-first cap; the write path slices to this, evicting the oldest. */
export const MAX_HISTORY_ENTRIES = 20;

/** One completed Career Matcher run, as persisted to localStorage. */
export interface MatcherHistoryEntry {
  /** Stable identity for React keys and removal. */
  id: string;
  /** Short, student-facing label from lib/referenceCode.ts. Cosmetic only. */
  referenceCode: string;
  /** Date.now() at the moment step 2 -> step 3 completed. */
  timestamp: number;
  /** The pathway selected in step 1 ('A' | 'B' | 'C'). */
  pathway: string;
  /** The subjects selected in step 2, in selection order. */
  selectedSubjects: string[];
  /** Snapshot of results.length at run time. */
  resultCount: number;
}

/** Stable empty array — a new [] each render would loop useSyncExternalStore. */
const EMPTY: MatcherHistoryEntry[] = [];

const listeners = new Set<() => void>();

// getSnapshot must be referentially stable between unchanged reads, so the
// parsed array is memoised against the raw string it came from.
let cachedRaw: string | null = null;
let cachedEntries: MatcherHistoryEntry[] = EMPTY;

function isEntry(value: unknown): value is MatcherHistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === 'string' &&
    typeof e.referenceCode === 'string' &&
    typeof e.timestamp === 'number' &&
    typeof e.pathway === 'string' &&
    Array.isArray(e.selectedSubjects) &&
    e.selectedSubjects.every(s => typeof s === 'string') &&
    typeof e.resultCount === 'number'
  );
}

function parseEntries(raw: string | null): MatcherHistoryEntry[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isEntry);
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): MatcherHistoryEntry[] {
  if (typeof window === 'undefined') return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(MATCHER_HISTORY_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = parseEntries(raw);
  }
  return cachedEntries;
}

function getServerSnapshot(): MatcherHistoryEntry[] {
  return EMPTY;
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // Same-tab writes emit manually below; `storage` covers other tabs.
  window.addEventListener('storage', onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function readMatcherHistory(): MatcherHistoryEntry[] {
  return getSnapshot();
}

function writeMatcherHistory(entries: MatcherHistoryEntry[]): MatcherHistoryEntry[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MATCHER_HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // Quota exceeded or storage blocked — a logging failure must never
      // surface to the matcher UI or block step 3 from rendering.
    }
  }
  emit();
  return entries;
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * The persistence seam. Deliberately async even though the only implementation
 * today is synchronous localStorage, so an API-backed store can replace it
 * without touching a single component.
 */
export interface HistoryStore {
  list(): Promise<MatcherHistoryEntry[]>;
  add(run: { pathway: string; selectedSubjects: string[]; resultCount: number }): Promise<MatcherHistoryEntry>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

class LocalHistoryStore implements HistoryStore {
  async list(): Promise<MatcherHistoryEntry[]> {
    return readMatcherHistory();
  }

  async add(run: {
    pathway: string;
    selectedSubjects: string[];
    resultCount: number;
  }): Promise<MatcherHistoryEntry> {
    const entry: MatcherHistoryEntry = {
      id: makeId(),
      // Shared with MatcherBlueprint, so a history row and the blueprint shown
      // at the time of that run always display the same code.
      referenceCode: generateReferenceCode(run.pathway, run.selectedSubjects),
      timestamp: Date.now(),
      ...run,
    };
    writeMatcherHistory([entry, ...readMatcherHistory()].slice(0, MAX_HISTORY_ENTRIES));
    return entry;
  }

  async remove(id: string): Promise<void> {
    writeMatcherHistory(readMatcherHistory().filter(e => e.id !== id));
  }

  async clear(): Promise<void> {
    writeMatcherHistory([]);
  }
}

/**
 * The module's single active store instance. Swapping to a server-backed
 * implementation later is a one-line change here — nothing else in the
 * codebase imports LocalHistoryStore directly.
 */
export const historyStore: HistoryStore = new LocalHistoryStore();

/**
 * React reactivity, kept separate from the store interface. Returns empty and
 * hydrated:false on the server and the first client render, mirroring
 * useSavedCareerIds(). A future API-backed hook would return this same shape.
 */
export function useMatcherHistory(): { entries: MatcherHistoryEntry[]; hydrated: boolean } {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return { entries, hydrated };
}
