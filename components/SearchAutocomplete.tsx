'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import type { Career } from '@/lib/career-data';
import { createSearchIndex } from '@/lib/search';

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  careers: Career[];
  className?: string;
}

export default function SearchAutocomplete({ placeholder = 'Search 1,252 careers...', onSearch, careers, className = '' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Career[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fuseRef = useRef<ReturnType<typeof createSearchIndex> | null>(null);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    if (!fuseRef.current) fuseRef.current = createSearchIndex(careers);
    const results = fuseRef.current.search(q, { limit: 8 }).map(r => r.item);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setActiveIndex(-1);
  }, [careers]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        router.push(`/career/${suggestions[activeIndex].id}`);
        setIsOpen(false);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        onSearch?.(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  }

  function handleSuggestionClick(career: Career) {
    setIsOpen(false);
    setQuery('');
    router.push(`/career/${career.id}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      onSearch?.(query.trim());
    }
  }

  function clearQuery() {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && suggestions.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-14 py-4 text-base rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-green-500 dark:focus:border-green-400 shadow-lg transition-all"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="absolute right-3 p-2 rounded-xl text-white transition-colors"
              style={{ background: '#006600' }}
              aria-label="Search careers"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {suggestions.map((career, i) => (
            <button
              key={career.id}
              type="button"
              onClick={() => handleSuggestionClick(career)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                i === activeIndex
                  ? 'bg-green-50 dark:bg-green-900/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700'
              } ${i > 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{career.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{career.subjects.slice(0, 3).join(', ')}</p>
              </div>
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                career.pathwayCode === 'A' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                career.pathwayCode === 'B' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              }`}>
                {career.pathwayCode === 'A' ? 'STEM' : career.pathwayCode === 'B' ? 'Arts' : 'Social'}
              </span>
            </button>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-2">
            <button
              type="button"
              onClick={handleSubmit as unknown as React.MouseEventHandler}
              className="text-xs text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              See all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
