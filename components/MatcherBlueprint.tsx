'use client';

/**
 * MatcherBlueprint
 * Document-style header for the Career Matcher's step-3 results screen.
 * Mirrors the "doc-style" share/print idiom already used on the career detail
 * page, so a printed result set reads like a report rather than a web page.
 *
 * Presentational only — it computes nothing and owns no state.
 */

import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/SubjectTag';

interface MatcherBlueprintProps {
  pathwayCode: string;        // selectedPathway, e.g. "A"
  pathwayLabel: string;       // PATHWAY_INFO[selectedPathway].label, e.g. "STEM"
  subjects: string[];         // selectedSubjects
  matchCount: number;         // results.length
  referenceCode: string;      // generateReferenceCode(selectedPathway, selectedSubjects)
}

function pathwayVariant(code: string): 'green' | 'red' | 'purple' {
  if (code === 'A') return 'green';
  if (code === 'B') return 'red';
  return 'purple';
}

export default function MatcherBlueprint({
  pathwayCode,
  pathwayLabel,
  subjects,
  matchCount,
  referenceCode,
}: MatcherBlueprintProps) {
  return (
    <div className="blueprint-header bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 text-left">
      {/* Title row + reference code */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Career Blueprint
          </p>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
            {matchCount} career {matchCount === 1 ? 'match' : 'matches'}
          </h2>
        </div>
        <span
          className="font-mono text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded flex-shrink-0"
          aria-label={`Reference code ${referenceCode}`}
        >
          {referenceCode}
        </span>
      </div>

      {/* Pathway */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Pathway
        </span>
        <Badge variant={pathwayVariant(pathwayCode)} size="sm">
          {pathwayLabel}
        </Badge>
      </div>

      {/* Subjects */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
          Subjects
        </p>
        <div className="flex flex-wrap gap-1.5">
          {subjects.map(subject => (
            <SubjectTag key={subject} subject={subject} size="sm" pathway={pathwayCode} />
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-3">
        Generated on {new Date().toLocaleDateString()} · tafutacareer.com
      </p>
    </div>
  );
}
