import { create } from 'zustand';
import type { Idea, Tag, ExpansionPrompt, Criticality, Opportunity } from '@/types';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite';
import { useAuthStore } from './authStore';

interface IdeasState {
  ideas: Idea[];
  currentIdea: Idea | null;
  isLoading: boolean;

  // Actions
  fetchIdeas: () => Promise<void>;
  createIdea: (text: string, context?: any) => Promise<Idea>;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (ideaId: string) => Promise<void>;
  setCurrentIdea: (ideaId: string | null) => void;
  addExpansion: (ideaId: string, direction: string, prompt: string) => Promise<void>;
  addCriticality: (ideaId: string, category: string, content: string) => Promise<void>;
  addOpportunity: (ideaId: string, type: string, content: string) => Promise<void>;
  updateCriticalityStatus: (ideaId: string, criticalityIndex: number, status: 'real_concern' | 'manageable' | 'not_applicable') => Promise<void>;
  updateDocument: (ideaId: string) => Promise<void>;
}

export const useIdeasStore = create<IdeasState>((set, get) => ({
  ideas: [],
  currentIdea: null,
  isLoading: false,

  fetchIdeas: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ isLoading: true });
      const { Query } = await import('appwrite');
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(1000) // Adjust based on expected max ideas per user
        ]
      );

      // Parse JSON strings back to objects
      const ideas = response.documents.map(doc => ({
        ideaId: doc.ideaId,
        userId: doc.userId,
        originalIdea: JSON.parse(doc.originalIdea as string),
        tags: JSON.parse(doc.tags as string),
        exploration: JSON.parse(doc.exploration as string),
        document: JSON.parse(doc.document as string),
        connections: JSON.parse(doc.connections as string),
        metadata: JSON.parse(doc.metadata as string)
      })) as Idea[];

      set({
        ideas,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching ideas:', error);
      set({ isLoading: false });
    }
  },

  createIdea: async (text: string, userTags: string[] = [], context?: any) => {
    const { user, userProfile } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    try {
      set({ isLoading: true });

      // Generate tags using AI
      const existingTags = get().ideas
        .flatMap(idea => idea.tags.map((t: { name: string }) => t.name))
        .filter((tag: string, idx: number, arr: string[]) => arr.indexOf(tag) === idx); // unique

      const tagsResponse = await fetch('/api/ai/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: text,
          userProfile: userProfile || undefined,
          existingTags
        })
      });

      const { tags: aiTags } = await tagsResponse.json();

      // Combine user tags and AI tags
      const allTags = [
        ...userTags.map(tag => ({
          name: tag,
          source: 'user' as const,
          confidence: 1.0
        })),
        ...aiTags
          .filter((tag: string) => !userTags.includes(tag))
          .map((tag: string) => ({
            name: tag,
            source: 'ai' as const,
            confidence: 0.8
          }))
      ];

      const now = new Date().toISOString();
      const newIdea: Idea = {
        ideaId: ID.unique(),
        userId: user.$id,
        originalIdea: {
          text,
          capturedAt: now,
          context: {
            timeOfDay: new Date().toLocaleTimeString(),
            ...context
          }
        },
        tags: allTags,
        exploration: {
          expansionPrompts: [],
          criticalities: [],
          opportunities: []
        },
        document: {
          summary: `# ${text}\n\n## Original Idea\n${text}`,
          lastGenerated: now,
          sectionsCount: 0,
          userEditedSections: []
        },
        connections: [],
        metadata: {
          createdAt: now,
          updatedAt: now,
          explorationsCount: 0,
          viewCount: 0
        }
      };

      // Generate initial exploration directions (optional, can be done later)
      // const directionsResponse = await fetch('/api/ai/generate-directions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ideaText: text,
      //     userProfile: userProfile || undefined
      //   })
      // });
      // const { directions } = await directionsResponse.json();

      // Save to database - flatten nested objects for Appwrite
      const documentData = {
        ideaId: newIdea.ideaId,
        userId: newIdea.userId,
        originalIdea: JSON.stringify(newIdea.originalIdea),
        tags: JSON.stringify(newIdea.tags),
        exploration: JSON.stringify(newIdea.exploration),
        document: JSON.stringify(newIdea.document),
        connections: JSON.stringify(newIdea.connections),
        metadata: JSON.stringify(newIdea.metadata)
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        newIdea.ideaId,
        documentData
      );

      set(state => ({
        ideas: [newIdea, ...state.ideas],
        isLoading: false
      }));

      return newIdea;
    } catch (error) {
      console.error('Error creating idea:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateIdea: async (ideaId: string, updates: Partial<Idea>) => {
    try {
      const updatedIdea = {
        ...updates,
        metadata: {
          ...updates.metadata,
          updatedAt: new Date().toISOString()
        }
      };

      // Flatten nested objects for Appwrite
      const documentData: any = {};
      if (updates.originalIdea) documentData.originalIdea = JSON.stringify(updates.originalIdea);
      if (updates.tags) documentData.tags = JSON.stringify(updates.tags);
      if (updates.exploration) documentData.exploration = JSON.stringify(updates.exploration);
      if (updates.document) documentData.document = JSON.stringify(updates.document);
      if (updates.connections) documentData.connections = JSON.stringify(updates.connections);
      if (updatedIdea.metadata) documentData.metadata = JSON.stringify(updatedIdea.metadata);

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        documentData
      );

      set(state => ({
        ideas: state.ideas.map(idea =>
          idea.ideaId === ideaId ? { ...idea, ...updatedIdea } as Idea : idea
        ),
        currentIdea: state.currentIdea?.ideaId === ideaId
          ? { ...state.currentIdea, ...updatedIdea } as Idea
          : state.currentIdea
      }));
    } catch (error) {
      console.error('Error updating idea:', error);
      throw error;
    }
  },

  deleteIdea: async (ideaId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId
      );

      set(state => ({
        ideas: state.ideas.filter(idea => idea.ideaId !== ideaId),
        currentIdea: state.currentIdea?.ideaId === ideaId ? null : state.currentIdea
      }));
    } catch (error) {
      console.error('Error deleting idea:', error);
      throw error;
    }
  },

  setCurrentIdea: (ideaId: string | null) => {
    if (!ideaId) {
      set({ currentIdea: null });
      return;
    }

    const idea = get().ideas.find(i => i.ideaId === ideaId);
    if (idea) {
      // Increment view count
      const updatedIdea = {
        ...idea,
        metadata: {
          ...idea.metadata,
          viewCount: idea.metadata.viewCount + 1
        }
      };

      get().updateIdea(ideaId, updatedIdea);
      set({ currentIdea: updatedIdea });
    }
  },

  addExpansion: async (ideaId: string, direction: string, prompt: string) => {
    const idea = get().ideas.find(i => i.ideaId === ideaId);
    if (!idea) return;

    const { userProfile } = useAuthStore.getState();

    try {
      // Generate expansion content
      const response = await fetch('/api/ai/expand-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaText: idea.originalIdea.text,
          direction,
          directionPrompt: prompt,
          userProfile: userProfile || undefined
        })
      });

      const { content } = await response.json();

      const newExpansion: ExpansionPrompt = {
        direction,
        content,
        editedByUser: false,
        exploredAt: new Date().toISOString()
      };

      const updatedIdea = {
        ...idea,
        exploration: {
          ...idea.exploration,
          expansionPrompts: [...idea.exploration.expansionPrompts, newExpansion]
        },
        metadata: {
          ...idea.metadata,
          explorationsCount: idea.metadata.explorationsCount + 1
        }
      };

      await get().updateIdea(ideaId, updatedIdea);

      // Update document summary
      await get().updateDocument(ideaId);
    } catch (error) {
      console.error('Error adding expansion:', error);
      throw error;
    }
  },

  addCriticality: async (ideaId: string, category: string, content: string) => {
    const idea = get().ideas.find(i => i.ideaId === ideaId);
    if (!idea) return;

    const newCriticality: Criticality = {
      category,
      content,
      status: 'real_concern',
      exploredAt: new Date().toISOString()
    };

    const updatedIdea = {
      ...idea,
      exploration: {
        ...idea.exploration,
        criticalities: [...idea.exploration.criticalities, newCriticality]
      },
      metadata: {
        ...idea.metadata,
        explorationsCount: idea.metadata.explorationsCount + 1
      }
    };

    await get().updateIdea(ideaId, updatedIdea);
    await get().updateDocument(ideaId);
  },

  addOpportunity: async (ideaId: string, type: string, content: string) => {
    const idea = get().ideas.find(i => i.ideaId === ideaId);
    if (!idea) return;

    const newOpportunity: Opportunity = {
      type,
      content,
      exploredAt: new Date().toISOString()
    };

    const updatedIdea = {
      ...idea,
      exploration: {
        ...idea.exploration,
        opportunities: [...idea.exploration.opportunities, newOpportunity]
      },
      metadata: {
        ...idea.metadata,
        explorationsCount: idea.metadata.explorationsCount + 1
      }
    };

    await get().updateIdea(ideaId, updatedIdea);
    await get().updateDocument(ideaId);
  },

  updateCriticalityStatus: async (
    ideaId: string,
    criticalityIndex: number,
    status: 'real_concern' | 'manageable' | 'not_applicable'
  ) => {
    const idea = get().ideas.find(i => i.ideaId === ideaId);
    if (!idea || !idea.exploration.criticalities[criticalityIndex]) return;

    const updatedCriticalities = [...idea.exploration.criticalities];
    updatedCriticalities[criticalityIndex] = {
      ...updatedCriticalities[criticalityIndex],
      status
    };

    const updatedIdea = {
      ...idea,
      exploration: {
        ...idea.exploration,
        criticalities: updatedCriticalities
      }
    };

    await get().updateIdea(ideaId, updatedIdea);
  },

  updateDocument: async (ideaId: string) => {
    const idea = get().ideas.find(i => i.ideaId === ideaId);
    if (!idea) return;

    try {
      // Collect all explored content
      const exploredContent: { section: string; content: string }[] = [];

      idea.exploration.expansionPrompts.forEach((exp, idx) => {
        exploredContent.push({
          section: `Expansion: ${exp.direction}`,
          content: exp.content
        });
      });

      idea.exploration.criticalities.forEach((crit, idx) => {
        exploredContent.push({
          section: `Criticality: ${crit.category}`,
          content: crit.content
        });
      });

      idea.exploration.opportunities.forEach((opp, idx) => {
        exploredContent.push({
          section: `Opportunity: ${opp.type}`,
          content: opp.content
        });
      });

      // Generate new summary
      const response = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalIdea: idea.originalIdea.text,
          exploredContent
        })
      });

      const { summary } = await response.json();

      const updatedDocument = {
        ...idea.document,
        summary,
        lastGenerated: new Date().toISOString(),
        sectionsCount: exploredContent.length
      };

      await get().updateIdea(ideaId, {
        ...idea,
        document: updatedDocument
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}));
