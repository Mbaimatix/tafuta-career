import type { Metadata } from 'next';
import { Bookmark } from 'lucide-react';
import { careers } from '@/lib/career-data';
import SavedCareers from '@/components/SavedCareers';

export const metadata: Metadata = {
  title: 'Saved Careers | TAFUTA CAREER',
  description:
    'Compare the careers you saved side-by-side — CBC subjects, salary range, growth outlook and university options.',
  // Bookmarks live in the visitor's browser, so there is nothing here to index.
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #000000, #006600)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Bookmark className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Saved Careers</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Compare the careers you bookmarked side-by-side — subjects, salary, growth outlook and
            where to study them in Kenya.
          </p>
          <div className="mt-6 text-sm text-white/50">
            Your bookmarks are stored in this browser only — nothing is uploaded and no account is
            needed.
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SavedCareers allCareers={careers} />
      </div>
    </div>
  );
}
