import type { Metadata } from 'next';
import { careers, subjects } from '@/lib/career-data';
import CareerMatcher from '@/components/CareerMatcher';
import { Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Career Matcher | TAFUTA CAREER',
  description: 'Discover careers that match your CBC subjects. Select your pathway and subjects to find your ideal career from 1,252 options across Kenya\'s CBC curriculum.',
};

export default function MatcherPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #000000, #006600)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Career Matcher</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Tell us your pathway and subjects — we&apos;ll match you to the best career options from 1,252 possibilities.
          </p>
          <div className="mt-6 text-sm text-white/50">
            This tool uses your subject selection to find careers where you meet at least 30% of requirements.
          </div>
        </div>
      </section>

      {/* Matcher component */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CareerMatcher allCareers={careers} allSubjects={subjects} />
      </div>
    </div>
  );
}
