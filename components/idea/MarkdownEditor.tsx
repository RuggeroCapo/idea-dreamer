'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

const MarkdownPreview = dynamic(
  () => import('@uiw/react-markdown-preview'),
  { ssr: false }
);

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  isAIGenerated?: boolean;
  className?: string;
}

export function MarkdownEditor({
  content,
  onSave,
  isAIGenerated = false,
  className = '',
}: MarkdownEditorProps) {
  const [value, setValue] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUserEdited, setIsUserEdited] = useState(!isAIGenerated);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Update value when content prop changes
  useEffect(() => {
    setValue(content);
  }, [content]);

  // Auto-save functionality
  const autoSave = useCallback(async (newValue: string) => {
    if (newValue === content) return;

    setIsSaving(true);
    try {
      await onSave(newValue);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  // Handle value changes with debounced auto-save
  const handleChange = (newValue?: string) => {
    const updatedValue = newValue || '';
    setValue(updatedValue);
    setHasUnsavedChanges(true);
    setIsUserEdited(true);

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout (2 seconds after user stops typing)
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(updatedValue);
    }, 2000);
  };

  // Manual save
  const handleManualSave = async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    await autoSave(value);
  };

  // Toggle edit/preview mode
  const toggleMode = () => {
    if (isEditing && hasUnsavedChanges) {
      handleManualSave();
    }
    setIsEditing(!isEditing);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={toggleMode}
            className="text-xs sm:text-sm"
          >
            {isEditing ? (
              <>
                <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">View</span>
              </>
            ) : (
              <>
                <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Edit
              </>
            )}
          </Button>

          {isEditing && hasUnsavedChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              className="text-xs sm:text-sm"
            >
              <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Now'}</span>
              <span className="sm:hidden">Save</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground">Saving...</span>
          )}
          {!isSaving && !hasUnsavedChanges && isUserEdited && (
            <Badge variant="outline" className="text-xs">
              Edited
            </Badge>
          )}
          {!isSaving && !hasUnsavedChanges && !isUserEdited && (
            <Badge variant="secondary" className="text-xs">
              AI Generated
            </Badge>
          )}
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="border rounded-lg overflow-hidden">
        {isEditing ? (
          <div data-color-mode="light">
            <MDEditor
              value={value}
              onChange={handleChange}
              preview="edit"
              height={300}
              visibleDragbar={false}
              className="sm:h-[400px]"
            />
          </div>
        ) : (
          <div className="p-3 sm:p-4 min-h-[300px] sm:min-h-[400px] prose prose-sm sm:prose max-w-none">
            <MarkdownPreview
              source={value}
              style={{ background: 'transparent' }}
              wrapperElement={{
                'data-color-mode': 'light'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
