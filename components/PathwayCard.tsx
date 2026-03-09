'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FlaskConical, Palette, Globe } from 'lucide-react';
import type { Pathway } from '@/lib/career-data';

interface PathwayCardProps {
  pathway: Pathway;
  careerCount: number;
  subTrackCount: number;
  subTrackNames?: string[];
  featured?: boolean;
}

function PathwayIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon === 'flask-conical') return <FlaskConical className={className} />;
  if (icon === 'palette') return <Palette className={className} />;
  return <Globe className={className} />;
}

export function PathwayCard({ pathway, careerCount, subTrackCount, subTrackNames = [], featured = false }: PathwayCardProps) {
  const gradientClass =
    pathway.code === 'A' ? 'pathway-a' :
    pathway.code === 'B' ? 'pathway-b' :
    'pathway-c';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link href={`/pathway/${pathway.code}`} className="block h-full">
        <div className={`${gradientClass} rounded-2xl p-6 h-full flex flex-col gap-4 text-white shadow-xl`}>
          {/* Icon + Badge */}
          <div className="flex items-start justify-between">
            <div className="p-3 bg-white/20 rounded-xl">
              <PathwayIcon icon={pathway.icon} className="w-8 h-8 text-white" />
            </div>
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {careerCount} careers
            </span>
          </div>

          {/* Name & Short Name */}
          <div>
            <p className="text-white/70 text-sm font-medium mb-1">Pathway {pathway.code}</p>
            <h3 className={`font-bold text-white leading-tight ${featured ? 'text-2xl' : 'text-xl'}`}>
              {pathway.shortName}
            </h3>
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm leading-relaxed line-clamp-3 flex-1">
            {pathway.description}
          </p>

          {/* Sub-tracks teaser */}
          {subTrackNames.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                {subTrackCount} Sub-tracks
              </p>
              <div className="flex flex-wrap gap-1.5">
                {subTrackNames.map(name => (
                  <span key={name} className="text-xs bg-white/15 text-white/90 px-2 py-0.5 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/20">
            <span className="text-sm font-semibold text-white">Explore Pathway</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
