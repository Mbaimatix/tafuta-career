import { NextResponse } from 'next/server';
import { careers } from '@/lib/career-data';
import { searchCareers } from '@/lib/search';
import { apiLimiter, getIP } from '@/lib/rateLimit';

export async function GET(request: Request) {
  const { allowed, retryAfter } = apiLimiter(getIP(request));
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const pathway = searchParams.get('pathway') || '';
  const limit = parseInt(searchParams.get('limit') || '20');

  let results = searchCareers(q, careers);
  if (pathway) results = results.filter(c => c.pathwayCode === pathway);

  return NextResponse.json(results.slice(0, limit));
}
