'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CustomExpansionPromptProps {
  onSubmit: (direction: string, prompt: string) => Promise<void>;
  isLoading?: boolean;
}

export function CustomExpansionPrompt({ onSubmit, isLoading = false }: CustomExpansionPromptProps) {
  const [direction, setDirection] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!direction.trim() || !prompt.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(direction.trim(), prompt.trim());
      // Clear form on success
      setDirection('');
      setPrompt('');
    } catch (error) {
      console.error('Failed to submit custom expansion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isLoading || isSubmitting || !direction.trim() || !prompt.trim();

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direction" className="text-xs sm:text-sm">
              Direction Title
            </Label>
            <Input
              id="direction"
              placeholder="e.g., Business Model, Technical Architecture..."
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              disabled={isLoading || isSubmitting}
              maxLength={100}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Give your exploration a clear, descriptive title
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-xs sm:text-sm">
              Custom Prompt
            </Label>
            <Textarea
              id="prompt"
              placeholder="What specific aspect would you like to explore?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading || isSubmitting}
              rows={3}
              maxLength={500}
              className="text-sm resize-none sm:rows-4"
            />
            <p className="text-xs text-muted-foreground">
              Describe what you want to explore about your idea
            </p>
          </div>

          <Button
            type="submit"
            disabled={isDisabled}
            className="w-full text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">Loading...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Explore This Direction</span>
                <span className="sm:hidden">Explore</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
