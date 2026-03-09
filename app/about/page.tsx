import type { Metadata } from 'next';
import Link from 'next/link';
import { FlaskConical, Palette, Globe, BookOpen, Target, Sparkles, Info, AlertTriangle, Users, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About TAFUTA CAREER | CBC Career Guidance Platform',
  description: "Learn about TAFUTA CAREER, the comprehensive CBC career guidance platform for Kenyan students. Understand Kenya's three CBC pathways and how to use this tool.",
};

const pathways = [
  {
    code: 'A',
    name: 'Science, Technology, Engineering & Mathematics',
    shortName: 'STEM',
    icon: FlaskConical,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    desc: 'The STEM pathway develops competencies in scientific inquiry, technological innovation, mathematical reasoning, and systematic problem-solving. Students in this pathway study subjects like Biology, Chemistry, Physics, Mathematics, and Computer Studies. It is Kenya\'s fastest-growing sector with the highest career demand.',
    subTracks: ['Pure & Applied Sciences (A1)', 'Engineering & Technology (A2)', 'Technical & Vocational (A3)'],
  },
  {
    code: 'B',
    name: 'Arts & Sports Science',
    shortName: 'Arts & Sports',
    icon: Palette,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    desc: "The Arts & Sports pathway develops competencies in creative expression, physical excellence, cultural awareness, and effective communication. Students study subjects like Fine Art, Music & Dance, Theatre & Film, Physical Education, and Sport & Recreation. Kenya's creative and sports industries are expanding globally.",
    subTracks: ['Performing & Creative Arts (B1)', 'Languages & Communication (B2)', 'Sports Science & Recreation (B3)'],
  },
  {
    code: 'C',
    name: 'Social Sciences (Humanities & Business)',
    shortName: 'Social Sciences',
    icon: Globe,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    desc: "The Social Sciences pathway develops competencies in critical thinking, social understanding, ethical reasoning, economic analysis, and entrepreneurial thinking. Students study subjects like Business Studies, History, Geography, English, Kiswahili, and more. It is the backbone of Kenya's governance and business ecosystem.",
    subTracks: ['Humanities, Law & Governance (C1)', 'Business, Economics & Entrepreneurship (C2)', 'Agriculture & Environmental Management (C3)'],
  },
];

const steps = [
  { icon: BookOpen, step: '01', title: 'Know Your Pathway', desc: 'Identify which of the 3 CBC pathways you are enrolled in: STEM (A), Arts & Sports (B), or Social Sciences (C).' },
  { icon: Target, step: '02', title: 'Select Your Subjects', desc: 'Go to the Subject Explorer or Career Matcher and select all the subjects you currently study.' },
  { icon: Sparkles, step: '03', title: 'Discover Careers', desc: 'View your career matches with match percentage, salary ranges, growth outlook, and education requirements.' },
  { icon: CheckCircle, step: '04', title: 'Explore & Plan', desc: 'Click into any career to learn more, find related careers, and start planning your academic journey.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #000000, #006600)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Info className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">About TAFUTA CAREER</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            A comprehensive career guidance platform built for Kenyan students navigating the Competency Based Curriculum (CBC).
          </p>
        </div>
      </section>

      {/* What is CBC */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-4">What is CBC?</h2>
        <div className="prose prose-lg max-w-none text-slate-600 dark:text-slate-300 space-y-4">
          <p>
            The <strong className="text-slate-900 dark:text-slate-100">Competency Based Curriculum (CBC)</strong> is Kenya&apos;s reformed education system introduced to replace the 8-4-4 system. CBC focuses on developing learner competencies — knowledge, skills, and attitudes — rather than memorization.
          </p>
          <p>
            At the Senior Secondary School level, students choose one of three academic <strong className="text-slate-900 dark:text-slate-100">pathways</strong> that guide their subject selection and career preparation. Each pathway has sub-tracks that allow further specialization.
          </p>
          <p>
            TAFUTA CAREER helps students understand which careers are accessible based on the subjects they study within their chosen pathway.
          </p>
        </div>
      </section>

      {/* The 3 Pathways */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2 text-center">The 3 CBC Pathways</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-10">Each pathway leads to diverse and rewarding careers</p>
          <div className="space-y-6">
            {pathways.map(pathway => {
              const Icon = pathway.icon;
              return (
                <div key={pathway.code} className={`${pathway.bg} border ${pathway.border} rounded-2xl p-6`}>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl flex-shrink-0">
                      <Icon className={`w-7 h-7 ${pathway.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-black text-xl text-slate-900 dark:text-slate-100">{pathway.shortName}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">— Pathway {pathway.code}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-4">{pathway.desc}</p>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Sub-Tracks:</p>
                        <div className="flex flex-wrap gap-2">
                          {pathway.subTracks.map(st => (
                            <span key={st} className="text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                              {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/pathway/${pathway.code}`}
                      className={`hidden sm:flex items-center gap-1 text-sm font-semibold ${pathway.color} hover:underline flex-shrink-0`}
                    >
                      Explore →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" id="how-to-use">
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">How to Use This Website</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10">Follow these steps to find your ideal career</p>
        <div className="space-y-4">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                  <span className="text-white dark:text-slate-900 font-black text-sm">{step.step}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 dark:bg-amber-900/10 border-y border-amber-200 dark:border-amber-800" id="disclaimer">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-3">Disclaimer</h2>
              <div className="space-y-2 text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                <p>
                  TAFUTA CAREER is a <strong>career guidance tool</strong> and not an official government or educational authority platform. The career data is based on Kenya&apos;s CBC curriculum documentation and general career guidance information.
                </p>
                <p>
                  Salary ranges are approximate and may vary based on experience, location, employer, and market conditions. Career requirements and subject affiliations may change as the CBC curriculum evolves.
                </p>
                <p>
                  Students are encouraged to consult with school counselors, university admissions offices, and professional bodies for official career and admission guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          <Users className="w-6 h-6 text-slate-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Credits & Data Sources</h2>
            <div className="space-y-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              <p>Career data is derived from Kenya&apos;s Comprehensive Career Guidance Booklet aligned with the CBC Senior Secondary School curriculum.</p>
              <p>The platform features 1,252 careers across 9 sub-tracks, 3 pathways, and 34 subjects — comprehensively covering the Kenyan CBC career landscape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h3 className="text-2xl font-black text-white mb-4">Ready to discover your career?</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/matcher" className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ background: '#006600' }}>
              Career Matcher
            </Link>
            <Link href="/subjects" className="px-8 py-3 rounded-xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
              Subject Explorer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
