'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIdeasStore } from '@/store/ideasStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function IdeaDetailPage({ params }: { params: { ideaId: string } }) {
  const router = useRouter();
  const { currentIdea, setCurrentIdea, addExpansion } = useIdeasStore();
  const { userProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'expansion' | 'criticalities' | 'opportunities'>('expansion');
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    setCurrentIdea(params.ideaId);
  }, [params.ideaId, setCurrentIdea]);

  if (!currentIdea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading idea...</p>
        </div>
      </div>
    );
  }

  const handleExpand = async (direction: string, prompt: string) => {
    setIsExpanding(true);
    try {
      await addExpansion(currentIdea.ideaId, direction, prompt);
    } catch (error) {
      console.error('Failed to expand:', error);
    } finally {
      setIsExpanding(false);
    }
  };

  // Mock expansion directions (in production, these come from AI)
  const mockDirections = [
    {
      title: 'Technical Implementation',
      description: 'Explore how to build this idea',
      prompt: 'What technical approaches could make this idea a reality?'
    },
    {
      title: 'Market Application',
      description: 'Consider target audience and use cases',
      prompt: 'Who would benefit from this idea and how?'
    },
    {
      title: 'User Experience',
      description: 'Design the user interaction',
      prompt: 'How would users interact with this idea?'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Document Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-4">
                    {currentIdea.originalIdea.text}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {currentIdea.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: currentIdea.document.summary.replace(/\n/g, '<br />') }} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Explore More
            </span>
          </div>
        </div>

        {/* Exploration Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger
                active={activeTab === 'expansion'}
                onClick={() => setActiveTab('expansion')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Expansion
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === 'criticalities'}
                onClick={() => setActiveTab('criticalities')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Criticalities
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === 'opportunities'}
                onClick={() => setActiveTab('opportunities')}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Opportunities
              </TabsTrigger>
            </TabsList>

            {/* Expansion Tab */}
            {activeTab === 'expansion' && (
              <TabsContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore different angles and develop your idea further
                  </p>

                  {/* Existing Expansions */}
                  {currentIdea.exploration.expansionPrompts.map((expansion, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-lg">{expansion.direction}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{expansion.content}</p>
                      </CardContent>
                    </Card>
                  ))}

                  {/* New Expansion Directions */}
                  {mockDirections
                    .filter(dir =>
                      !currentIdea.exploration.expansionPrompts.some(
                        exp => exp.direction === dir.title
                      )
                    )
                    .map((direction, idx) => (
                      <Card
                        key={idx}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => !isExpanding && handleExpand(direction.title, direction.prompt)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">{direction.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {direction.description}
                          </p>
                          <p className="text-xs text-primary italic">
                            {direction.prompt}
                          </p>
                        </CardContent>
                      </Card>
                    ))}

                  {isExpanding && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">
                          AI is generating content...
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Criticalities Tab */}
            {activeTab === 'criticalities' && (
              <TabsContent>
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Criticality analysis coming soon. This will help identify potential challenges and obstacles.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Opportunities Tab */}
            {activeTab === 'opportunities' && (
              <TabsContent>
                <Card>
                  <CardContent className="p-8 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Opportunity analysis coming soon. This will highlight potential benefits and applications.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
