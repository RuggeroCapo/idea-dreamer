'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, AlertTriangle, Lightbulb, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIdeasStore } from '@/store/ideasStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CustomExpansionPrompt } from '@/components/idea/CustomExpansionPrompt';
import { MarkdownEditor } from '@/components/idea/MarkdownEditor';
import { CriticalityCard } from '@/components/idea/CriticalityCard';
import { OpportunityCard } from '@/components/idea/OpportunityCard';
import { ExpansionModal } from '@/components/idea/ExpansionModal';
import type { Criticality, Opportunity } from '@/types';

export default function IdeaDetailPage({ params }: { params: Promise<{ ideaId: string }> }) {
  const { ideaId } = use(params);
  const router = useRouter();
  const { currentIdea, setCurrentIdea, deleteIdea } = useIdeasStore();
  const { userProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'expansion' | 'criticalities' | 'opportunities'>('expansion');

  const [isGeneratingCriticalities, setIsGeneratingCriticalities] = useState(false);
  const [isGeneratingOpportunities, setIsGeneratingOpportunities] = useState(false);
  const [aiDirections, setAiDirections] = useState<Array<{ title: string; description: string; prompt: string }>>([]);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [expansionModal, setExpansionModal] = useState<{
    isOpen: boolean;
    direction: string;
    prompt: string;
    content: string;
    isGenerating: boolean;
  }>({
    isOpen: false,
    direction: '',
    prompt: '',
    content: '',
    isGenerating: false
  });

  useEffect(() => {
    setCurrentIdea(ideaId);
  }, [ideaId, setCurrentIdea]);

  // Load AI-generated directions when idea loads
  useEffect(() => {
    const loadDirections = async () => {
      if (!currentIdea) return;

      setIsLoadingDirections(true);
      try {
        const response = await fetch('/api/ai/generate-directions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ideaText: currentIdea.originalIdea.text,
            userProfile
          })
        });

        if (!response.ok) throw new Error('Failed to generate directions');

        const data = await response.json();
        setAiDirections(data.directions || []);
      } catch (error) {
        console.error('Failed to load directions:', error);
        setAiDirections([]);
      } finally {
        setIsLoadingDirections(false);
      }
    };

    loadDirections();
  }, [currentIdea?.ideaId, userProfile]);

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
    // Open modal and start generating
    setExpansionModal({
      isOpen: true,
      direction,
      prompt,
      content: '',
      isGenerating: true
    });

    try {
      const response = await fetch('/api/ai/expand-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: currentIdea.originalIdea.text,
          direction,
          directionPrompt: prompt,
          userProfile
        })
      });

      if (!response.ok) throw new Error('Failed to expand content');

      const data = await response.json();

      setExpansionModal(prev => ({
        ...prev,
        content: data.content,
        isGenerating: false
      }));
    } catch (error) {
      console.error('Failed to expand:', error);
      setExpansionModal(prev => ({
        ...prev,
        isGenerating: false
      }));
    }
  };

  const handleApplyExpansion = async (editedContent: string) => {
    if (!currentIdea) return;

    // Check if we're editing an existing expansion
    const existingIndex = currentIdea.exploration.expansionPrompts.findIndex(
      exp => exp.direction === expansionModal.direction
    );

    let updatedExpansions;
    if (existingIndex >= 0) {
      // Update existing expansion
      updatedExpansions = [...currentIdea.exploration.expansionPrompts];
      updatedExpansions[existingIndex] = {
        ...updatedExpansions[existingIndex],
        content: editedContent,
        editedByUser: true
      };
    } else {
      // Add new expansion
      const newExpansion = {
        direction: expansionModal.direction,
        content: editedContent,
        exploredAt: new Date().toISOString(),
        editedByUser: true
      };
      updatedExpansions = [...currentIdea.exploration.expansionPrompts, newExpansion];
    }

    await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
      ...currentIdea,
      exploration: {
        ...currentIdea.exploration,
        expansionPrompts: updatedExpansions
      }
    });
  };

  const handleRegenerateInModal = async () => {
    setExpansionModal(prev => ({ ...prev, isGenerating: true, content: '' }));

    try {
      const response = await fetch('/api/ai/expand-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: currentIdea.originalIdea.text,
          direction: expansionModal.direction,
          directionPrompt: expansionModal.prompt,
          userProfile
        })
      });

      if (!response.ok) throw new Error('Failed to expand content');

      const data = await response.json();

      setExpansionModal(prev => ({
        ...prev,
        content: data.content,
        isGenerating: false
      }));
    } catch (error) {
      console.error('Failed to regenerate:', error);
      setExpansionModal(prev => ({
        ...prev,
        isGenerating: false
      }));
    }
  };



  const handleGenerateCriticalities = async () => {
    if (!currentIdea) return;

    setIsGeneratingCriticalities(true);
    try {
      const response = await fetch('/api/ai/generate-criticalities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: currentIdea.originalIdea.text,
          userProfile
        })
      });

      if (!response.ok) throw new Error('Failed to generate criticalities');

      const data = await response.json();

      const newCriticalities: Criticality[] = data.criticalities.map((c: any) => ({
        category: c.category,
        content: c.content,
        status: 'real_concern' as const,
        exploredAt: new Date().toISOString()
      }));

      await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
        ...currentIdea,
        exploration: {
          ...currentIdea.exploration,
          criticalities: [...currentIdea.exploration.criticalities, ...newCriticalities]
        }
      });
    } catch (error) {
      console.error('Failed to generate criticalities:', error);
    } finally {
      setIsGeneratingCriticalities(false);
    }
  };

  const handleGenerateOpportunities = async () => {
    if (!currentIdea) return;

    setIsGeneratingOpportunities(true);
    try {
      const response = await fetch('/api/ai/generate-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: currentIdea.originalIdea.text,
          userProfile
        })
      });

      if (!response.ok) throw new Error('Failed to generate opportunities');

      const data = await response.json();

      const newOpportunities: Opportunity[] = data.opportunities.map((o: any) => ({
        type: o.type,
        content: o.content,
        exploredAt: new Date().toISOString()
      }));

      await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
        ...currentIdea,
        exploration: {
          ...currentIdea.exploration,
          opportunities: [...currentIdea.exploration.opportunities, ...newOpportunities]
        }
      });
    } catch (error) {
      console.error('Failed to generate opportunities:', error);
    } finally {
      setIsGeneratingOpportunities(false);
    }
  };

  const handleUpdateCriticality = async (index: number, updatedCriticality: Criticality) => {
    if (!currentIdea) return;

    const updatedCriticalities = [...currentIdea.exploration.criticalities];
    updatedCriticalities[index] = updatedCriticality;

    await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
      ...currentIdea,
      exploration: {
        ...currentIdea.exploration,
        criticalities: updatedCriticalities
      }
    });
  };

  const handleUpdateOpportunity = async (index: number, updatedOpportunity: Opportunity) => {
    if (!currentIdea) return;

    const updatedOpportunities = [...currentIdea.exploration.opportunities];
    updatedOpportunities[index] = updatedOpportunity;

    await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
      ...currentIdea,
      exploration: {
        ...currentIdea.exploration,
        opportunities: updatedOpportunities
      }
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Ideas</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
                  await deleteIdea(ideaId);
                  router.push('/dashboard');
                }
              }}
              className="mb-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Delete Idea</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Main Document Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8 border-2">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">Main Document</span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 break-words">
                    {currentIdea.originalIdea.text}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {currentIdea.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <MarkdownEditor
                content={currentIdea.document.summary}
                onSave={async (newContent) => {
                  const updatedDocument = {
                    ...currentIdea.document,
                    summary: newContent,
                    userEditedSections: ['summary']
                  };
                  await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
                    ...currentIdea,
                    document: updatedDocument
                  });
                }}
                isAIGenerated={!currentIdea.document.userEditedSections.includes('summary')}
              />
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
            <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
              <TabsTrigger
                active={activeTab === 'expansion'}
                onClick={() => setActiveTab('expansion')}
                className="text-xs sm:text-sm"
              >
                <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Expansion</span>
                <span className="sm:hidden">Expand</span>
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === 'criticalities'}
                onClick={() => setActiveTab('criticalities')}
                className="text-xs sm:text-sm"
              >
                <AlertTriangle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Criticalities</span>
                <span className="sm:hidden">Critical</span>
              </TabsTrigger>
              <TabsTrigger
                active={activeTab === 'opportunities'}
                onClick={() => setActiveTab('opportunities')}
                className="text-xs sm:text-sm"
              >
                <Lightbulb className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Opportunities</span>
                <span className="sm:hidden">Opport.</span>
              </TabsTrigger>
            </TabsList>

            {/* Expansion Tab */}
            {activeTab === 'expansion' && (
              <TabsContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore different angles and develop your idea further
                  </p>

                  {/* AI-Generated Suggested Directions - Prominent */}
                  {isLoadingDirections && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">
                          AI is generating exploration directions...
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {!isLoadingDirections && aiDirections.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="text-base sm:text-lg font-semibold">AI-Suggested Directions</h3>
                      </div>
                      {aiDirections
                        .filter(dir =>
                          !currentIdea.exploration.expansionPrompts.some(
                            exp => exp.direction === dir.title
                          )
                        )
                        .map((direction, idx) => (
                          <Card
                            key={idx}
                            className="cursor-pointer hover:border-primary hover:shadow-md transition-all border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                            onClick={() => handleExpand(direction.title, direction.prompt)}
                          >
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-start gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base sm:text-lg mb-1.5">{direction.title}</h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                    {direction.description}
                                  </p>
                                  <p className="text-xs sm:text-sm text-primary/80">
                                    "{direction.prompt}"
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}

                  {/* Applied Expansions */}
                  {currentIdea.exploration.expansionPrompts.length > 0 && (
                    <>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Applied to Document
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {currentIdea.exploration.expansionPrompts.map((expansion, idx) => (
                          <Card key={idx} className="bg-muted/30">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-1">{expansion.direction}</h4>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {expansion.content.substring(0, 150)}...
                                  </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Open in modal for editing
                                      setExpansionModal({
                                        isOpen: true,
                                        direction: expansion.direction,
                                        prompt: '',
                                        content: expansion.content,
                                        isGenerating: false
                                      });
                                    }}
                                    className="h-8 px-2 text-xs"
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Custom Expansion Prompt - Hidden in Accordion */}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomPrompt(!showCustomPrompt)}
                      className="w-full justify-between text-sm"
                    >
                      <span>Custom Direction</span>
                      <span className="text-xs text-muted-foreground">
                        {showCustomPrompt ? '▲' : '▼'}
                      </span>
                    </Button>

                    {showCustomPrompt && (
                      <div className="mt-3">
                        <CustomExpansionPrompt
                          onSubmit={handleExpand}
                          isLoading={false}
                        />
                      </div>
                    )}
                  </div>

                </div>
              </TabsContent>
            )}

            {/* Criticalities Tab */}
            {activeTab === 'criticalities' && (
              <TabsContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Identify potential challenges and obstacles for your idea
                    </p>
                    <Button
                      onClick={handleGenerateCriticalities}
                      disabled={isGeneratingCriticalities}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {isGeneratingCriticalities ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="hidden sm:inline">Generating...</span>
                          <span className="sm:hidden">Loading...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Generate Criticalities</span>
                          <span className="sm:hidden">Generate</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {currentIdea.exploration.criticalities.length === 0 && !isGeneratingCriticalities && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No criticalities identified yet. Generate an analysis to identify potential challenges.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {currentIdea.exploration.criticalities.map((criticality, idx) => (
                    <CriticalityCard
                      key={idx}
                      criticality={criticality}
                      onUpdate={(updated) => handleUpdateCriticality(idx, updated)}
                      onRegenerate={async () => {
                        const updatedCriticalities = currentIdea.exploration.criticalities.filter((_, i) => i !== idx);
                        await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
                          ...currentIdea,
                          exploration: {
                            ...currentIdea.exploration,
                            criticalities: updatedCriticalities
                          }
                        });
                        await handleGenerateCriticalities();
                      }}
                    />
                  ))}

                  {isGeneratingCriticalities && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">
                          AI is analyzing potential criticalities...
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Opportunities Tab */}
            {activeTab === 'opportunities' && (
              <TabsContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Discover potential benefits and applications for your idea
                    </p>
                    <Button
                      onClick={handleGenerateOpportunities}
                      disabled={isGeneratingOpportunities}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {isGeneratingOpportunities ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span className="hidden sm:inline">Generating...</span>
                          <span className="sm:hidden">Loading...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Generate Opportunities</span>
                          <span className="sm:hidden">Generate</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {currentIdea.exploration.opportunities.length === 0 && !isGeneratingOpportunities && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          No opportunities identified yet. Generate an analysis to discover potential benefits.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {currentIdea.exploration.opportunities.map((opportunity, idx) => (
                    <OpportunityCard
                      key={idx}
                      opportunity={opportunity}
                      onUpdate={(updated) => handleUpdateOpportunity(idx, updated)}
                      onRegenerate={async () => {
                        const updatedOpportunities = currentIdea.exploration.opportunities.filter((_, i) => i !== idx);
                        await useIdeasStore.getState().updateIdea(currentIdea.ideaId, {
                          ...currentIdea,
                          exploration: {
                            ...currentIdea.exploration,
                            opportunities: updatedOpportunities
                          }
                        });
                        await handleGenerateOpportunities();
                      }}
                    />
                  ))}

                  {isGeneratingOpportunities && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground">
                          AI is discovering opportunities...
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>

      {/* Expansion Modal */}
      <ExpansionModal
        isOpen={expansionModal.isOpen}
        onClose={() => setExpansionModal(prev => ({ ...prev, isOpen: false }))}
        direction={expansionModal.direction}
        content={expansionModal.content}
        isGenerating={expansionModal.isGenerating}
        onApply={handleApplyExpansion}
        onRegenerate={handleRegenerateInModal}
      />
    </div>
  );
}
