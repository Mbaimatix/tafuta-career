'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, RotateCcw, Share2, Printer, FlaskConical, Palette, Globe, CheckCircle2, Circle } from 'lucide-react';
import type { Career, Subject } from '@/lib/career-data';
import { matchCareers, type MatchResult } from '@/lib/matching';
import { CareerCard } from '@/components/CareerCard';

interface CareerMatcherProps {
  allCareers: Career[];
  allSubjects: Subject[];
}

const PATHWAY_INFO = {
  A: { label: 'STEM', icon: FlaskConical, gradient: 'pathway-a', desc: 'Science, Technology, Engineering & Mathematics' },
  B: { label: 'Arts & Sports', icon: Palette, gradient: 'pathway-b', desc: 'Arts, Creative Industries & Sports Science' },
  C: { label: 'Social Sciences', icon: Globe, gradient: 'pathway-c', desc: 'Humanities, Business & Social Studies' },
};

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
  const router = useRouter();

  const goTo = useCallback((nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }, [step]);

  const pathwaySubjects = allSubjects.filter(s =>
    !selectedPathway || s.pathwayAffinity === selectedPathway || s.pathwayAffinity === 'C'
  );

  function toggleSubject(name: string) {
    setSelectedSubjects(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  }

  function handleNext() {
    if (step === 1 && selectedPathway) goTo(2);
    else if (step === 2) {
      const matched = matchCareers(selectedSubjects, allCareers, selectedPathway || undefined, 30);
      setResults(matched);
      goTo(3);
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
      alert('Link copied to clipboard!');
    });
  }

  function handlePrint() {
    window.print();
  }

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
      <div className="overflow-hidden relative min-h-[500px]">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Select all subjects you study. More selections = better matches.
                </p>
                {selectedSubjects.length > 0 && (
                  <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-1.5 rounded-full text-sm font-semibold">
                    {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {allSubjects.map(subject => {
                  const isSelected = selectedSubjects.includes(subject.name);
                  const affinity = subject.pathwayAffinity;
                  return (
                    <button
                      key={subject.name}
                      type="button"
                      onClick={() => toggleSubject(subject.name)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                        isSelected
                          ? affinity === 'A' ? 'bg-green-600 border-green-600 text-white' :
                            affinity === 'B' ? 'bg-red-600 border-red-600 text-white' :
                            'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
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
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Your Career Matches
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  Found <strong className="text-slate-700 dark:text-slate-200">{results.length}</strong> careers matching your subjects
                </p>
                <div className="flex items-center justify-center gap-3 mt-4 no-print flex-wrap">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> Share Results
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
      <div className="flex items-center justify-between mt-8 no-print">
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
