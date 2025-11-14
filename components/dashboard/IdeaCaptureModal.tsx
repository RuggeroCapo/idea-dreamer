'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      await onSubmit(text, tags);
      handleClose();
    } catch (error) {
      console.error('Error submitting idea:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setText('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
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
            initial={{ opacity: 0, scale: 0.95, y: 20, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, rotate: 2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <div className="relative">
              {/* Washi tape decoration at top */}
              <div className="absolute -top-4 left-1/4 w-32 h-8 bg-gradient-to-r from-amber-300/70 to-amber-400/70 border-y border-amber-400/50 shadow-sm z-10 -rotate-2"></div>
              <div className="absolute -top-4 right-1/4 w-24 h-8 bg-gradient-to-r from-rose-300/70 to-rose-400/70 border-y border-rose-400/50 shadow-sm z-10 rotate-3"></div>

              {/* Paper card */}
              <Card className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm border-2 border-gray-200/50 relative overflow-hidden">
                {/* Paper texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a574' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'var(--font-title)' }}>
                        New Entry
                      </h2>
                      <div className="h-0.5 w-16 bg-gradient-to-r from-amber-400 to-transparent mt-1"></div>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                      disabled={isProcessing}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-2">
                        <span className="text-amber-500">✍️</span>
                        What's on your mind?
                      </label>
                      <Textarea
                        placeholder="Write your thoughts here..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="min-h-[140px] resize-none bg-amber-50/30 border-2 border-gray-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-lg transition-all"
                        autoFocus
                        disabled={isProcessing}
                        style={{ fontFamily: 'var(--font-sans)' }}
                      />
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-gray-500">
                          {text.length} characters
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700 flex items-center gap-2">
                        <span className="text-blue-500">🏷️</span>
                        Tags (Optional)
                      </label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add a tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          disabled={isProcessing}
                          className="bg-blue-50/30 border-2 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={addTag}
                          disabled={!tagInput.trim() || isProcessing}
                          className="border-2 hover:bg-blue-50 rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-lg border border-dashed border-gray-300">
                          {tags.map(tag => (
                            <span
                              key={tag}
                              onClick={() => removeTag(tag)}
                              className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-xs font-medium border border-blue-300/50 hover:from-blue-200 hover:to-blue-300 transition-all shadow-sm flex items-center gap-1"
                            >
                              #{tag}
                              <X className="h-3 w-3" />
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        ✨ AI will suggest more tags after saving
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={!text.trim() || isProcessing}
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all rounded-full py-6 text-base font-semibold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving to journal...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">📝</span>
                          Save Entry
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Decorative corner dots */}
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-30">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
