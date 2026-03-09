import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { careers, pathways, subTracks } from '@/lib/career-data';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, ChevronRight, FlaskConical, Palette, Globe } from 'lucide-react';

export async function generateStaticParams() {
  return [{ code: 'A' }, { code: 'B' }, { code: 'C' }];
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const pathway = pathways.find(p => p.code === code);
  if (!pathway) return { title: 'Not Found' };
  return {
    title: `Pathway ${pathway.code}: ${pathway.name} | TAFUTA CAREER`,
    description: pathway.description,
  };
}

function PathwayIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon === 'flask-conical') return <FlaskConical className={className} />;
  if (icon === 'palette') return <Palette className={className} />;
  return <Globe className={className} />;
}

function gradientClass(code: string) {
  if (code === 'A') return 'pathway-a';
  if (code === 'B') return 'pathway-b';
  return 'pathway-c';
}

function badgeVariant(code: string): 'green' | 'red' | 'purple' {
  if (code === 'A') return 'green';
  if (code === 'B') return 'red';
  return 'purple';
}

export default async function PathwayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const pathway = pathways.find(p => p.code === code);
  if (!pathway) notFound();

  const pathwayCareers = careers.filter(c => c.pathwayCode === code);
  const pathwaySubTracks = subTracks.filter(st => st.pathwayCode === code);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className={`${gradientClass(code)} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{pathway.shortName}</span>
          </nav>

          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/20 rounded-2xl hidden sm:block">
              <PathwayIcon icon={pathway.icon} className="w-12 h-12 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Pathway {pathway.code}
                </span>
                <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                  {pathwayCareers.length} careers
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
                {pathway.name}
              </h1>
              <p className="text-white/80 max-w-2xl leading-relaxed">
                {pathway.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-tracks */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Sub-Tracks in Pathway {code}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Choose a sub-track to explore specific careers
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pathwaySubTracks.map(subTrack => {
            const subTrackCareerCount = careers.filter(c => c.subTrackCode === subTrack.code).length;
            return (
              <Link
                key={subTrack.code}
                href={`/pathway/${code}/${subTrack.code}`}
                className="card-hover block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Badge variant={badgeVariant(code)} size="sm">{subTrack.code}</Badge>
                  <span className="text-xs text-slate-400 font-medium">{subTrackCareerCount} careers</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {subTrack.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
                  {subTrack.description}
                </p>
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400">
                  Explore careers <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-xl mx-auto text-center px-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Find your perfect career match
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Use our interactive Career Matcher to find careers that match your specific subjects.
          </p>
          <Link
            href="/matcher"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: '#006600' }}
          >
            Open Career Matcher <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
