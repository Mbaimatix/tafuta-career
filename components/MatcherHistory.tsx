'use client';

/**
 * MatcherHistory
 * Lists completed Career Matcher runs from localStorage and can re-open any of
 * them inline. Mirrors components/SavedCareers.tsx in structure and styling.
 *
 * Reports are recomputed, not stored: matchCareers() is pure, so a run's
 * inputs are enough to rebuild its result list on demand.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { History, Trash2, X, Target, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { Career } from '@/lib/career-data';
import { matchCareers } from '@/lib/matching';
import { CareerCard } from '@/components/CareerCard';
import { Badge } from '@/components/ui/Badge';
import { useIsHydrated } from '@/lib/hydration';
import { historyStore, useMatcherHistory, MAX_HISTORY_ENTRIES } from '@/lib/matcherHistory';

interface MatcherHistoryProps {
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

/** Compact relative time — the repo has no date library and needs none here. */
function formatRelativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function MatcherHistory({ allCareers }: MatcherHistoryProps) {
  const hydrated = useIsHydrated();
  const { entries } = useMatcherHistory();
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);

  const openEntry = entries.find(e => e.id === openEntryId) ?? null;

  // Recompute the opened run's results from its stored inputs.
  const openResults = useMemo(() => {
    if (!openEntry) return [];
    return matchCareers(openEntry.selectedSubjects, allCareers, openEntry.pathway || undefined, 1);
  }, [openEntry, allCareers]);

  if (!hydrated) {
    return (
      <div className="py-20 text-center text-slate-400 dark:text-slate-500 text-sm">
        Loading your history…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <History className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
          No matcher runs yet
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Complete a Career Matcher run and it will be saved here, so you can come
          back and reopen your results without starting over.
        </p>
        <Link
          href="/matcher"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
          style={{ background: '#006600' }}
        >
          <Target className="w-4 h-4" />
          Run the Career Matcher
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Your matcher runs ({entries.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            The most recent {MAX_HISTORY_ENTRIES} runs are kept in this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { historyStore.clear(); setOpenEntryId(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors no-print"
        >
          <Trash2 className="w-4 h-4" />
          Clear history
        </button>
      </div>

      <div className="space-y-3">
        {entries.map(entry => {
          const isOpen = entry.id === openEntryId;
          return (
            <div
              key={entry.id}
              className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant={pathwayVariant(entry.pathway)} size="sm">
                        {pathwayLabel(entry.pathway)}
                      </Badge>
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {entry.referenceCode}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {entry.selectedSubjects.join(', ')}
                    </p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {entry.resultCount} matches
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 no-print">
                    <button
                      type="button"
                      onClick={() => setOpenEntryId(isOpen ? null : entry.id)}
                      aria-expanded={isOpen}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity"
                      style={{ background: '#006600' }}
                    >
                      {isOpen ? 'Hide Report' : 'View Report'}
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        historyStore.remove(entry.id);
                        if (isOpen) setOpenEntryId(null);
                      }}
                      aria-label={`Remove run ${entry.referenceCode} from history`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/40">
                  {openResults.length !== entry.resultCount && (
                    <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 mb-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-px" />
                      This run originally returned {entry.resultCount} matches. The career
                      data has changed since, so these {openResults.length} results may differ.
                    </p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {openResults.map((result, i) => (
                      <CareerCard
                        key={result.career.id}
                        career={result.career}
                        showMatch
                        matchPercentage={result.matchPercentage}
                        matchedSubjects={result.matchedSubjects}
                        index={Math.min(i, 12)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
