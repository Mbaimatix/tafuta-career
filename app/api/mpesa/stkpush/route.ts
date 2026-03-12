/**
 * POST /api/mpesa/stkpush
 * Initiates a Safaricom STK Push (Lipa Na M-Pesa) to the customer's phone.
 *
 * Body: { phone: string, plan: "monthly" | "annual" }
 * - phone: Kenyan mobile number in any format (07XX, 7XX, 2547XX)
 * - plan:  subscription plan — amount is enforced server-side (never trusted from client)
 *
 * Returns the full Daraja response including CheckoutRequestID.
 *
 * CREDENTIAL NOTES:
 * - Sandbox credentials from developer.safaricom.co.ke expire periodically and must
 *   be regenerated in the Daraja portal if you see 401/403 errors from Safaricom.
 * - When going live, set MPESA_ENV=production in Vercel environment variables and
 *   replace MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, and
 *   MPESA_PASSKEY with your production Daraja app credentials.
 * - Never use sandbox credentials against MPESA_ENV=production or vice versa.
 */

import { NextResponse } from 'next/server';

const MPESA_BASE =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// ── Startup diagnostic log ────────────────────────────────────────────────────
// Visible in Vercel Function logs; confirms env vars are present without
// leaking their values. If any show "MISSING", add them in Vercel dashboard.
console.log('[M-Pesa Config] MPESA_ENV          :', process.env.MPESA_ENV ?? 'NOT SET (defaulting to sandbox)');
console.log('[M-Pesa Config] MPESA_CONSUMER_KEY  :', process.env.MPESA_CONSUMER_KEY  ? 'present' : 'MISSING ⚠️');
console.log('[M-Pesa Config] MPESA_CONSUMER_SECRET:', process.env.MPESA_CONSUMER_SECRET ? 'present' : 'MISSING ⚠️');
console.log('[M-Pesa Config] MPESA_SHORTCODE     :', process.env.MPESA_SHORTCODE      ? 'present' : 'MISSING ⚠️');
console.log('[M-Pesa Config] MPESA_PASSKEY       :', process.env.MPESA_PASSKEY        ? 'present' : 'MISSING ⚠️');
console.log('[M-Pesa Config] MPESA_CALLBACK_URL  :', process.env.MPESA_CALLBACK_URL   ? 'present' : 'MISSING ⚠️');
console.log('[M-Pesa Config] Base URL            :', MPESA_BASE);
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a Daraja-compatible timestamp: YYYYMMDDHHmmss */
function generateTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

/** Normalise any Kenyan phone format to 2547XXXXXXXX */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (/^2547\d{8}$/.test(digits)) return digits;
  if (/^07\d{8}$/.test(digits)) return '254' + digits.slice(1);
  if (/^7\d{8}$/.test(digits)) return '254' + digits;
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; plan?: string };
    const { phone: rawPhone, plan } = body;

    // --- Input validation ---
    if (!rawPhone || !plan) {
      return NextResponse.json({ error: 'Missing phone or plan' }, { status: 400 });
    }
    if (plan !== 'monthly' && plan !== 'annual') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // --- Server-side amount enforcement — never trust the client ---
    const amount = plan === 'annual' ? 999 : 199;

    // --- Fetch Daraja access token ---
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!key || !secret || !shortcode || !passkey || !callbackUrl) {
      throw new Error('M-Pesa environment variables not fully configured');
    }

    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
    const tokenRes = await fetch(
      `${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' }
    );
    if (!tokenRes.ok) {
      const rawBody = await tokenRes.text();
      console.error('[M-Pesa Auth Error] Status :', tokenRes.status, tokenRes.statusText);
      console.error('[M-Pesa Auth Error] Body   :', rawBody);
      console.error('[M-Pesa Auth Error] Endpoint:', `${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`);
      console.error('[M-Pesa Auth Error] Hint   : 401 = wrong/expired credentials | 403 = app not whitelisted | check MPESA_ENV matches credential type (sandbox vs production)');
      throw new Error(`Failed to obtain M-Pesa access token — HTTP ${tokenRes.status}: ${rawBody}`);
    }
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    // --- Build STK Push payload ---
    const timestamp = generateTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: 'TafutaCareerPRO',
      TransactionDesc: 'Tafuta Career PRO Subscription',
    };

    const stkRes = await fetch(
      `${MPESA_BASE}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData?.ResponseCode !== '0') {
      throw new Error(stkData?.errorMessage ?? stkData?.ResponseDescription ?? 'STK Push failed');
    }

    return NextResponse.json(stkData);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[M-Pesa STK Push]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
