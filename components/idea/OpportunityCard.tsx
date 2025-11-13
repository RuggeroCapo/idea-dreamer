'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Opportunity } from '@/types';
import { MarkdownEditor } from './MarkdownEditor';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onUpdate: (updatedOpportunity: Opportunity) => Promise<void>;
  onRegenerate?: () => Promise<void>;
}

const typeConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  market: {
    icon: Target,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Market Opportunity'
  },
  technical: {
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Technical Advantage'
  },
  growth: {
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    label: 'Growth Potential'
  },
  default: {
    icon: Lightbulb,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Opportunity'
  }
};

export function OpportunityCard({ opportunity, onUpdate, onRegenerate }: OpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const config = typeConfig[opportunity.type.toLowerCase()] || typeConfig.default;
  const OpportunityIcon = config.icon;

  const handleContentUpdate = async (newContent: string) => {
    await onUpdate({
      ...opportunity,
      content: newContent,
      editedByUser: true
    });
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 transition-all hover:border-primary/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={`${config.bgColor} p-2 rounded-lg shrink-0`}>
              <OpportunityIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg mb-2 truncate">{opportunity.type}</CardTitle>
              <Badge variant="secondary" className={`${config.color} text-xs`}>
                {config.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="h-8 w-8 p-0"
                title="Regenerate"
              >
                {isRegenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <MarkdownEditor
            content={opportunity.content}
            onSave={handleContentUpdate}
            isAIGenerated={!opportunity.editedByUser}
          />
        </CardContent>
      )}
    </Card>
  );
}
