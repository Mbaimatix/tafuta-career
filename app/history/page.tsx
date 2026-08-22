import type { Metadata } from 'next';
import { History } from 'lucide-react';
import { careers } from '@/lib/career-data';
import MatcherHistory from '@/components/MatcherHistory';

export const metadata: Metadata = {
  title: 'Matcher History | TAFUTA CAREER',
  description:
    'Revisit your previous Career Matcher runs and reopen the results without starting over.',
  // History lives in the visitor's browser, so there is nothing here to index.
  robots: { index: false, follow: true },
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen">
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #000000, #006600)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <History className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Matcher History</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Every Career Matcher run you complete is saved here, so you can reopen
            your results and compare them later.
          </p>
          <div className="mt-6 text-sm text-white/50">
            Your history is stored in this browser only — nothing is uploaded and no
            account is needed.
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MatcherHistory allCareers={careers} />
      </div>
    </div>
  );
}
