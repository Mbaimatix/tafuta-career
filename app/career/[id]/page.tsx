import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';
import { getRelatedCareers } from '@/lib/matching';
import { SubjectTag } from '@/components/SubjectTag';
import { Badge } from '@/components/ui/Badge';
import { CareerCard } from '@/components/CareerCard';
import { TrendingUp, TrendingDown, Minus, GraduationCap, DollarSign, ChevronRight } from 'lucide-react';
import CareerActions from './ShareButton';
import ProCareerSections from './ProCareerSections';

export async function generateStaticParams() {
  return careers.map(c => ({ id: String(c.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const career = careers.find(c => c.id === Number(id));
  if (!career) return { title: 'Career Not Found | TAFUTA CAREER' };
  return {
    title: `${career.name} | TAFUTA CAREER`,
    description: career.description,
    openGraph: {
      title: `${career.name} | TAFUTA CAREER`,
      description: career.description,
    },
  };
}

function GrowthIndicator({ outlook }: { outlook: string }) {
  if (outlook === 'High') return (
    <div className="flex items-center gap-2 text-green-600">
      <TrendingUp className="w-5 h-5" />
      <span className="font-semibold">High Growth</span>
    </div>
  );
  if (outlook === 'Low') return (
    <div className="flex items-center gap-2 text-red-600">
      <TrendingDown className="w-5 h-5" />
      <span className="font-semibold">Low Growth</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 text-amber-600">
      <Minus className="w-5 h-5" />
      <span className="font-semibold">Medium Growth</span>
    </div>
  );
}

function pathwayBadgeVariant(code: string): 'green' | 'red' | 'purple' {
  if (code === 'A') return 'green';
  if (code === 'B') return 'red';
  return 'purple';
}

export default async function CareerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const career = careers.find(c => c.id === Number(id));
  if (!career) notFound();

  const pathway = pathways.find(p => p.code === career.pathwayCode);
  const subTrack = subTracks.find(st => st.code === career.subTrackCode);
  const relatedCareers = getRelatedCareers(career, careers, 6);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: career.name,
    description: career.description,
    educationRequirements: career.requiresUniversity ? 'Bachelor degree' : 'Certificate or Diploma',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
        {/* Header bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/pathway/${career.pathwayCode}`} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                {pathway?.shortName ?? `Pathway ${career.pathwayCode}`}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/pathway/${career.pathwayCode}/${career.subTrackCode}`} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                {subTrack?.name ?? career.subTrackCode}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-48">{career.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title + badges */}
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded">
                    #{career.number}
                  </span>
                  <Badge variant={pathwayBadgeVariant(career.pathwayCode)}>
                    {pathway?.shortName ?? `Pathway ${career.pathwayCode}`}
                  </Badge>
                  <Badge variant="outline">{subTrack?.name ?? career.subTrackCode}</Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                  {career.name}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                  {career.description}
                </p>
              </div>

              {/* Subjects */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Required Subjects
                </h2>
                <div className="flex flex-wrap gap-2">
                  {career.subjects.map(subject => (
                    <SubjectTag
                      key={subject}
                      subject={subject}
                      pathway={career.pathwayCode}
                      size="md"
                      clickable
                    />
                  ))}
                </div>
              </div>

              {/* Actions (Share + Print[PRO] + Save[PRO]) */}
              <CareerActions careerName={career.name} />
              <ProCareerSections career={career} />
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Salary */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Salary Range</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold">{career.salaryRangeKsh}</p>
                <p className="text-xs text-slate-400 mt-1">Approximate monthly salary in Kenya</p>
              </div>

              {/* Growth */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Growth Outlook</h3>
                <GrowthIndicator outlook={career.growthOutlook} />
                <p className="text-xs text-slate-400 mt-2">Job market demand trend in Kenya</p>
              </div>

              {/* University */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Education</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">
                  {career.requiresUniversity ? 'University Degree Required' : 'TVET / Certificate Possible'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {career.requiresUniversity
                    ? 'This career typically requires a bachelor\'s degree or higher.'
                    : 'This career may be accessed via TVET, diploma, or certificate programs.'}
                </p>
              </div>

              {/* Pathway info */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Pathway Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Pathway</span>
                    <Badge variant={pathwayBadgeVariant(career.pathwayCode)} size="sm">
                      {career.pathwayCode} — {pathway?.shortName}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Sub-Track</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 text-right max-w-36">{subTrack?.name}</span>
                  </div>
                </div>
                <Link
                  href={`/pathway/${career.pathwayCode}/${career.subTrackCode}`}
                  className="block mt-3 text-xs text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  See all careers in {subTrack?.name} →
                </Link>
              </div>
            </div>
          </div>

          {/* Related Careers */}
          {relatedCareers.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
                Related Careers
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Careers that share similar subjects with {career.name}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCareers.map((related, i) => (
                  <CareerCard key={related.id} career={related} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
