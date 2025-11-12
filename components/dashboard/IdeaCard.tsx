'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Idea } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface IdeaCardProps {
  idea: Idea;
  onClick: () => void;
}

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
    .substring(0, 150) + (idea.document.summary.length > 150 ? '...' : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">
                {idea.originalIdea.text}
              </CardTitle>
              <CardDescription className="mt-1">
                {formatDistanceToNow(new Date(idea.metadata.createdAt), { addSuffix: true })}
              </CardDescription>
            </div>
            {totalExplorations > 0 && (
              <div className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-1">
                {totalExplorations} explored
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {summaryPreview && totalExplorations > 0 && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {summaryPreview}
            </p>
          )}
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {idea.tags.slice(0, 4).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {idea.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{idea.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
