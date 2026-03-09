'use client';

import { useState, useCallback } from 'react';
import { careers, subjects } from '@/lib/career-data';
import { matchCareers } from '@/lib/matching';
import { CareerCard } from '@/components/CareerCard';
import { CheckCircle2, Circle, X, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

const PATHWAY_LABELS: Record<string, string> = {
  A: 'STEM',
  B: 'Arts & Sports',
  C: 'Social Sciences',
};

export default function SubjectsPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [pathwayFilter, setPathwayFilter] = useState<string>('');
  const [results, setResults] = useState<ReturnType<typeof matchCareers> | null>(null);
  const [searched, setSearched] = useState(false);

  function toggleSubject(name: string) {
    setSelectedSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
    setResults(null);
    setSearched(false);
  }

  function clearAll() {
    setSelectedSubjects([]);
    setResults(null);
    setSearched(false);
  }

  function handleFind() {
    const matched = matchCareers(selectedSubjects, careers, pathwayFilter || undefined, 30);
    setResults(matched);
    setSearched(true);
  }

  const filteredSubjects = subjects.filter(s =>
    !pathwayFilter || s.pathwayAffinity === pathwayFilter
  );

  function subjectTagBg(affinity: string, selected: boolean) {
    if (!selected) return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-400';
    if (affinity === 'A') return 'bg-green-600 border-green-600 text-white';
    if (affinity === 'B') return 'bg-red-600 border-red-600 text-white';
    return 'bg-purple-600 border-purple-600 text-white';
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Subject Explorer</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Select your subjects to discover which careers match your studies
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Pathway filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Filter by pathway:</span>
          {['', 'A', 'B', 'C'].map(code => (
            <button
              key={code || 'all'}
              type="button"
              onClick={() => setPathwayFilter(code)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                pathwayFilter === code
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {code ? `Pathway ${code} — ${PATHWAY_LABELS[code]}` : 'All Subjects'}
            </button>
          ))}
        </div>

        {/* Selected summary */}
        {selectedSubjects.length > 0 && (
          <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex-wrap">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Selected: {selectedSubjects.join(', ')}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>
        )}

        {/* Subject grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-8">
          {filteredSubjects.map(subject => {
            const isSelected = selectedSubjects.includes(subject.name);
            return (
              <button
                key={subject.name}
                type="button"
                onClick={() => toggleSubject(subject.name)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${subjectTagBg(subject.pathwayAffinity, isSelected)}`}
              >
                {isSelected
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  : <Circle className="w-4 h-4 flex-shrink-0 opacity-30" />
                }
                <span className="truncate">{subject.name}</span>
              </button>
            );
          })}
        </div>

        {/* Find button */}
        <div className="flex justify-center mb-12">
          <button
            type="button"
            onClick={handleFind}
            disabled={selectedSubjects.length === 0}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:scale-105"
            style={{ background: '#006600' }}
          >
            Find Matching Careers <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        {searched && results !== null && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
                  {results.length} Matching Careers
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  For subjects: {selectedSubjects.join(', ')}
                </p>
              </div>
              <Link
                href="/matcher"
                className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
              >
                Use full matcher →
              </Link>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                <p className="text-lg mb-4">No careers matched your selected subjects.</p>
                <p className="text-sm">Try selecting more subjects or removing the pathway filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.slice(0, 40).map((result, i) => (
                  <CareerCard
                    key={result.career.id}
                    career={result.career}
                    showMatch
                    matchPercentage={result.matchPercentage}
                    matchedSubjects={result.matchedSubjects}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
