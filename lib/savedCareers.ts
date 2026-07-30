'use client';

/**
 * savedCareers.ts
 * The "Save Career" bookmark store, backed by localStorage.
 *
 * Exposed as an external store (`useSavedCareerIds`) so the career detail page
 * and the /saved compare page stay in sync with each other — and across
 * browser tabs — without either of them owning the state.
 *
 * Every read is SSR-safe: it returns an empty list when `window` is missing,
 * and quota/parse errors are swallowed rather than thrown at the UI.
 */

import { useSyncExternalStore } from 'react';

export const SAVED_CAREERS_KEY = 'tafuta_saved_careers';

/** Max careers the comparison table renders side-by-side at once. */
export const MAX_COMPARE = 4;

/** Stable empty array — a new [] each render would loop useSyncExternalStore. */
const EMPTY: number[] = [];

const listeners = new Set<() => void>();

// getSnapshot must be referentially stable between unchanged reads, so the
// parsed array is memoised against the raw string it came from.
let cachedRaw: string | null = null;
let cachedIds: number[] = EMPTY;

function parseIds(raw: string | null): number[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (id): id is number => typeof id === 'number' && Number.isFinite(id)
    );
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): number[] {
  if (typeof window === 'undefined') return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVED_CAREERS_KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedIds = parseIds(raw);
  }
  return cachedIds;
}

function getServerSnapshot(): number[] {
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

/** Reads the saved career IDs imperatively (outside React). */
export function readSavedCareerIds(): number[] {
  return getSnapshot();
}

function writeSavedCareerIds(ids: number[]): number[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_CAREERS_KEY, JSON.stringify(ids));
    } catch {
      // Storage full or blocked — callers still get the intended list
    }
  }
  emit();
  return ids;
}

export function isCareerSaved(id: number): boolean {
  return getSnapshot().includes(id);
}

/** Adds or removes a career. Returns the resulting list. */
export function toggleSavedCareer(id: number): number[] {
  const existing = getSnapshot();
  return writeSavedCareerIds(
    existing.includes(id)
      ? existing.filter(saved => saved !== id)
      : [...existing, id]
  );
}

/** Removes a career. Returns the resulting list. */
export function removeSavedCareer(id: number): number[] {
  return writeSavedCareerIds(getSnapshot().filter(saved => saved !== id));
}

/** Clears every saved career. */
export function clearSavedCareers(): number[] {
  return writeSavedCareerIds([]);
}

/**
 * Subscribes a component to the saved-career list.
 * Returns [] on the server and during hydration, then the real list.
 */
export function useSavedCareerIds(): number[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
