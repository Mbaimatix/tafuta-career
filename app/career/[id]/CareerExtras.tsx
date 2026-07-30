'use client';

/**
 * CareerExtras
 * Client component rendered at the bottom of each career detail page.
 * Shows the University guide and the Career Roadmap, and handles the
 * "Save Career" bookmark that feeds the /saved comparison page.
 */

import Link from 'next/link';
import { GraduationCap, Map, Bookmark, BookmarkCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { getUniversitiesForCareer, getCareerRoadmap } from '@/lib/universityData';
import { toggleSavedCareer, useSavedCareerIds } from '@/lib/savedCareers';
import type { Career } from '@/lib/career-data';

interface CareerExtrasProps {
  career: Career;
}

/** Kenyan university programmes relevant to this career */
function UniversityList({ career }: { career: Career }) {
  const universities = getUniversitiesForCareer(career);
  return (
    <div className="space-y-3">
      {universities.map((uni) => (
        <div
          key={uni.university}
          className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-start justify-between gap-4"
        >
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{uni.university}</p>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">{uni.program}</p>
            {uni.cutoffPoints && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Cut-off: {uni.cutoffPoints}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-green-700 dark:text-green-400">
              ~KSH {uni.annualFeeKsh}
            </p>
            <p className="text-xs text-slate-400">per year</p>
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        Fees are approximate. Verify with KUCCPS and individual institutions.
      </p>
    </div>
  );
}

/** CBC-to-employment timeline for this career */
function RoadmapTimeline({ career }: { career: Career }) {
  const steps = getCareerRoadmap(career);
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.stage} className="flex items-start gap-4 relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 z-10 shadow-md"
              style={{ background: step.color }}
            >
              {step.stage}
            </div>
            <div className="pt-1.5 min-w-0">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{step.title}</p>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5 leading-relaxed">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CareerExtras({ career }: CareerExtrasProps) {
  // Derived from the shared bookmark store — stays in sync with /saved
  const saved = useSavedCareerIds().includes(career.id);

  function handleSave() {
    toggleSavedCareer(career.id);
  }

  return (
    <>
      {/* Save button */}
      <div className="mt-4 flex items-center gap-3 flex-wrap no-print">
        <button
          type="button"
          onClick={handleSave}
          aria-pressed={saved}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
            saved
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          {saved ? 'Saved' : 'Save Career'}
        </button>

        {saved && (
          <Link
            href="/saved"
            className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
            style={{ color: '#006600' }}
          >
            Compare saved careers <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Universities section */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-6 h-6" style={{ color: '#006600' }} />
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Universities Offering This Career Path
          </h2>
        </div>
        <UniversityList career={career} />
      </div>

      {/* Career Roadmap section */}
      <div className="mt-10 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Map className="w-6 h-6" style={{ color: '#006600' }} />
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Your Career Roadmap
          </h2>
        </div>
        <RoadmapTimeline career={career} />
      </div>
    </>
  );
}
