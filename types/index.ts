// User Profile Types
export interface UserProfile {
  userId: string;
  profile: {
    areasOfInterest: string[];
    professionalContext: {
      role: string;
      industry: string;
    };
    thinkingStyle: string;
    primaryUseCase: string;
    notificationPreferences: {
      enabled: boolean;
      frequency: string;
    };
  };
  preferences: {
    defaultTags: string[];
    ignoredCriticalities: string[];
    preferredExpansionTypes: string[];
  };
  createdAt: string;
  lastActive: string;
}

// Tag Types
export interface Tag {
  name: string;
  source: 'ai' | 'user';
  confidence?: number;
  color?: string;
}

export interface TagDefinition {
  tagId: string;
  name: string;
  category?: string;
  color: string;
  usageCount: number;
  createdAt: string;
  relatedTags: string[];
}

// Exploration Types
export interface ExpansionPrompt {
  direction: string;
  content: string;
  editedByUser: boolean;
  exploredAt: string;
}

export interface Criticality {
  category: string;
  content: string;
  status: 'real_concern' | 'manageable' | 'not_applicable';
  exploredAt: string;
  editedByUser?: boolean;
}

export interface Opportunity {
  type: string;
  content: string;
  exploredAt: string;
  editedByUser?: boolean;
}

export interface Exploration {
  expansionPrompts: ExpansionPrompt[];
  criticalities: Criticality[];
  opportunities: Opportunity[];
}

// Idea Types
export interface IdeaContext {
  location?: string;
  mood?: string;
  timeOfDay: string;
}

export interface OriginalIdea {
  text: string;
  capturedAt: string;
  context: IdeaContext;
}

export interface IdeaDocument {
  summary: string;
  lastGenerated: string;
  sectionsCount: number;
  userEditedSections: string[];
}

export interface IdeaConnection {
  targetIdeaId: string;
  strength: number;
  reason: string;
}

export interface IdeaMetadata {
  createdAt: string;
  updatedAt: string;
  explorationsCount: number;
  viewCount: number;
}

export interface Idea {
  ideaId: string;
  userId: string;
  originalIdea: OriginalIdea;
  tags: Tag[];
  exploration: Exploration;
  document: IdeaDocument;
  connections: IdeaConnection[];
  metadata: IdeaMetadata;
}

// AI Response Types
export interface AITagSuggestion {
  tags: string[];
  confidence: number[];
}

export interface AIExpansionDirection {
  title: string;
  description: string;
  prompt: string;
}

export interface AIExpansionResponse {
  directions: AIExpansionDirection[];
}

export interface AIContentExpansion {
  content: string;
  wordCount: number;
}

// UI State Types
export interface CaptureFormData {
  text: string;
  context?: {
    location?: string;
    mood?: string;
  };
}

export interface ExplorationTab {
  id: 'expansion' | 'criticalities' | 'opportunities';
  label: string;
  icon?: string;
}
