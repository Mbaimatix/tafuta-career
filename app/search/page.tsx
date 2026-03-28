'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { careers } from '@/lib/career-data';
import { searchCareers } from '@/lib/search';
import { CareerCard } from '@/components/CareerCard';
import { Search, X, SlidersHorizontal } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [pathwayFilter, setPathwayFilter] = useState('');
  const [sortMode, setSortMode] = useState<'relevance' | 'alpha'>('relevance');
  const [results, setResults] = useState(searchCareers(initialQuery, careers));
  const [visibleCount, setVisibleCount] = useState(60);

  const runSearch = useCallback((q: string) => {
    let found = searchCareers(q, careers);
    if (pathwayFilter) found = found.filter(c => c.pathwayCode === pathwayFilter);
    if (sortMode === 'alpha') found = [...found].sort((a, b) => a.name.localeCompare(b.name));
    setResults(found);
    setVisibleCount(60);
  }, [pathwayFilter, sortMode]);

  // Debounce: update query 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(inputValue);
      if (inputValue.trim()) {
        router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, router]);

  useEffect(() => {
    runSearch(query);
  }, [query, pathwayFilter, sortMode, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setQuery(inputValue);
    if (inputValue.trim()) router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
  }

  function clearQuery() {
    setInputValue('');
    setQuery('');
    router.push('/search', { scroll: false });
  }

  const pathwayLabels: Record<string, string> = { A: 'ROOT', B: 'Arts & Sports', C: 'Social' };

  return (
    <div className="min-h-screen">
      {/* Search header */}
      <section className="bg-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-black text-white mb-6 text-center">Search Careers</h1>
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search careers, subjects, or descriptions..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-base shadow-xl"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearQuery}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">Filter:</span>
          </div>
          {['', 'A', 'B', 'C'].map(code => (
            <button
              key={code || 'all'}
              type="button"
              onClick={() => setPathwayFilter(code)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                pathwayFilter === code
                  ? code === 'A' ? 'bg-green-600 border-green-600 text-white' :
                    code === 'B' ? 'bg-red-600 border-red-600 text-white' :
                    code === 'C' ? 'bg-purple-600 border-purple-600 text-white' :
                    'bg-slate-900 dark:bg-white border-transparent text-white dark:text-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {code ? `Pathway ${code} — ${pathwayLabels[code]}` : 'All Pathways'}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Sort:</span>
            <button
              type="button"
              onClick={() => setSortMode('relevance')}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                sortMode === 'relevance'
                  ? 'bg-slate-900 dark:bg-white border-transparent text-white dark:text-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Relevance
            </button>
            <button
              type="button"
              onClick={() => setSortMode('alpha')}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                sortMode === 'alpha'
                  ? 'bg-slate-900 dark:bg-white border-transparent text-white dark:text-slate-900'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              A–Z
            </button>
          </div>
        </div>

        {/* Results header */}
        <div className="mb-6">
          {query ? (
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              <strong className="text-slate-900 dark:text-slate-100">{results.length}</strong> result{results.length !== 1 ? 's' : ''} for{' '}
              <strong className="text-slate-900 dark:text-slate-100">&quot;{query}&quot;</strong>
              {pathwayFilter && ` in Pathway ${pathwayFilter}`}
            </p>
          ) : (
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Showing <strong className="text-slate-900 dark:text-slate-100">{results.length}</strong> careers
              {pathwayFilter ? ` in Pathway ${pathwayFilter}` : ' across all pathways'}
            </p>
          )}
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No results found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Try a different search term or remove filters.
            </p>
            <button
              type="button"
              onClick={() => { setPathwayFilter(''); setInputValue(''); setQuery(''); }}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.slice(0, visibleCount).map((career, i) => (
              <CareerCard key={career.id} career={career} index={i} />
            ))}
          </div>
        )}

        {results.length > visibleCount && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={() => setVisibleCount(v => v + 60)}
              className="px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-md"
            >
              Load More ({results.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Loading search...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
