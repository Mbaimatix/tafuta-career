'use client';

/**
 * MpesaPayment
 * Self-contained M-Pesa STK Push payment form.
 * On submit it calls /api/mpesa/stkpush, then polls /api/mpesa/query
 * every 5 seconds for up to 60 seconds for confirmation.
 * On confirmed success it activates PRO via ProContext and calls onSuccess().
 */

import { useState } from 'react';
import { Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProStatus } from '@/context/ProContext';

interface MpesaPaymentProps {
  plan: 'monthly' | 'annual';
  onSuccess: () => void;
  onCancel: () => void;
}

const PLAN_LABELS: Record<'monthly' | 'annual', string> = {
  monthly: 'Monthly — KSH 199/month',
  annual: 'Annual — KSH 999/year (save 58%)',
};

const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 12; // 12 × 5 s = 60 s

export default function MpesaPayment({ plan, onSuccess, onCancel }: MpesaPaymentProps) {
  const { activatePro } = useProStatus();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [stkSent, setStkSent] = useState(false);
  const [error, setError] = useState('');

  const amount = plan === 'monthly' ? 199 : 999;

  /**
   * Polls /api/mpesa/query until payment is confirmed, cancelled, or timed out.
   * Activates PRO and calls onSuccess on ResultCode 0.
   */
  function startPolling(checkoutRequestID: string, normalizedPhone: string) {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/mpesa/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestID }),
        });
        const data = (await res.json()) as { ResultCode?: number; ResultDesc?: string };

        if (data.ResultCode === 0) {
          // --- Success ---
          clearInterval(interval);
          activatePro(normalizedPhone, plan);
          setLoading(false);
          onSuccess();
          return;
        }

        if (data.ResultCode !== undefined && data.ResultCode !== 0 && data.ResultCode !== 1) {
          // Non-zero means explicitly cancelled or failed
          clearInterval(interval);
          setError('Malipo yalikataliwa. Jaribu tena. / Payment was declined. Please try again.');
          setLoading(false);
          setStkSent(false);
          return;
        }
      } catch {
        // Network hiccup — keep polling
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        setError(
          'Malipo hayakuthibitishwa kwa wakati. Jaribu tena. / Payment confirmation timed out. Please try again.'
        );
        setLoading(false);
        setStkSent(false);
      }
    }, POLL_INTERVAL_MS);
  }

  /** Validates the phone and triggers the STK Push. */
  async function handlePay() {
    const digits = phone.replace(/\D/g, '');
    let normalized = '';

    if (/^2547\d{8}$/.test(digits)) normalized = digits;
    else if (/^07\d{8}$/.test(digits)) normalized = '254' + digits.slice(1);
    else if (/^7\d{8}$/.test(digits)) normalized = '254' + digits;
    else {
      setError('Nambari si sahihi. / Please enter a valid Safaricom number (e.g. 0712 345 678)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized, plan }),
      });
      const data = (await res.json()) as {
        CheckoutRequestID?: string;
        error?: string;
      };

      if (!res.ok || !data.CheckoutRequestID) {
        throw new Error(data.error ?? 'STK Push failed. Check your phone number and try again.');
      }

      setStkSent(true);
      startPolling(data.CheckoutRequestID, normalized);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Hitilafu imetokea. Jaribu tena. / An error occurred. Please try again.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Plan summary */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
        <p className="text-sm font-bold text-green-800 dark:text-green-300">{PLAN_LABELS[plan]}</p>
        <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
          You will receive an M-Pesa prompt on your phone. Enter your PIN to complete.
        </p>
      </div>

      {!stkSent ? (
        <>
          {/* Phone input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handlePay()}
                placeholder="07XX XXX XXX"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-60"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Pay button */}
          <button
            type="button"
            onClick={handlePay}
            disabled={loading || !phone.trim()}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50 hover:opacity-90"
            style={{ background: '#006600' }}
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Pay KSH {amount} with M-Pesa
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Maybe later
          </button>
        </>
      ) : (
        /* Waiting for PIN entry */
        <div className="text-center py-6 space-y-4">
          {loading ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                  STK Push sent!
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Check your phone and enter your M-Pesa PIN to complete your TAFUTA PRO subscription.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                  Waiting for payment confirmation…
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                Payment confirmed! Welcome to TAFUTA PRO 🎉
              </p>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-left">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
