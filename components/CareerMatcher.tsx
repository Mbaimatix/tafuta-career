'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Share2, Printer, FlaskConical, Palette, Globe, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { Career, Subject } from '@/lib/career-data';
import { matchCareers, type MatchResult } from '@/lib/matching';
import { CareerCard } from '@/components/CareerCard';

interface CareerMatcherProps {
  allCareers: Career[];
  allSubjects: Subject[];
}

const PATHWAY_INFO = {
  A: { label: 'STEM', icon: FlaskConical, gradient: 'pathway-a', desc: 'Science, Technology, Engineering & Mathematics' },
  B: { label: 'Arts & Sports Science', icon: Palette, gradient: 'pathway-b', desc: 'Arts, Creative Industries & Sports Science' },
  C: { label: 'Social Sciences', icon: Globe, gradient: 'pathway-c', desc: 'Humanities, Business & Social Studies' },
};

// Subject categories for grouped display
const SUBJECT_GROUPS: { label: string; subjects: string[] }[] = [
  { label: 'Sciences', subjects: ['Biology', 'Chemistry', 'Physics'] },
  { label: 'Mathematics', subjects: ['Mathematics'] },
  { label: 'Technical & Applied', subjects: ['Electrical Technology', 'Metal Technology', 'Wood Technology', 'Building Construction', 'Power Mechanics', 'Aviation', 'Agriculture'] },
  { label: 'Computer & ICT', subjects: ['Computer Studies'] },
  { label: 'Languages', subjects: ['English', 'Kiswahili', 'French', 'German'] },
  { label: 'Humanities & Social', subjects: ['History', 'Geography', 'Christian Religious Education', 'Islamic Religious Education', 'Political Science', 'Psychology', 'Philosophy', 'Community Studies', 'Community Service Learning'] },
  { label: 'Business & Economics', subjects: ['Business Studies'] },
  { label: 'Arts, Sports & Creative', subjects: ['Fine Art', 'Music', 'Music & Dance', 'Physical Education', 'Sport & Recreation', 'Theatre & Film'] },
];

const MAX_SUBJECTS = 3;

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function CareerMatcher({ allCareers, allSubjects }: CareerMatcherProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allSubjectNames = new Set(allSubjects.map(s => s.name));

  const goTo = useCallback((nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }, [step]);

  function toggleSubject(name: string) {
    setSelectedSubjects(prev => {
      if (prev.includes(name)) return prev.filter(s => s !== name);
      if (prev.length >= MAX_SUBJECTS) return prev;
      return [...prev, name];
    });
  }

  function handleNext() {
    if (step === 1 && selectedPathway) goTo(2);
    else if (step === 2) {
      const matched = matchCareers(selectedSubjects, allCareers, selectedPathway || undefined, 1);
      setResults(matched);
      goTo(3);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    }
  }

  function handleReset() {
    setSelectedPathway('');
    setSelectedSubjects([]);
    setResults([]);
    setDirection(-1);
    setStep(1);
  }

  function handleShare() {
    const url = new URL(window.location.href);
    url.searchParams.set('pathway', selectedPathway);
    url.searchParams.set('subjects', selectedSubjects.join(','));
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    window.print();
  }

  const atMax = selectedSubjects.length >= MAX_SUBJECTS;
  const canProceed = step === 1 ? !!selectedPathway : step === 2 ? selectedSubjects.length > 0 : false;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                s < step ? 'bg-green-600 border-green-600 text-white' :
                s === step ? 'border-green-600 text-green-600 bg-white dark:bg-slate-900' :
                'border-slate-300 dark:border-slate-600 text-slate-400 bg-white dark:bg-slate-900'
              }`}>
                {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-semibold ${s === step ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                  {s === 1 ? 'Choose Pathway' : s === 2 ? 'Pick Subjects' : 'Your Matches'}
                </p>
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${s < step ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="overflow-x-hidden overflow-y-visible relative min-h-[500px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Which pathway are you in?
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Select your CBC academic pathway to get started</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {(Object.entries(PATHWAY_INFO) as [string, typeof PATHWAY_INFO['A']][]).map(([code, info]) => {
                  const Icon = info.icon;
                  const selected = selectedPathway === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setSelectedPathway(code)}
                      className={`${info.gradient} rounded-2xl p-6 text-left text-white transition-all ring-4 ${
                        selected ? 'ring-white ring-offset-2 scale-105 shadow-2xl' : 'ring-transparent hover:ring-white/30 hover:scale-102'
                      }`}
                    >
                      <div className="p-3 bg-white/20 rounded-xl w-fit mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white/70 text-sm mb-1">Pathway {code}</p>
                      <h3 className="text-xl font-bold text-white mb-2">{info.label}</h3>
                      <p className="text-white/80 text-sm leading-relaxed">{info.desc}</p>
                      {selected && (
                        <div className="mt-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span className="text-white font-semibold text-sm">Selected</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Which subjects do you take?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-3">
                  Select up to 3 elective subjects (CBC rule: 1 track + 3 electives)
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border-2 ${
                    selectedSubjects.length === MAX_SUBJECTS
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  }`}>
                    {selectedSubjects.length}/{MAX_SUBJECTS} subjects selected
                  </span>
                </div>
              </div>

              {/* Selected subjects preview */}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {selectedSubjects.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold"
                    >
                      {s}
                      <button type="button" onClick={() => toggleSubject(s)} className="hover:opacity-70 ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {atMax && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    Maximum 3 subjects reached. Deselect one to choose a different subject.
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                {SUBJECT_GROUPS.map(group => {
                  const available = group.subjects.filter(s => allSubjectNames.has(s));
                  if (available.length === 0) return null;
                  return (
                    <div key={group.label}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{group.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {available.map(subjectName => {
                          const isSelected = selectedSubjects.includes(subjectName);
                          const disabled = !isSelected && atMax;
                          return (
                            <button
                              key={subjectName}
                              type="button"
                              onClick={() => !disabled && toggleSubject(subjectName)}
                              disabled={disabled}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                                disabled
                                  ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                                  : isSelected
                                    ? 'bg-green-600 border-green-600 text-white'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-green-400 dark:hover:border-green-600'
                              }`}
                            >
                              {isSelected
                                ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                : <Circle className="w-3.5 h-3.5 flex-shrink-0 opacity-30" />
                              }
                              {subjectName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              ref={resultsRef}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Your Career Matches
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Found <strong className="text-slate-700 dark:text-slate-200">{results.length}</strong> careers matching your subjects
                </p>
                {selectedSubjects.length > 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Based on: {selectedSubjects.join(', ')}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3 mt-4 no-print flex-wrap">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Share Results'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                </div>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">No careers matched your selection. Try selecting more subjects or a different pathway.</p>
                  <button type="button" onClick={handleReset} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    Start Over
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.slice(0, 30).map((result, i) => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div ref={step !== 3 ? undefined : resultsRef} className="flex items-center justify-between mt-8 no-print">
        <button
          type="button"
          onClick={() => step > 1 ? goTo(step - 1) : null}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors shadow-lg"
          >
            {step === 2 ? 'Find Matches' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-semibold hover:bg-slate-900 dark:hover:bg-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Start Over
          </button>
        )}
      </div>
    </div>
  );
}
