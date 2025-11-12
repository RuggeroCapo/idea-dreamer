import { create } from 'zustand';
import type { Idea, Tag, ExpansionPrompt, Criticality, Opportunity } from '@/types';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite';
import { generateTags, generateExplorationDirections, expandContent, generateDocumentSummary } from '@/lib/gemini';
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
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        // TODO: Add query to filter by userId
      );

      set({
        ideas: response.documents as unknown as Idea[],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching ideas:', error);
      set({ isLoading: false });
    }
  },

  createIdea: async (text: string, context?: any) => {
    const { user, userProfile } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');

    try {
      set({ isLoading: true });

      // Generate tags using AI
      const existingTags = get().ideas
        .flatMap(idea => idea.tags.map(t => t.name))
        .filter((tag, idx, arr) => arr.indexOf(tag) === idx); // unique

      const suggestedTags = await generateTags(
        text,
        userProfile || undefined,
        existingTags
      );

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
        tags: suggestedTags.map(tag => ({
          name: tag,
          source: 'ai' as const,
          confidence: 0.8
        })),
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

      // Generate initial exploration directions
      const directions = await generateExplorationDirections(
        text,
        userProfile || undefined
      );

      // Save to database
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        newIdea.ideaId,
        newIdea
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

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.IDEAS,
        ideaId,
        updatedIdea
      );

      set(state => ({
        ideas: state.ideas.map(idea =>
          idea.ideaId === ideaId ? { ...idea, ...updatedIdea } : idea
        ),
        currentIdea: state.currentIdea?.ideaId === ideaId
          ? { ...state.currentIdea, ...updatedIdea }
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
      const content = await expandContent(
        idea.originalIdea.text,
        direction,
        prompt,
        userProfile || undefined
      );

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
      const summary = await generateDocumentSummary(
        idea.originalIdea.text,
        exploredContent
      );

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
