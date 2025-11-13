'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Circle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Criticality } from '@/types';
import { MarkdownEditor } from './MarkdownEditor';

interface CriticalityCardProps {
  criticality: Criticality;
  onUpdate: (updatedCriticality: Criticality) => Promise<void>;
  onRegenerate?: () => Promise<void>;
}

const statusConfig = {
  real_concern: {
    label: 'Real Concern',
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  manageable: {
    label: 'Manageable',
    icon: CheckCircle2,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  not_applicable: {
    label: 'Not Applicable',
    icon: XCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  }
};

export function CriticalityCard({ criticality, onUpdate, onRegenerate }: CriticalityCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const config = statusConfig[criticality.status];
  const StatusIcon = config.icon;

  const handleStatusChange = async (newStatus: Criticality['status']) => {
    setIsUpdating(true);
    try {
      await onUpdate({
        ...criticality,
        status: newStatus
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContentUpdate = async (newContent: string) => {
    await onUpdate({
      ...criticality,
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
    <Card className={`${config.borderColor} border-2 transition-all`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className={`${config.bgColor} p-2 rounded-lg shrink-0`}>
              <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg mb-2 truncate">{criticality.category}</CardTitle>
              <Badge variant="outline" className={`${config.color} text-xs`}>
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
            content={criticality.content}
            onSave={handleContentUpdate}
            isAIGenerated={!criticality.editedByUser}
          />
          
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Update Status:</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(statusConfig) as Array<Criticality['status']>).map((status) => {
                const statusCfg = statusConfig[status];
                const StatusBtnIcon = statusCfg.icon;
                return (
                  <Button
                    key={status}
                    variant={criticality.status === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating || criticality.status === status}
                    className="text-xs"
                  >
                    <StatusBtnIcon className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{statusCfg.label}</span>
                    <span className="sm:hidden">{statusCfg.label.split(' ')[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
