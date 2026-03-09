import Link from 'next/link';
import { Home, Search, BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #000000 0%, #003300 50%, #001a00 100%)' }}>
      <div className="text-center max-w-lg w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #006600, #BB0000)' }}>
            <span className="text-white text-2xl font-black">TC</span>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-8xl font-black text-white mb-2" style={{ textShadow: '0 0 30px rgba(0,102,0,0.5)' }}>
          404
        </h1>
        <div className="w-24 h-1 mx-auto mb-6 rounded-full" style={{ background: 'linear-gradient(90deg, #006600, #BB0000)' }} />

        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 mb-2">
          Hmm, this career path doesn&apos;t exist — yet!
        </p>
        <p className="text-slate-500 text-sm mb-10 italic">
          &quot;Gundua Njia Yako ya Kazi&quot; — discover the right path below.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/10"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/10"
          >
            <Search className="w-4 h-4" /> Search Careers
          </Link>
          <Link
            href="/subjects"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/10"
          >
            <BookOpen className="w-4 h-4" /> Subjects
          </Link>
        </div>

        <Link
          href="/matcher"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg"
          style={{ background: '#006600' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Try Career Matcher
        </Link>

        <p className="text-slate-600 text-xs mt-8">
          TAFUTA CAREER — CBC Career Guidance for Kenyan Students
        </p>
      </div>
    </div>
  );
}
