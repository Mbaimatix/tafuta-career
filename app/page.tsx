import Link from 'next/link';
import { careers, pathways, subTracks } from '@/lib/career-data';
import { PathwayCard } from '@/components/PathwayCard';
import { CareerCard } from '@/components/CareerCard';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { ArrowRight, Sparkles, BookOpen, Target } from 'lucide-react';

// Pick featured careers: mix of high-growth from different pathways
function getFeaturedCareers() {
  const featured = [];
  const pathwayCodes = ['A', 'B', 'C'];
  for (const code of pathwayCodes) {
    const pathwayCareers = careers.filter(c => c.pathwayCode === code && c.growthOutlook === 'High');
    const shuffled = pathwayCareers.slice(0, 2);
    featured.push(...shuffled);
  }
  return featured;
}

export default function HomePage() {
  const featuredCareers = getFeaturedCareers();

  const pathwayData = pathways.map(p => ({
    pathway: p,
    careerCount: careers.filter(c => c.pathwayCode === p.code).length,
    subTrackNames: subTracks.filter(st => st.pathwayCode === p.code).map(st => st.name),
    subTrackCount: subTracks.filter(st => st.pathwayCode === p.code).length,
  }));

  const stats = [
    { value: '1,252', label: 'Careers' },
    { value: '3', label: 'Pathways' },
    { value: '9', label: 'Sub-Tracks' },
    { value: '34', label: 'Subjects' },
  ];

  const steps = [
    { icon: BookOpen, title: 'Choose Your Pathway', desc: 'Select from STEM, Arts & Sports, or Social Sciences based on your interests.', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: Target, title: 'Pick Your Subjects', desc: 'Select the subjects you study to narrow down careers that match your studies.', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: Sparkles, title: 'Discover Careers', desc: 'View ranked career matches with salary info, growth outlook, and university requirements.', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          {/* Flag stripe accent */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-1 rounded-full overflow-hidden h-2 w-48">
              <div className="flex-1 bg-black" />
              <div className="flex-1" style={{ background: '#BB0000' }} />
              <div className="flex-1 bg-white" />
              <div className="flex-1" style={{ background: '#006600' }} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight animate-fade-in">
            Discover Your Future
            <br />
            <span style={{ color: '#F59E0B' }}>Career Path</span>
          </h1>

          <p className="text-xl text-white/80 mb-2 italic font-medium">
            Gundua Njia Yako ya Kazi
          </p>
          <p className="text-base text-white/70 mb-10 max-w-2xl mx-auto">
            The most comprehensive CBC career guidance platform for Kenyan students.
            Match your subjects to 1,252 careers across all three pathways.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchAutocomplete
              careers={careers}
              placeholder="Search 1,252 careers — e.g. Doctor, Software Engineer, Teacher..."
            />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/matcher"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-2xl transition-transform hover:scale-105"
              style={{ background: '#006600' }}
            >
              Start Career Matching <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/subjects"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white/20 text-white text-lg border-2 border-white/40 hover:bg-white/30 transition-colors"
            >
              Explore by Subject
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pathway Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
            Explore the 3 CBC Pathways
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Kenya&apos;s Competency Based Curriculum offers three distinct pathways, each leading to rewarding careers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pathwayData.map(({ pathway, careerCount, subTrackNames, subTrackCount }) => (
            <PathwayCard
              key={pathway.code}
              pathway={pathway}
              careerCount={careerCount}
              subTrackCount={subTrackCount}
              subTrackNames={subTrackNames}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-3">
              How It Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Find your perfect career in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 relative`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/matcher"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-transform hover:scale-105"
              style={{ background: '#006600' }}
            >
              Start Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Careers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-1">
              Featured Careers
            </h2>
            <p className="text-slate-500 dark:text-slate-400">High-growth careers across all pathways</p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1 text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCareers.slice(0, 6).map((career, i) => (
            <CareerCard key={career.id} career={career} index={i} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #000000, #006600)' }}>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Find Your Career Match?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Answer a few questions about your pathway and subjects — we&apos;ll show you the best matching careers from 1,252 options.
          </p>
          <Link
            href="/matcher"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white shadow-2xl transition-transform hover:scale-105"
            style={{ background: '#BB0000' }}
          >
            <Sparkles className="w-6 h-6" />
            Find Your Career Match
          </Link>
        </div>
      </section>
    </div>
  );
}
