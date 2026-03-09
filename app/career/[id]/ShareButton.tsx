'use client';

import { Share2, Printer } from 'lucide-react';
import Link from 'next/link';

export default function CareerActions({ careerName }: { careerName: string }) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: `${careerName} | TAFUTA CAREER`,
        text: `Check out this career: ${careerName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied!');
      });
    }
  }

  return (
    <div className="flex items-center gap-3 no-print flex-wrap">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Share2 className="w-4 h-4" /> Share
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <Printer className="w-4 h-4" /> Print
      </button>
      <Link
        href="/matcher"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
        style={{ background: '#006600' }}
      >
        Find Similar Careers
      </Link>
    </div>
  );
}
