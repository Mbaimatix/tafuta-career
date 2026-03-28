'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ChevronDown,
  FlaskConical,
  Palette,
  Globe,
  Star,
} from 'lucide-react';
import { useProStatus } from '@/context/ProContext';
import ProUpgradeModal from '@/components/ProUpgradeModal';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/matcher', label: 'Career Matcher' },
  { href: '/about', label: 'About' },
];

const pathwayLinks = [
  { href: '/pathway/A', label: 'Pathway A — ROOT', icon: FlaskConical, color: 'text-green-600' },
  { href: '/pathway/B', label: 'Pathway B — Arts & Sports Science', icon: Palette, color: 'text-red-600' },
  { href: '/pathway/C', label: 'Pathway C — Social Sciences', icon: Globe, color: 'text-purple-600' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pathwaysOpen, setPathwaysOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { isPro } = useProStatus();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setPathwaysOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!pathwaysOpen) return;
    const handler = () => setPathwaysOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [pathwaysOpen]);

  const isHeroPage = pathname === '/';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHeroPage
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-200 dark:border-slate-700'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #006600, #BB0000)' }}>
              <span className="text-white text-xs font-black">TC</span>
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: '#006600' }}>
              TAFUTA CAREER
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Home
            </Link>

            {/* Pathways dropdown */}
            <div className="relative">
              <button
                onClick={() => setPathwaysOpen(!pathwaysOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/pathway')
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                Pathways
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${pathwaysOpen ? 'rotate-180' : ''}`} />
              </button>
              {pathwaysOpen && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  {pathwayLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Icon className={`w-4 h-4 ${link.color}`} />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {navLinks.slice(1).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* PRO upgrade nudge — hidden for existing PRO users */}
            {mounted && !isPro && (
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:opacity-90"
                style={{ background: '#F59E0B', color: 'white' }}
                aria-label="Upgrade to TAFUTA PRO"
              >
                <Star className="w-3.5 h-3.5" />
                Try PRO
              </button>
            )}
            {mounted && isPro && (
              <span
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: '#F59E0B20', color: '#B45309' }}
              >
                <Star className="w-3 h-3" /> PRO
              </span>
            )}

            <Link
              href="/search"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {mounted ? (
                theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link href="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              Home
            </Link>
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Pathways</p>
              {pathwayLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Icon className={`w-4 h-4 ${link.color}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {navLinks.slice(1).map(link => (
              <Link key={link.href} href={link.href} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                {link.label}
              </Link>
            ))}
            <Link href="/search" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Search className="w-4 h-4" />
              Search
            </Link>
            {/* Mobile PRO nudge */}
            {!isPro && (
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setProModalOpen(true); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-bold"
                style={{ color: '#B45309' }}
              >
                <Star className="w-4 h-4" style={{ color: '#F59E0B' }} />
                Upgrade to TAFUTA PRO
              </button>
            )}
          </div>
        </div>
      )}

      {/* PRO upgrade modal */}
      <ProUpgradeModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        triggerFeature="all TAFUTA PRO features"
      />
    </nav>
  );
}
