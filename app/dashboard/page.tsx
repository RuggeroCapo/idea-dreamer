'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useIdeasStore } from '@/store/ideasStore';
import { Button } from '@/components/ui/button';
import { IdeaCaptureModal } from '@/components/dashboard/IdeaCaptureModal';
import { IdeaCard } from '@/components/dashboard/IdeaCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, isLoading, logout } = useAuthStore();
  const { ideas, fetchIdeas, createIdea } = useIdeasStore();
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);

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

  const handleCreateIdea = async (text: string, tags: string[]) => {
    await createIdea(text);
  };

  const handleIdeaClick = (ideaId: string) => {
    router.push(`/idea/${ideaId}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Idea Dreamer
            </h1>
            {userProfile && (
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.name}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        {ideas.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No ideas yet</h2>
              <p className="text-muted-foreground mb-6">
                Start capturing your ideas and let AI help you develop them
              </p>
              <Button onClick={() => setIsCaptureModalOpen(true)} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Capture Your First Idea
              </Button>
            </motion.div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Ideas</h2>
              <p className="text-sm text-muted-foreground">
                {ideas.length} {ideas.length === 1 ? 'idea' : 'ideas'}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.ideaId}
                  idea={idea}
                  onClick={() => handleIdeaClick(idea.ideaId)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {ideas.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCaptureModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
        >
          <Plus className="w-6 h-6" />
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
