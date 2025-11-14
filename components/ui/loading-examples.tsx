/**
 * Loading Components Usage Examples
 * 
 * This file demonstrates how to use the loading screen and spinner components
 * in your application.
 */

'use client';

import { LoadingScreen } from './loading-screen';
import { LoadingSpinner } from './loading-spinner';

// Example 1: Full-screen loading (e.g., during app initialization)
export function AppLoadingExample() {
  return <LoadingScreen message="Preparing your journal..." />;
}

// Example 2: Full-screen loading with progress bar
export function AppLoadingWithProgressExample() {
  return (
    <LoadingScreen 
      message="Loading your ideas..." 
      showProgress={true}
    />
  );
}

// Example 3: Inline loading spinner (small)
export function InlineLoadingSmallExample() {
  return (
    <div className="p-4">
      <LoadingSpinner size="sm" message="Saving..." />
    </div>
  );
}

// Example 4: Inline loading spinner (medium)
export function InlineLoadingMediumExample() {
  return (
    <div className="p-8">
      <LoadingSpinner size="md" message="Generating ideas..." />
    </div>
  );
}

// Example 5: Inline loading spinner (large)
export function InlineLoadingLargeExample() {
  return (
    <div className="p-12">
      <LoadingSpinner size="lg" message="Processing your request..." />
    </div>
  );
}

// Example 6: Loading spinner without message
export function LoadingSpinnerNoMessageExample() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" />
    </div>
  );
}

// Example 7: Conditional loading in a component
export function ConditionalLoadingExample({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <div>
      <h1>Your Content Here</h1>
    </div>
  );
}

// Example 8: Loading state in a button
export function ButtonWithLoadingExample({ isLoading }: { isLoading: boolean }) {
  return (
    <button 
      disabled={isLoading}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2"
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? 'Saving...' : 'Save Idea'}
    </button>
  );
}

// Example 9: Loading overlay for a card
export function CardWithLoadingExample({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="relative bg-card rounded-lg p-6 min-h-[200px]">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading content..." />
        </div>
      )}
      <h2>Card Content</h2>
      <p>Your content here...</p>
    </div>
  );
}

// Example 10: Custom styled loading
export function CustomStyledLoadingExample() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-8 rounded-lg">
      <LoadingSpinner 
        size="lg" 
        message="Crafting your masterpiece..."
        className="py-12"
      />
    </div>
  );
}
