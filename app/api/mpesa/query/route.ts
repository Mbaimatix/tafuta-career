/**
 * POST /api/mpesa/query
 * Polls the status of a pending STK Push transaction.
 * First checks the in-memory callback store (set by /api/mpesa/callback),
 * then falls back to querying Daraja directly.
 *
 * Body: { checkoutRequestID: string }
 * Returns: { ResultCode: number, ResultDesc: string }
 *   ResultCode 0  → payment successful
 *   ResultCode 1  → still pending
 *   ResultCode >1 → failed / cancelled
 */

import { NextResponse } from 'next/server';
import { paymentResults } from '../callback/route';

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

export async function POST(request: Request) {
  try {
    const { checkoutRequestID } = (await request.json()) as {
      checkoutRequestID: string;
    };

    if (!checkoutRequestID) {
      return NextResponse.json({ error: 'Missing checkoutRequestID' }, { status: 400 });
    }

    // --- 1. Check in-memory callback store first (fastest path) ---
    const cached = paymentResults.get(checkoutRequestID);
    if (cached !== undefined) {
      if (cached.success) {
        return NextResponse.json({ ResultCode: 0, ResultDesc: 'The service request is processed successfully.' });
      } else {
        return NextResponse.json({ ResultCode: 1032, ResultDesc: 'Request cancelled by user' });
      }
    }

    // --- 2. Fall back to Daraja query API ---
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    if (!key || !secret || !shortcode || !passkey) {
      throw new Error('M-Pesa environment variables not configured');
    }

    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
    const tokenRes = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' }
    );
    if (!tokenRes.ok) throw new Error('Failed to get access token');
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const timestamp = generateTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const queryRes = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestID,
        }),
      }
    );

    const data = (await queryRes.json()) as { ResultCode?: string; ResultDesc?: string };

    return NextResponse.json({
      ResultCode: data.ResultCode !== undefined ? Number(data.ResultCode) : 1,
      ResultDesc: data.ResultDesc ?? 'Pending',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[M-Pesa Query]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
