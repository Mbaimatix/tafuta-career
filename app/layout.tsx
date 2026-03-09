import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'TAFUTA CAREER | CBC Career Guidance for Kenyan Students',
  description: "Discover your ideal career path based on Kenya's CBC curriculum. Explore 1,252 careers across 3 pathways and 9 sub-tracks. Find careers matching your subjects with our interactive Career Matcher.",
  keywords: 'CBC Kenya, career guidance, STEM Kenya, pathway A, pathway B, pathway C, Kenyan students, career matcher',
  authors: [{ name: 'TAFUTA CAREER' }],
  openGraph: {
    title: 'TAFUTA CAREER | CBC Career Guidance for Kenyan Students',
    description: "Gundua Njia Yako ya Kazi — Discover your career path based on Kenya's CBC curriculum.",
    type: 'website',
    url: 'https://tafuta-career.vercel.app',
    images: [{ url: 'https://tafuta-career.vercel.app/og-image.png', width: 1200, height: 630, alt: 'TAFUTA CAREER' }],
    locale: 'en_KE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TAFUTA CAREER | CBC Career Guidance',
    description: "Discover your ideal career path based on Kenya's CBC curriculum.",
    images: ['https://tafuta-career.vercel.app/og-image.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#006600" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
