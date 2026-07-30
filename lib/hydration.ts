'use client';

import { useSyncExternalStore } from 'react';

/** Never emits — the snapshot difference alone drives the single re-render. */
const NEVER_CHANGES = () => () => {};

/**
 * Returns false during SSR and the hydrating render, then true once React has
 * committed on the client. Use it to defer browser-only UI (localStorage reads,
 * theme icons) without a hydration mismatch and without setState-in-effect.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false
  );
}
