'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, tags: string[]) => Promise<void>;
}

export function IdeaCaptureModal({ isOpen, onClose, onSubmit }: IdeaCaptureModalProps) {
  const [text, setText] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<'input' | 'tags'>('input');

  const handleInitialSubmit = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      // In a real app, this would call the AI to generate tags
      // For now, we'll just move to the tags stage
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuggestedTags(['Idea', 'Innovation', 'Concept']);
      setSelectedTags(['Idea', 'Innovation', 'Concept']);
      setStage('tags');
    } catch (error) {
      console.error('Error processing idea:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsProcessing(true);
    try {
      await onSubmit(text, selectedTags);
      handleClose();
    } catch (error) {
      console.error('Error submitting idea:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setText('');
    setSuggestedTags([]);
    setSelectedTags([]);
    setStage('input');
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <Card className="p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {stage === 'input' ? 'Capture Your Idea' : 'Confirm Tags'}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isProcessing}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {stage === 'input' && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's your idea? (50-200 characters recommended)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[120px] resize-none"
                    autoFocus
                    disabled={isProcessing}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {text.length} characters
                    </span>
                  </div>
                  <Button
                    onClick={handleInitialSubmit}
                    disabled={!text.trim() || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              )}

              {stage === 'tags' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">
                      We've suggested some tags. Click to toggle them or add your own.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestedTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setStage('input')}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Idea'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
