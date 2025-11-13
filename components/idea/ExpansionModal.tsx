'use client';

import { useState, useEffect } from 'react';
import { X, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: string;
  content: string;
  isGenerating: boolean;
  onApply: (editedContent: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
}

export function ExpansionModal({
  isOpen,
  onClose,
  direction,
  content,
  isGenerating,
  onApply,
  onRegenerate
}: ExpansionModalProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await onApply(editedContent);
      onClose();
    } catch (error) {
      console.error('Failed to apply expansion:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRegenerate = async () => {
    await onRegenerate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">{direction}</h2>
              <p className="text-sm text-muted-foreground">
                Review and edit the AI-generated content before adding it to your idea
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isGenerating || isApplying}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">AI is generating content...</p>
            </div>
          ) : (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm resize-none"
              placeholder="Content will appear here..."
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={isGenerating || isApplying}
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isGenerating || isApplying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={isGenerating || isApplying || !editedContent.trim()}
            >
              {isApplying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Apply to Document
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
