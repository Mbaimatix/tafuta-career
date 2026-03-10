import { NextResponse } from 'next/server';
import { careers } from '@/lib/career-data';
import { apiLimiter, getIP } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const { allowed, retryAfter } = apiLimiter(getIP(request));
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const random = careers[Math.floor(Math.random() * careers.length)];
  return NextResponse.json(random);
}
