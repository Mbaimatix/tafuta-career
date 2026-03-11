/**
 * POST /api/pro/activate
 * Records a confirmed PRO activation server-side in Vercel KV so that
 * PRO status can be recovered if the user clears localStorage.
 *
 * Body: { phone: string, plan: "monthly" | "annual", checkoutRequestID: string }
 * Returns: { ok: true } on success, or an error.
 *
 * The key is a SHA-256 hash of the normalised phone number so no PII is
 * stored in plain text. TTL matches the subscription duration.
 */

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

interface ActivateBody {
  phone?: string;
  plan?: 'monthly' | 'annual';
  checkoutRequestID?: string;
}

interface ProRecord {
  plan: 'monthly' | 'annual';
  activatedAt: number;
  expiry: number;
  checkoutRequestID: string;
}

function phoneHash(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return createHash('sha256').update(digits).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActivateBody;
    const { phone, plan, checkoutRequestID } = body;

    if (!phone || !plan || !checkoutRequestID) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (plan !== 'monthly' && plan !== 'annual') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const daysToAdd = plan === 'annual' ? 365 : 30;
    const now = Date.now();
    const expiry = now + daysToAdd * 24 * 60 * 60 * 1000;
    const ttlSeconds = daysToAdd * 24 * 60 * 60;

    const record: ProRecord = { plan, activatedAt: now, expiry, checkoutRequestID };
    const key = `pro:${phoneHash(phone)}`;

    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(key, JSON.stringify(record), { ex: ttlSeconds });
    } catch {
      // KV not configured — gracefully skip server-side persistence
      // localStorage remains the source of truth in this case
      console.warn('[PRO Activate] Vercel KV not configured — skipping server-side record');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[PRO Activate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
