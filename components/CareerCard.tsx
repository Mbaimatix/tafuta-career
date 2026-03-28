'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, GraduationCap } from 'lucide-react';
import type { Career } from '@/lib/career-data';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/SubjectTag';

interface CareerCardProps {
  career: Career;
  compact?: boolean;
  showMatch?: boolean;
  matchPercentage?: number;
  matchedSubjects?: string[];
  index?: number;
}

function GrowthIcon({ outlook }: { outlook: string }) {
  if (outlook === 'High') return <TrendingUp className="w-4 h-4 text-green-600" />;
  if (outlook === 'Low') return <TrendingDown className="w-4 h-4 text-red-600" />;
  return <Minus className="w-4 h-4 text-amber-500" />;
}

function growthColor(outlook: string) {
  if (outlook === 'High') return 'growth-high';
  if (outlook === 'Low') return 'growth-low';
  return 'growth-medium';
}

function pathwayVariant(code: string): 'green' | 'red' | 'purple' {
  if (code === 'A') return 'green';
  if (code === 'B') return 'red';
  return 'purple';
}

function pathwayLabel(code: string) {
  if (code === 'A') return 'ROOT';
  if (code === 'B') return 'Arts & Sports';
  return 'Social Sciences';
}

export function CareerCard({
  career,
  compact = false,
  showMatch = false,
  matchPercentage,
  matchedSubjects = [],
  index = 0,
}: CareerCardProps) {
  const displaySubjects = career.subjects.slice(0, 4);
  const extraSubjects = career.subjects.length - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-hover"
    >
      <Link href={`/career/${career.id}`} className="block">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-full flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0 text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                #{career.number}
              </span>
              <h3 className={`font-semibold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
                {career.name}
              </h3>
            </div>
            <Badge variant={pathwayVariant(career.pathwayCode)} size="sm" className="flex-shrink-0">
              {pathwayLabel(career.pathwayCode)}
            </Badge>
          </div>

          {/* Match bar */}
          {showMatch && matchPercentage !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Match</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{matchPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${matchPercentage}%`,
                    background: matchPercentage >= 80 ? '#16a34a' : matchPercentage >= 50 ? '#d97706' : '#dc2626',
                  }}
                />
              </div>
            </div>
          )}

          {/* Subjects */}
          {!compact && (
            <div className="flex flex-wrap gap-1.5">
              {displaySubjects.map(subject => (
                <SubjectTag
                  key={subject}
                  subject={subject}
                  size="sm"
                  pathway={career.pathwayCode}
                />
              ))}
              {extraSubjects > 0 && (
                <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  +{extraSubjects} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1">
              <GrowthIcon outlook={career.growthOutlook} />
              <span className={`font-medium ${growthColor(career.growthOutlook)}`}>
                {career.growthOutlook} Growth
              </span>
            </div>
            {career.requiresUniversity && (
              <span title="Requires University" aria-label="Requires University">
                <GraduationCap className="w-4 h-4 text-slate-400" />
              </span>
            )}
          </div>

          {!compact && (
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium border-t border-slate-100 dark:border-slate-700 pt-2">
              {career.salaryRangeKsh}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
