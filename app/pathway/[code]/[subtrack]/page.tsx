import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';
import { CareerCard } from '@/components/CareerCard';
import { ArrowRight, ChevronRight } from 'lucide-react';

export async function generateStaticParams() {
  return subTracks.map(st => ({
    code: st.pathwayCode,
    subtrack: st.code,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; subtrack: string }>;
}): Promise<Metadata> {
  const { subtrack } = await params;
  const subTrack = subTracks.find(st => st.code === subtrack);
  if (!subTrack) return { title: 'Not Found' };
  return {
    title: `${subTrack.name} | TAFUTA CAREER`,
    description: subTrack.description,
  };
}

function gradientClass(code: string) {
  if (code === 'A') return 'pathway-a';
  if (code === 'B') return 'pathway-b';
  return 'pathway-c';
}

export default async function SubTrackPage({
  params,
}: {
  params: Promise<{ code: string; subtrack: string }>;
}) {
  const { code, subtrack } = await params;
  const subTrack = subTracks.find(st => st.code === subtrack && st.pathwayCode === code);
  if (!subTrack) notFound();

  const pathway = pathways.find(p => p.code === code);
  const subTrackCareers = careers.filter(c => c.subTrackCode === subtrack);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className={`${gradientClass(code)} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/pathway/${code}`} className="hover:text-white transition-colors">
              {pathway?.shortName ?? `Pathway ${code}`}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{subTrack.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl hidden sm:flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-xl">{subtrack}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {subtrack}
                </span>
                <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                  {subTrackCareers.length} careers
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                {subTrack.name}
              </h1>
              <p className="text-white/80 max-w-2xl leading-relaxed">
                {subTrack.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Careers grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
              {subTrackCareers.length} Careers in {subTrack.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Click any career to see subjects, salary, and growth outlook
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {subTrackCareers.map((career, i) => (
            <CareerCard key={career.id} career={career} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-xl mx-auto text-center px-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Find careers that match your subjects
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Use the Career Matcher to get personalized career recommendations based on your specific subjects.
          </p>
          <Link
            href="/matcher"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: '#006600' }}
          >
            Use Career Matcher <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
