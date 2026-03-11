'use client';

/**
 * ProContext — manages TAFUTA PRO subscription status across the app.
 * Status is persisted in localStorage so it survives page refreshes.
 * The actual payment verification happens server-side via M-Pesa callbacks.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/** Shape stored in localStorage under STORAGE_KEY */
interface StoredProData {
  isPro: boolean;
  expiry: number;       // Unix ms timestamp
  phone: string;        // masked, e.g. "0712***78"
  plan: 'monthly' | 'annual';
}

export interface ProStatusData {
  isPro: boolean;
  expiry: number | null;
  phone: string | null;
  plan: 'monthly' | 'annual' | null;
}

interface ProContextValue {
  isPro: boolean;
  proExpiry: number | null;
  /** Activate PRO after a successful M-Pesa payment. */
  activatePro: (phone: string, plan: 'monthly' | 'annual', checkoutRequestID?: string) => void;
  /** Read and validate the current PRO status from localStorage. */
  checkProStatus: () => ProStatusData;
}

const STORAGE_KEY = 'tafuta_pro_status';

const ProContext = createContext<ProContextValue>({
  isPro: false,
  proExpiry: null,
  activatePro: () => {},
  checkProStatus: () => ({ isPro: false, expiry: null, phone: null, plan: null }),
});

/** Reads localStorage, validates expiry, and returns the current PRO status. */
function readStoredStatus(): ProStatusData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isPro: false, expiry: null, phone: null, plan: null };
    const data = JSON.parse(raw) as StoredProData;
    if (!data.isPro || Date.now() > data.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return { isPro: false, expiry: null, phone: null, plan: null };
    }
    return { isPro: true, expiry: data.expiry, phone: data.phone, plan: data.plan };
  } catch {
    return { isPro: false, expiry: null, phone: null, plan: null };
  }
}

export function ProContextProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [proExpiry, setProExpiry] = useState<number | null>(null);

  const checkProStatus = useCallback((): ProStatusData => readStoredStatus(), []);

  // Hydrate from localStorage on first mount (client-only)
  useEffect(() => {
    const status = readStoredStatus();
    setIsPro(status.isPro);
    setProExpiry(status.expiry);
  }, []);

  /**
   * Called after a confirmed M-Pesa payment.
   * Sets localStorage and updates context state immediately,
   * then fires a best-effort server-side record via /api/pro/activate.
   */
  const activatePro = useCallback((phone: string, plan: 'monthly' | 'annual', checkoutRequestID?: string) => {
    const daysToAdd = plan === 'annual' ? 365 : 30;
    const expiry = Date.now() + daysToAdd * 24 * 60 * 60 * 1000;

    // Mask phone: keep first 4 digits + last 2 digits visible
    const digits = phone.replace(/\D/g, '');
    const masked =
      digits.length > 6
        ? digits.slice(0, 4) + '***' + digits.slice(-2)
        : phone;

    const data: StoredProData = { isPro: true, expiry, phone: masked, plan };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setIsPro(true);
    setProExpiry(expiry);

    // Best-effort server-side record — never blocks or throws to the caller
    if (checkoutRequestID) {
      fetch('/api/pro/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, plan, checkoutRequestID }),
      }).catch(() => {
        // Silently ignore — localStorage is the source of truth
      });
    }
  }, []);

  return (
    <ProContext.Provider value={{ isPro, proExpiry, activatePro, checkProStatus }}>
      {children}
    </ProContext.Provider>
  );
}

/** Custom hook — use this anywhere in the app to read PRO status. */
export function useProStatus(): ProContextValue {
  return useContext(ProContext);
}
