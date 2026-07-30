'use client';

/**
 * SavedCareers
 * Reads the bookmarked career IDs from localStorage and lets the student
 * compare up to MAX_COMPARE of them side-by-side.
 *
 * Saving is unlimited; the comparison table is capped at MAX_COMPARE columns
 * so the rows stay readable on a phone.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bookmark,
  BookmarkX,
  Printer,
  Trash2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
} from 'lucide-react';
import type { Career } from '@/lib/career-data';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/SubjectTag';
import { getUniversitiesForCareer } from '@/lib/universityData';
import {
  MAX_COMPARE,
  clearSavedCareers,
  removeSavedCareer,
  useSavedCareerIds,
} from '@/lib/savedCareers';
import { useIsHydrated } from '@/lib/hydration';

interface SavedCareersProps {
  allCareers: Career[];
}

function pathwayVariant(code: string): 'green' | 'red' | 'purple' {
  if (code === 'A') return 'green';
  if (code === 'B') return 'red';
  return 'purple';
}

function pathwayLabel(code: string) {
  if (code === 'A') return 'STEM';
  if (code === 'B') return 'Arts & Sports';
  return 'Social Sciences';
}

function GrowthCell({ outlook }: { outlook: string }) {
  const Icon = outlook === 'High' ? TrendingUp : outlook === 'Low' ? TrendingDown : Minus;
  const color =
    outlook === 'High' ? 'growth-high' : outlook === 'Low' ? 'growth-low' : 'growth-medium';
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${color}`}>
      <Icon className="w-4 h-4" />
      {outlook}
    </span>
  );
}

/** One row of the comparison table */
function CompareRow({
  label,
  careers,
  render,
}: {
  label: string;
  careers: Career[];
  render: (career: Career) => React.ReactNode;
}) {
  return (
    <tr className="border-t border-slate-200 dark:border-slate-700 align-top">
      <th
        scope="row"
        className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 p-3 w-40 min-w-[10rem] bg-slate-50 dark:bg-slate-800/60 sticky left-0 z-10"
      >
        {label}
      </th>
      {careers.map(career => (
        <td
          key={career.id}
          className="p-3 text-sm text-slate-700 dark:text-slate-200 min-w-[15rem] align-top"
        >
          {render(career)}
        </td>
      ))}
    </tr>
  );
}

