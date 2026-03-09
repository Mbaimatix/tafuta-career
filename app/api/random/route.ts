import { NextResponse } from 'next/server';
import { careers } from '@/lib/career-data';

export async function GET() {
  const random = careers[Math.floor(Math.random() * careers.length)];
  return NextResponse.json(random);
}
