'use client';

import { useState, useRef } from 'react';
import { careers, subjects } from '@/lib/career-data';
import { matchCareers } from '@/lib/matching';
import { CareerCard } from '@/components/CareerCard';
import { CheckCircle2, Circle, X, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Group subjects into CBC categories
const SUBJECT_CATEGORIES: { label: string; color: string; subjects: string[] }[] = [
  {
    label: 'Sciences',
    color: 'A',
    subjects: ['Biology', 'Chemistry', 'Physics'],
  },
  {
    label: 'Mathematics',
    color: 'A',
    subjects: ['Mathematics'],
  },
  {
    label: 'Technical & Applied',
    color: 'A',
    subjects: ['Electrical Technology', 'Metal Technology', 'Wood Technology', 'Building Construction', 'Power Mechanics', 'Aviation', 'Agriculture'],
  },
  {
    label: 'Computer & ICT',
    color: 'A',
    subjects: ['Computer Studies'],
  },
  {
    label: 'Languages',
    color: 'B',
    subjects: ['English', 'Kiswahili', 'French', 'German'],
  },
  {
    label: 'Humanities & Social Studies',
    color: 'C',
    subjects: ['History', 'Geography', 'Christian Religious Education', 'Islamic Religious Education', 'Political Science', 'Psychology', 'Philosophy', 'Community Studies', 'Community Service Learning'],
  },
  {
    label: 'Business & Economics',
    color: 'C',
    subjects: ['Business Studies'],
  },
  {
    label: 'Arts, Sports & Creative',
    color: 'B',
    subjects: ['Fine Art', 'Music', 'Music & Dance', 'Physical Education', 'Sport & Recreation', 'Theatre & Film'],
  },
];

// Pre-compute career count per subject
const subjectCareerCount: Record<string, number> = {};
for (const career of careers) {
  for (const subj of career.subjects) {
    subjectCareerCount[subj] = (subjectCareerCount[subj] || 0) + 1;
  }
}

const subjectNames = new Set(subjects.map(s => s.name));

const MAX_SUBJECTS = 3;

export default function SubjectsPage() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [results, setResults] = useState<ReturnType<typeof matchCareers> | null>(null);
  const [searched, setSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function toggleSubject(name: string) {
    setSelectedSubjects(prev => {
      if (prev.includes(name)) return prev.filter(s => s !== name);
      if (prev.length >= MAX_SUBJECTS) return prev; // enforce max 3
      return [...prev, name];
    });
    setResults(null);
    setSearched(false);
  }

  function clearAll() {
    setSelectedSubjects([]);
    setResults(null);
    setSearched(false);
  }

  function handleFind() {
    const matched = matchCareers(selectedSubjects, careers, undefined, 1);
    setResults(matched);
    setSearched(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }

  function getBadgeClass(color: string, selected: boolean) {
    if (!selected) return 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500';
    if (color === 'A') return 'bg-green-600 border-green-600 text-white';
    if (color === 'B') return 'bg-red-600 border-red-600 text-white';
    return 'bg-purple-600 border-purple-600 text-white';
  }

  function getCategoryHeaderColor(color: string) {
    if (color === 'A') return 'text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
    if (color === 'B') return 'text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
    return 'text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
  }

  const atMax = selectedSubjects.length >= MAX_SUBJECTS;

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
            Select up to 3 CBC subjects to discover matching careers
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* CBC Rule Notice */}
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">CBC Subject Selection Rule</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              In Kenya&apos;s CBC Senior School, students select exactly 1 track + 3 elective subjects. Select up to 3 subjects below to find your best career matches.
            </p>
          </div>
        </div>

        {/* Selected summary */}
        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Selected subjects ({selectedSubjects.length}/{MAX_SUBJECTS}):
            </span>
            {selectedSubjects.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {selectedSubjects.length === 0 ? (
              <span className="text-sm text-slate-400 italic">No subjects selected yet — click subjects below</span>
            ) : (
              selectedSubjects.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold"
                >
                  {s}
                  <button type="button" onClick={() => toggleSubject(s)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
          {atMax && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
              Maximum 3 subjects selected. Deselect one to choose another.
            </p>
          )}
        </div>

        {/* Subjects by category */}
        <div className="space-y-6 mb-10">
          {SUBJECT_CATEGORIES.map(category => {
            const availableSubjects = category.subjects.filter(s => subjectNames.has(s));
            if (availableSubjects.length === 0) return null;
            return (
              <div key={category.label}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 pb-2 border-b ${getCategoryHeaderColor(category.color)}`}>
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map(subjectName => {
                    const isSelected = selectedSubjects.includes(subjectName);
                    const disabled = !isSelected && atMax;
                    const count = subjectCareerCount[subjectName] || 0;
                    return (
                      <button
                        key={subjectName}
                        type="button"
                        onClick={() => !disabled && toggleSubject(subjectName)}
                        disabled={disabled}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          disabled ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500' :
                          getBadgeClass(category.color, isSelected)
                        }`}
                      >
                        {isSelected
                          ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                          : <Circle className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                        }
                        <span>{subjectName}</span>
                        {count > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Find button */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <button
            type="button"
            onClick={handleFind}
            disabled={selectedSubjects.length === 0}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-transform hover:scale-105"
            style={{ background: '#006600' }}
          >
            Find Matching Careers <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            The number badge on each subject shows how many careers require it
          </p>
        </div>

        {/* Results */}
        <div ref={resultsRef}>
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
                  <p className="text-sm">Try selecting different subjects.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {results.slice(0, 48).map((result, i) => (
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
              {results.length > 48 && (
                <p className="text-center text-slate-400 dark:text-slate-500 mt-8 text-sm">
                  Showing top 48 of {results.length} matches. Use the{' '}
                  <Link href="/matcher" className="text-green-600 dark:text-green-400 underline">Career Matcher</Link>
                  {' '}for full ranked results.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
