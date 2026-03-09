import Link from 'next/link';
import { FlaskConical, Palette, Globe, Briefcase, Info } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #006600, #BB0000)' }}>
                <span className="text-white text-xs font-black">TC</span>
              </div>
              <span className="font-black text-lg text-white tracking-tight">TAFUTA CAREER</span>
            </div>
            <p className="text-slate-400 text-sm italic mb-4">Gundua Njia Yako ya Kazi</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Helping Kenyan students navigate the CBC curriculum and discover their ideal career paths.
            </p>
          </div>

          {/* Pathways */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-green-500" />
              Pathways
            </h4>
            <ul className="space-y-2">
              <li><Link href="/pathway/A" className="text-slate-400 hover:text-white text-sm transition-colors">Pathway A — STEM</Link></li>
              <li><Link href="/pathway/B" className="text-slate-400 hover:text-white text-sm transition-colors">Pathway B — Arts & Sports Science</Link></li>
              <li><Link href="/pathway/C" className="text-slate-400 hover:text-white text-sm transition-colors">Pathway C — Social Sciences</Link></li>
              <li><Link href="/pathway/A/A1" className="text-slate-400 hover:text-white text-sm transition-colors">A1 — Pure & Applied Sciences</Link></li>
              <li><Link href="/pathway/A/A2" className="text-slate-400 hover:text-white text-sm transition-colors">A2 — Engineering & Technology</Link></li>
              <li><Link href="/pathway/A/A3" className="text-slate-400 hover:text-white text-sm transition-colors">A3 — Technical & Vocational</Link></li>
              <li><Link href="/pathway/B/B1" className="text-slate-400 hover:text-white text-sm transition-colors">B1 — Performing & Creative Arts</Link></li>
              <li><Link href="/pathway/B/B2" className="text-slate-400 hover:text-white text-sm transition-colors">B2 — Languages & Communication</Link></li>
              <li><Link href="/pathway/B/B3" className="text-slate-400 hover:text-white text-sm transition-colors">B3 — Sports Science</Link></li>
              <li><Link href="/pathway/C/C1" className="text-slate-400 hover:text-white text-sm transition-colors">C1 — Humanities, Law & Governance</Link></li>
              <li><Link href="/pathway/C/C2" className="text-slate-400 hover:text-white text-sm transition-colors">C2 — Business & Entrepreneurship</Link></li>
              <li><Link href="/pathway/C/C3" className="text-slate-400 hover:text-white text-sm transition-colors">C3 — Agriculture & Environment</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              Tools
            </h4>
            <ul className="space-y-2">
              <li><Link href="/matcher" className="text-slate-400 hover:text-white text-sm transition-colors">Career Matcher</Link></li>
              <li><Link href="/subjects" className="text-slate-400 hover:text-white text-sm transition-colors">Subject Explorer</Link></li>
              <li><Link href="/search" className="text-slate-400 hover:text-white text-sm transition-colors">Search Careers</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              About
            </h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link href="/about#how-to-use" className="text-slate-400 hover:text-white text-sm transition-colors">How to Use</Link></li>
              <li><Link href="/about#disclaimer" className="text-slate-400 hover:text-white text-sm transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Stats row */}
        <div className="border-t border-slate-800 pt-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '1,252', label: 'Careers' },
              { value: '3', label: 'Pathways' },
              { value: '9', label: 'Sub-Tracks' },
              { value: '34', label: 'Subjects' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {year} TAFUTA CAREER. All rights reserved.</p>
          <p className="text-center sm:text-right">
            This is a career guidance tool. Data based on Kenya&apos;s CBC curriculum.
          </p>
        </div>
      </div>
    </footer>
  );
}