export default function SavedCareers({ allCareers }: SavedCareersProps) {
  const hydrated = useIsHydrated();
  const storedIds = useSavedCareerIds();

  /**
   * null means "no explicit choice yet" — the first MAX_COMPARE saved careers
   * are compared by default, and that default follows the saved list as it
   * changes until the student picks columns themselves.
   */
  const [selection, setSelection] = useState<number[] | null>(null);

  // O(1) id -> career lookup, built once
  const careerById = useMemo(
    () => new Map(allCareers.map(c => [c.id, c])),
    [allCareers]
  );

  // Drop IDs from stale/hand-edited storage that no longer exist in the dataset
  const savedIds = storedIds.filter(id => careerById.has(id));

  const compareIds = (selection ?? savedIds.slice(0, MAX_COMPARE)).filter(id =>
    savedIds.includes(id)
  );

  const savedCareers = savedIds
    .map(id => careerById.get(id))
    .filter((c): c is Career => c !== undefined);

  const compareCareers = compareIds
    .map(id => careerById.get(id))
    .filter((c): c is Career => c !== undefined);

  function toggleCompare(id: number) {
    setSelection(current => {
      const base = current ?? savedIds.slice(0, MAX_COMPARE);
      if (base.includes(id)) return base.filter(existing => existing !== id);
      if (base.length >= MAX_COMPARE) return base;
      return [...base, id];
    });
  }

  function handleRemove(id: number) {
    removeSavedCareer(id);
    // Keep an explicit selection consistent; the auto default re-derives itself
    setSelection(current =>
      current === null ? null : current.filter(existing => existing !== id)
    );
  }

  function handleClearAll() {
    clearSavedCareers();
    setSelection(null);
  }

  // Avoid a flash of the empty state before localStorage is read
  if (!hydrated) {
    return (
      <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
        Loading your saved careers…
      </div>
    );
  }

  if (savedCareers.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Bookmark className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
          No saved careers yet
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Tap <strong>Save Career</strong> on any career page and it will show up here, ready to
          compare side-by-side with up to {MAX_COMPARE - 1} others.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/matcher"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: '#006600' }}
          >
            <Target className="w-4 h-4" />
            Find your matches
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 rounded-xl font-semibold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Browse all careers
          </Link>
        </div>
      </div>
    );
  }

  const atCompareMax = compareIds.length >= MAX_COMPARE;

  return (
    <div>
      {/* Saved list + compare pickers */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Your saved careers ({savedCareers.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pick up to {MAX_COMPARE} to compare side-by-side.
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10 no-print">
        {savedCareers.map(career => {
          const selected = compareIds.includes(career.id);
          const disabled = !selected && atCompareMax;
          return (
            <div
              key={career.id}
              className={`rounded-xl border-2 p-3 bg-white dark:bg-slate-800 transition-colors ${
                selected
                  ? 'border-green-600 dark:border-green-500'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/career/${career.id}`}
                  className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:underline leading-tight line-clamp-2"
                >
                  {career.name}
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(career.id)}
                  className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label={`Remove ${career.name} from saved careers`}
                >
                  <BookmarkX className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Badge variant={pathwayVariant(career.pathwayCode)} size="sm">
                  {pathwayLabel(career.pathwayCode)}
                </Badge>
                <button
                  type="button"
                  onClick={() => toggleCompare(career.id)}
                  disabled={disabled}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    selected
                      ? 'text-white'
                      : disabled
                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  style={selected ? { background: '#006600' } : undefined}
                  title={disabled ? `Deselect one to compare a different career` : undefined}
                >
                  {selected && <Check className="w-3 h-3" />}
                  {selected ? 'Comparing' : 'Compare'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-side comparison */}
      {compareCareers.length === 0 ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8 border-t border-slate-200 dark:border-slate-700">
          Select at least one saved career above to build a comparison.
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-4">
            Side-by-side comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Comparison of {compareCareers.length} saved careers
              </caption>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="p-3 w-40 min-w-[10rem] bg-slate-50 dark:bg-slate-800/60 sticky left-0 z-10"
                  >
                    <span className="sr-only">Attribute</span>
                  </th>
                  {compareCareers.map(career => (
                    <th
                      key={career.id}
                      scope="col"
                      className="p-3 min-w-[15rem] align-top bg-slate-50 dark:bg-slate-800/60"
                    >
                      <Link
                        href={`/career/${career.id}`}
                        className="font-black text-slate-900 dark:text-slate-100 hover:underline leading-tight block"
                      >
                        {career.name}
                      </Link>
                      <span className="text-xs font-mono text-slate-400">#{career.number}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Pathway"
                  careers={compareCareers}
                  render={career => (
                    <Badge variant={pathwayVariant(career.pathwayCode)} size="sm">
                      {pathwayLabel(career.pathwayCode)}
                    </Badge>
                  )}
                />
                <CompareRow
                  label="Sub-track"
                  careers={compareCareers}
                  render={career => <span className="font-mono">{career.subTrackCode}</span>}
                />
                <CompareRow
                  label="Salary range"
                  careers={compareCareers}
                  render={career => (
                    <span className="font-semibold text-green-700 dark:text-green-400">
                      {career.salaryRangeKsh}
                    </span>
                  )}
                />
                <CompareRow
                  label="Growth outlook"
                  careers={compareCareers}
                  render={career => <GrowthCell outlook={career.growthOutlook} />}
                />
                <CompareRow
                  label="University needed"
                  careers={compareCareers}
                  render={career => (career.requiresUniversity ? 'Yes — degree required' : 'No — TVET/diploma route')}
                />
                <CompareRow
                  label="CBC subjects"
                  careers={compareCareers}
                  render={career => (
                    <span className="flex flex-wrap gap-1.5">
                      {career.subjects.map(subject => (
                        <SubjectTag
                          key={subject}
                          subject={subject}
                          size="sm"
                          pathway={career.pathwayCode}
                        />
                      ))}
                    </span>
                  )}
                />
                <CompareRow
                  label="Where to study"
                  careers={compareCareers}
                  render={career => {
                    const [top] = getUniversitiesForCareer(career);
                    if (!top) return '—';
                    return (
                      <span className="block">
                        <span className="font-semibold block">{top.university}</span>
                        <span className="text-slate-500 dark:text-slate-400 block">{top.program}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          ~KSH {top.annualFeeKsh}/year
                          {top.cutoffPoints ? ` · cut-off ${top.cutoffPoints}` : ''}
                        </span>
                      </span>
                    );
                  }}
                />
                <CompareRow
                  label="About"
                  careers={compareCareers}
                  render={career => (
                    <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {career.description}
                    </span>
                  )}
                />
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Fees and cut-off points are approximate. Verify with KUCCPS and individual institutions.
          </p>
        </motion.div>
      )}
    </div>
  );
}
