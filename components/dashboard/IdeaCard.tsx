'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import type { Idea } from '@/types';
import { format } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

// Random rotation and colors for variety
const rotations = [-1, 0.5, -0.5, 1, -1.5, 0.8];
const washiColors = [
  'from-amber-200/60 to-amber-300/60 border-amber-400/40',
  'from-rose-200/60 to-rose-300/60 border-rose-400/40',
  'from-blue-200/60 to-blue-300/60 border-blue-400/40',
  'from-green-200/60 to-green-300/60 border-green-400/40',
  'from-purple-200/60 to-purple-300/60 border-purple-400/40',
  'from-pink-200/60 to-pink-300/60 border-pink-400/40',
];

const tagColors = [
  'bg-amber-100/80 text-amber-800 border-amber-300/50',
  'bg-rose-100/80 text-rose-800 border-rose-300/50',
  'bg-blue-100/80 text-blue-800 border-blue-300/50',
  'bg-green-100/80 text-green-800 border-green-300/50',
  'bg-purple-100/80 text-purple-800 border-purple-300/50',
  'bg-pink-100/80 text-pink-800 border-pink-300/50',
];

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  // Calculate exploration progress
  const totalExplorations =
    idea.exploration.expansionPrompts.length +
    idea.exploration.criticalities.length +
    idea.exploration.opportunities.length;

  // Get first few lines of summary for preview
  const summaryPreview = idea.document.summary
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .slice(0, 2)
    .join(' ')
    .substring(0, 120) + (idea.document.summary.length > 120 ? '...' : '');

  // Consistent random values based on idea ID
  const idHash = idea.ideaId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rotation = rotations[idHash % rotations.length];
  const washiColor = washiColors[idHash % washiColors.length];

  // Random delay for staggered animation
  const animationDelay = (idHash % 5) * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      whileHover={{ scale: 1.03, rotate: 0, y: -4, zIndex: 10 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: animationDelay
      }}
    >
      <div className="relative">
        {/* Washi tape at top */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-r ${washiColor} border-t border-b opacity-70 shadow-sm z-10`}></div>

        {/* Paper card */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/50 overflow-hidden">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          {/* Content */}
          <div className="relative p-5">
            {/* Date stamp in corner */}
            <div className="absolute top-3 right-3 text-xs text-gray-400 font-mono bg-gray-50/80 px-2 py-1 rounded border border-gray-200/50">
              {format(new Date(idea.metadata.createdAt), 'MMM dd')}
            </div>

            {/* Main idea text */}
            <div className="pr-16 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-3 leading-snug" style={{ fontFamily: 'var(--font-title)' }}>
                {idea.originalIdea.text}
              </h3>
            </div>

            {/* Summary preview with handwritten feel */}
            {summaryPreview && totalExplorations > 0 && (
              <div className="mb-4 pl-3 border-l-2 border-gray-300/50">
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {summaryPreview}
                </p>
              </div>
            )}

            {/* Tags as stickers */}
            {idea.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {idea.tags.slice(0, 3).map((tag, idx) => {
                  const tagColor = tagColors[(idHash + idx) % tagColors.length];
                  return (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-full border ${tagColor} font-medium shadow-sm`}
                    >
                      #{tag.name}
                    </span>
                  );
                })}
                {idea.tags.length > 3 && (
                  <span className="text-xs px-2.5 py-1 rounded-full border bg-gray-100/80 text-gray-600 border-gray-300/50 font-medium">
                    +{idea.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Exploration badge */}
            {totalExplorations > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{totalExplorations} explorations</span>
                </div>
              </div>
            )}

            {/* Corner fold effect */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-transparent via-gray-100/50 to-gray-200/80 transform rotate-0 origin-bottom-right opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Decorative dots in corner */}
          <div className="absolute bottom-2 left-2 flex gap-1 opacity-40">
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
