/**
 * POST /api/mpesa/callback
 * Receives STK Push callback from Safaricom servers.
 * On success (ResultCode 0) it stores the payment result in Vercel KV so
 * that /api/mpesa/query can confirm payment to the frontend across serverless
 * instances. Falls back to in-memory if KV is not configured.
 */

import { NextResponse } from 'next/server';

interface CallbackMetadataItem {
  Name: string;
  Value: string | number;
}

interface StkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: { Item: CallbackMetadataItem[] };
}

interface PaymentResult {
  success: boolean;
  receipt?: string;
  amount?: number;
  phone?: string;
  transactionDate?: string;
}

/** Fallback in-memory store (single instance / local dev only) */
export const paymentResults = new Map<string, PaymentResult>();

async function storeResult(checkoutRequestID: string, result: PaymentResult) {
  // Try Vercel KV first (persists across serverless instances)
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(`mpesa:${checkoutRequestID}`, JSON.stringify(result), { ex: 3600 });
    return;
  } catch {
    // KV not configured — fall back to in-memory (works for local dev / single instance)
  }
  paymentResults.set(checkoutRequestID, result);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { Body?: { stkCallback?: StkCallback } };
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      // Safaricom sometimes sends empty pings — always acknowledge
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    if (ResultCode === 0) {
      // --- Successful payment ---
      const items = CallbackMetadata?.Item ?? [];
      const get = (name: string) => items.find((i) => i.Name === name)?.Value;

      const receipt = get('MpesaReceiptNumber') as string | undefined;
      const amount = get('Amount') as number | undefined;
      const phone = get('PhoneNumber') as number | undefined;
      const txDate = get('TransactionDate') as number | undefined;

      console.log('[M-Pesa Callback] Payment confirmed:', {
        CheckoutRequestID,
        receipt,
        amount,
        phone,
        txDate,
      });

      await storeResult(CheckoutRequestID, {
        success: true,
        receipt,
        amount,
        phone: String(phone ?? ''),
        transactionDate: String(txDate ?? ''),
      });
    } else {
      console.log('[M-Pesa Callback] Payment failed/cancelled:', {
        CheckoutRequestID,
        ResultCode,
        ResultDesc: callback.ResultDesc,
      });
      await storeResult(CheckoutRequestID, { success: false });
    }

    // Safaricom requires a 200 with this exact shape
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('[M-Pesa Callback] Error:', err);
    // Always return 200 to Safaricom — re-delivery is not useful here
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
