'use client';

/**
 * ProCareerSections
 * Client component rendered at the bottom of each career detail page.
 * Displays PRO-gated content (Universities guide + Career Roadmap) either
 * as full content (PRO users) or as blurred locked previews (free users).
 * Also handles the "Save Career" bookmark button.
 */

import { useState } from 'react';
import { Lock, GraduationCap, Map, Bookmark, BookmarkCheck, ChevronRight, ExternalLink } from 'lucide-react';
import { useProStatus } from '@/context/ProContext';
import ProUpgradeModal from '@/components/ProUpgradeModal';
import { getUniversitiesForCareer, getCareerRoadmap } from '@/lib/universityData';
import type { Career } from '@/lib/career-data';

interface ProCareerSectionsProps {
  career: Career;
}

/** Pill shown over a blurred locked section */
function LockedOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl z-10"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}>
      <Lock className="w-8 h-8 mb-3" style={{ color: '#F59E0B' }} />
      <p className="font-bold text-slate-800 mb-1">TAFUTA PRO Feature</p>
      <p className="text-sm text-slate-500 mb-4 text-center max-w-xs px-4">
        Upgrade to unlock this section and all premium features
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-opacity"
        style={{ background: '#006600' }}
      >
        Unlock with PRO <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Universities full content (PRO) */
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

/** Career roadmap full content (PRO) */
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

export default function ProCareerSections({ career }: ProCareerSectionsProps) {
  const { isPro } = useProStatus();
  const [modalFeature, setModalFeature] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function openModal(feature: string) {
    setModalFeature(feature);
  }

  function handleSave() {
    if (!isPro) {
      openModal('Save & Compare Careers');
      return;
    }
    // PRO: toggle saved state + persist to localStorage
    const key = 'tafuta_saved_careers';
    try {
      const existing: number[] = JSON.parse(localStorage.getItem(key) ?? '[]');
      const updated = saved
        ? existing.filter((id) => id !== career.id)
        : [...new Set([...existing, career.id])];
      localStorage.setItem(key, JSON.stringify(updated));
      setSaved(!saved);
    } catch {
      setSaved(!saved);
    }
  }

  return (
    <>
      {/* Save button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
            saved
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          {saved ? 'Saved' : 'Save Career'}
          {!isPro && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold ml-1"
              style={{ background: '#F59E0B' }}
            >
              PRO
            </span>
          )}
        </button>
      </div>

      {/* Universities section */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-6 h-6" style={{ color: '#006600' }} />
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Universities Offering This Career Path
          </h2>
          {!isPro && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-bold"
              style={{ background: '#F59E0B' }}
            >
              PRO
            </span>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden">
          {/* Blurred placeholder preview (shown to both, blurred for free) */}
          {!isPro && (
            <div className="filter blur-sm pointer-events-none select-none" aria-hidden>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex justify-between">
                    <div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-48 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-64" />
                    </div>
                    <div className="h-4 bg-green-200 dark:bg-green-900 rounded w-24" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {isPro && <UniversityList career={career} />}
          {!isPro && (
            <LockedOverlay
              onUnlock={() => openModal('the University Guide for this career')}
            />
          )}
        </div>
      </div>

      {/* Career Roadmap section */}
      <div className="mt-10 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Map className="w-6 h-6" style={{ color: '#006600' }} />
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Your Career Roadmap
          </h2>
          {!isPro && (
            <span
              className="text-xs px-2 py-0.5 rounded-full text-white font-bold"
              style={{ background: '#F59E0B' }}
            >
              PRO
            </span>
          )}
        </div>

        <div className="relative rounded-2xl overflow-hidden">
          {!isPro && (
            <div className="filter blur-sm pointer-events-none select-none" aria-hidden>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
                    <div className="pt-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-48 mb-2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-72" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isPro && <RoadmapTimeline career={career} />}
          {!isPro && (
            <LockedOverlay
              onUnlock={() => openModal('your personalised Career Roadmap')}
            />
          )}
        </div>
      </div>

      {/* PRO Upgrade Modal */}
      <ProUpgradeModal
        isOpen={!!modalFeature}
        onClose={() => setModalFeature(null)}
        triggerFeature={modalFeature ?? ''}
      />
    </>
  );
}
