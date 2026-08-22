'use client';

/**
 * Hero
 * The homepage hero, extracted from app/page.tsx so it can own a small
 * student/parent audience toggle. The toggle swaps copy only — headline,
 * subhead and CTA labels. It never changes routing, gates content, or
 * influences which careers are shown.
 *
 * No accounts and no server involvement: the choice lives in localStorage
 * for this browser only.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Career } from '@/lib/career-data';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { useIsHydrated } from '@/lib/hydration';

type Audience = 'student' | 'parent';
const AUDIENCE_KEY = 'tafuta_hero_audience';

function readStoredAudience(): Audience {
  if (typeof window === 'undefined') return 'student';
  try {
    const raw = localStorage.getItem(AUDIENCE_KEY);
    return raw === 'parent' ? 'parent' : 'student';
  } catch {
    return 'student';
  }
}

function writeStoredAudience(value: Audience) {
  try {
    localStorage.setItem(AUDIENCE_KEY, value);
  } catch {
    // Storage full or blocked — toggle still works this render, just isn't remembered.
  }
}

const COPY: Record<
  Audience,
  { headline: React.ReactNode; subhead: string; primaryCta: string; secondaryCta: string }
> = {
  student: {
    headline: (
      <>
        Discover Your Future <span style={{ color: '#F59E0B' }}>Career Path</span>
      </>
    ),
    subhead:
      'The most comprehensive CBC career guidance platform for Kenyan students. Match your subjects to 1,252 careers across all three pathways.',
    primaryCta: 'Start Career Matching',
    secondaryCta: 'Explore by Subject',
  },
  parent: {
    headline: (
      <>
        Help Your Child Choose the Right <span style={{ color: '#F59E0B' }}>Career Path</span>
      </>
    ),
    subhead:
      "A clear, CBC-aligned guide to Kenya's career pathways — see which subjects lead to which careers, so you can support your child's choices with confidence.",
    primaryCta: 'See Career Matches',
    secondaryCta: 'Explore Pathways by Subject',
  },
};

export default function Hero({ careers }: { careers: Career[] }) {
  const hydrated = useIsHydrated();
  const [override, setOverride] = useState<Audience | null>(null);

  // Server render and the hydrating render are pinned to 'student', so the SSR
  // HTML and first paint match. Reading localStorage at render time (not in an
  // effect) is deliberate — see lib/hydration.ts. Do not convert this to a
  // useEffect sync; that reintroduces an extra-render flash.
  const effectiveAudience: Audience = override ?? (hydrated ? readStoredAudience() : 'student');

  function selectAudience(next: Audience) {
    setOverride(next);
    writeStoredAudience(next);
  }

  const copy = COPY[effectiveAudience];

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
        {/* Flag stripe accent */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 rounded-full overflow-hidden h-2 w-48">
            <div className="flex-1 bg-black" />
            <div className="flex-1" style={{ background: '#BB0000' }} />
            <div className="flex-1 bg-white" />
            <div className="flex-1" style={{ background: '#006600' }} />
          </div>
        </div>

        {/* Audience toggle */}
        <div className="flex justify-center mb-6">
          <div
            role="group"
            aria-label="View this page as"
            className="inline-flex rounded-full bg-white/10 border border-white/25 p-1 backdrop-blur-sm"
          >
            <button
              type="button"
              aria-pressed={effectiveAudience === 'student'}
              onClick={() => selectAudience('student')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                effectiveAudience === 'student'
                  ? 'bg-white text-slate-900'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              I&apos;m a Student
            </button>
            <button
              type="button"
              aria-pressed={effectiveAudience === 'parent'}
              onClick={() => selectAudience('parent')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                effectiveAudience === 'parent'
                  ? 'bg-white text-slate-900'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              I&apos;m a Parent
            </button>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight animate-fade-in">
          {copy.headline}
        </h1>

        <p className="text-xl text-white/80 mb-1 italic font-medium">
          Gundua Njia Yako ya Kazi
        </p>
        <p className="text-sm text-white/60 mb-8 italic">
          (Discover Your Career Path)
        </p>
        <p className="text-base text-white/70 mb-8 max-w-2xl mx-auto">
          {copy.subhead}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/matcher"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-2xl transition-transform hover:scale-105"
            style={{ background: '#006600' }}
          >
            {copy.primaryCta} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/subjects"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white/20 text-white text-lg border-2 border-white/40 hover:bg-white/30 transition-colors"
          >
            {copy.secondaryCta}
          </Link>
        </div>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchAutocomplete
            careers={careers}
            placeholder="Search 1,252 careers — e.g. Doctor, Software Engineer, Teacher..."
          />
        </div>
      </div>
    </section>
  );
}
