/**
 * GET /api/mpesa/token
 * Fetches a Safaricom Daraja OAuth2 access token using client credentials.
 * Token is cached in-memory for (expires_in - 50) seconds to avoid
 * redundant API calls on every STK push or query request.
 */

import { NextResponse } from 'next/server';

/** In-memory token cache — valid for the lifetime of this serverless instance */
let cachedToken: string | null = null;
let tokenExpiry = 0;

/** Returns a valid Daraja access token, using the cache when possible. */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;

  if (!key || !secret) throw new Error('M-Pesa credentials not configured');

  const credentials = Buffer.from(`${key}:${secret}`).toString('base64');

  const res = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${credentials}` }, cache: 'no-store' }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Daraja token request failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: string };
  cachedToken = data.access_token;
  // Cache with a 50-second safety buffer before actual expiry
  tokenExpiry = Date.now() + (parseInt(data.expires_in, 10) - 50) * 1000;

  return cachedToken;
}

export async function GET() {
  try {
    const access_token = await getAccessToken();
    return NextResponse.json({ access_token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[M-Pesa Token]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Exported for internal reuse by other M-Pesa routes */
export { getAccessToken };
