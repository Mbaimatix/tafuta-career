import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output works well with Vercel
  // Remove if deploying to Vercel (Vercel auto-detects Next.js)
  // output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
