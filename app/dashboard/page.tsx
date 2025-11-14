'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useIdeasStore } from '@/store/ideasStore';
import { Button } from '@/components/ui/button';
import { IdeaCaptureModal } from '@/components/dashboard/IdeaCaptureModal';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { FilterSort, type SortOption, type FilterOptions } from '@/components/dashboard/FilterSort';
import { VirtualIdeaGrid } from '@/components/dashboard/VirtualIdeaGrid';
import { searchIdeas, filterIdeas, sortIdeas, extractUniqueTags } from '@/lib/searchUtils';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, isLoading, logout } = useAuthStore();
  const { ideas, fetchIdeas, createIdea, isLoading: isLoadingIdeas } = useIdeasStore();
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterOptions>({
    tags: [],
    hasExplorations: null,
    dateRange: 'all',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!userProfile) {
        router.push('/onboarding');
      } else {
        fetchIdeas();
      }
    }
  }, [isAuthenticated, user, userProfile, router, fetchIdeas]);

  // Process ideas: search, filter, and sort
  const processedIdeas = useMemo(() => {
    let result = ideas;

    // Apply search
    if (searchQuery.trim()) {
      result = searchIdeas(result, searchQuery);
    }

    // Apply filters
    result = filterIdeas(result, filters);

    // Apply sorting
    result = sortIdeas(result, sortBy);

    return result;
  }, [ideas, searchQuery, filters, sortBy]);

  // Extract available tags for filter dropdown
  const availableTags = useMemo(() => extractUniqueTags(ideas), [ideas]);

  const handleCreateIdea = async (text: string, tags: string[]) => {
    await createIdea(text, tags);
  };

  const handleIdeaClick = (ideaId: string) => {
    router.push(`/idea/${ideaId}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your ideas..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f9f7f3] relative overflow-hidden">
      {/* Decorative washi tape strips */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-amber-200/40 via-amber-300/40 to-amber-200/40 border-y border-amber-300/30 -rotate-1 transform origin-left"></div>
      {/* Header */}
      <header className="relative z-30 pt-12 pb-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-start justify-between">
            <div className="relative">
              <h1 className="text-5xl font-bold text-gray-800 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-title)' }}>
                My Idea Journal
              </h1>
              {/* Hand-drawn underline */}
              <svg className="absolute -bottom-1 left-0 w-full h-3" viewBox="0 0 300 10" preserveAspectRatio="none">
                <path d="M0,5 Q75,3 150,5 T300,5" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary/40" strokeLinecap="round" />
              </svg>
              {userProfile && (
                <p className="text-sm text-gray-600 mt-4">
                  ✨ {user.name}'s creative space
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="mt-2 hover:bg-amber-100/50 rounded-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="text-sm">Settings</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="mt-2 hover:bg-rose-100/50 rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-sm">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 max-w-6xl relative z-10">
        {isLoadingIdeas ? (
          <div className="text-center py-16">
            <LoadingSpinner size="lg" message="Gathering your thoughts..." />
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto relative"
            >
              {/* Decorative doodles */}
              <div className="absolute -top-8 -left-8 text-6xl opacity-20 rotate-12">✨</div>
              <div className="absolute -top-4 -right-8 text-5xl opacity-20 -rotate-12">💡</div>

              <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-2 border-dashed border-amber-300/50 transform -rotate-1">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-amber-300/50 shadow-inner">
                  <Plus className="w-10 h-10 text-amber-700" strokeWidth={2.5} />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gray-800" style={{ fontFamily: 'var(--font-title)' }}>
                  Your First Page
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Every great journal starts with a single entry. What's on your mind today?
                </p>
                <Button
                  onClick={() => setIsCaptureModalOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all rounded-full px-8"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Start Writing
                </Button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div>
            {/* Search and Filter Bar */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative">
                  <h2 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: 'var(--font-title)' }}>
                    Recent Entries
                  </h2>
                  {/* Decorative dots */}
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400/60"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60"></div>
                  </div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium">
                    {processedIdeas.length} of {ideas.length} {ideas.length === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search your journal..."
                  />
                </div>
                <FilterSort
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  filters={filters}
                  onFilterChange={setFilters}
                  availableTags={availableTags}
                />
              </div>
            </div>

            {/* Ideas Grid with Virtual Scrolling */}
            {processedIdeas.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block">
                  <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border-2 border-dashed border-gray-300/50 shadow-sm">
                    <p className="text-gray-600 mb-4 text-lg">
                      No entries match your search
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({
                          tags: [],
                          hasExplorations: null,
                          dateRange: 'all',
                        });
                      }}
                      className="rounded-full border-2 hover:bg-amber-50"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <VirtualIdeaGrid
                ideas={processedIdeas}
                onIdeaClick={handleIdeaClick}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button - Diary style */}
      {ideas.length > 0 && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCaptureModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl transition-all z-40 border-4 border-white"
          style={{
            boxShadow: '0 8px 20px rgba(251, 191, 36, 0.4), 0 0 0 4px rgba(255, 255, 255, 0.8)'
          }}
        >
          <Plus className="w-7 h-7" strokeWidth={3} />
        </motion.button>
      )}

      {/* Idea Capture Modal */}
      <IdeaCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onSubmit={handleCreateIdea}
      />
    </div>
  );
}
