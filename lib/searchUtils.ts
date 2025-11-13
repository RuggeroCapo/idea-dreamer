import type { Idea } from '@/types';

interface SearchResult {
  idea: Idea;
  score: number;
  matches: {
    field: string;
    snippet: string;
  }[];
}

/**
 * Smart search that searches across multiple fields with relevance scoring
 */
export function searchIdeas(ideas: Idea[], query: string): Idea[] {
  if (!query.trim()) return ideas;

  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const idea of ideas) {
    let score = 0;
    const matches: SearchResult['matches'] = [];

    // Search in original idea text (highest weight)
    const ideaText = idea.originalIdea.text.toLowerCase();
    const ideaMatches = searchTerms.filter(term => ideaText.includes(term)).length;
    if (ideaMatches > 0) {
      score += ideaMatches * 10;
      matches.push({
        field: 'idea',
        snippet: getSnippet(idea.originalIdea.text, searchTerms[0]),
      });
    }

    // Search in tags (high weight)
    const tagMatches = idea.tags.filter(tag =>
      searchTerms.some(term => tag.name.toLowerCase().includes(term))
    );
    if (tagMatches.length > 0) {
      score += tagMatches.length * 8;
      matches.push({
        field: 'tags',
        snippet: tagMatches.map(t => t.name).join(', '),
      });
    }

    // Search in document summary (medium weight)
    const summaryText = idea.document.summary.toLowerCase();
    const summaryMatches = searchTerms.filter(term => summaryText.includes(term)).length;
    if (summaryMatches > 0) {
      score += summaryMatches * 5;
      matches.push({
        field: 'summary',
        snippet: getSnippet(idea.document.summary, searchTerms[0]),
      });
    }

    // Search in expansions (medium weight)
    for (const expansion of idea.exploration.expansionPrompts) {
      const expansionText = `${expansion.direction} ${expansion.content}`.toLowerCase();
      const expansionMatches = searchTerms.filter(term => expansionText.includes(term)).length;
      if (expansionMatches > 0) {
        score += expansionMatches * 4;
        matches.push({
          field: 'expansion',
          snippet: getSnippet(expansion.content, searchTerms[0]),
        });
      }
    }

    // Search in criticalities (low weight)
    for (const criticality of idea.exploration.criticalities) {
      const criticalityText = `${criticality.category} ${criticality.content}`.toLowerCase();
      const criticalityMatches = searchTerms.filter(term => criticalityText.includes(term)).length;
      if (criticalityMatches > 0) {
        score += criticalityMatches * 3;
      }
    }

    // Search in opportunities (low weight)
    for (const opportunity of idea.exploration.opportunities) {
      const opportunityText = `${opportunity.type} ${opportunity.content}`.toLowerCase();
      const opportunityMatches = searchTerms.filter(term => opportunityText.includes(term)).length;
      if (opportunityMatches > 0) {
        score += opportunityMatches * 3;
      }
    }

    // Boost score for exact phrase matches
    if (ideaText.includes(query.toLowerCase())) {
      score += 20;
    }

    // Boost score for matches at the beginning
    if (ideaText.startsWith(query.toLowerCase())) {
      score += 15;
    }

    if (score > 0) {
      results.push({ idea, score, matches });
    }
  }

  // Sort by score (descending) and return ideas
  return results
    .sort((a, b) => b.score - a.score)
    .map(result => result.idea);
}

/**
 * Get a snippet of text around the search term
 */
function getSnippet(text: string, searchTerm: string, contextLength = 60): string {
  const lowerText = text.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerTerm);

  if (index === -1) return text.substring(0, contextLength) + '...';

  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(text.length, index + searchTerm.length + contextLength / 2);

  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Filter ideas based on filter options
 */
export function filterIdeas(
  ideas: Idea[],
  filters: {
    tags: string[];
    hasExplorations: boolean | null;
    dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  }
): Idea[] {
  let filtered = ideas;

  // Filter by tags
  if (filters.tags.length > 0) {
    filtered = filtered.filter(idea =>
      filters.tags.some(filterTag =>
        idea.tags.some(ideaTag => ideaTag.name === filterTag)
      )
    );
  }

  // Filter by exploration status
  if (filters.hasExplorations !== null) {
    filtered = filtered.filter(idea => {
      const hasExplorations =
        idea.exploration.expansionPrompts.length > 0 ||
        idea.exploration.criticalities.length > 0 ||
        idea.exploration.opportunities.length > 0;
      return hasExplorations === filters.hasExplorations;
    });
  }

  // Filter by date range
  if (filters.dateRange !== 'all') {
    const now = new Date();
    const ranges = {
      today: new Date(now.setHours(0, 0, 0, 0)),
      week: new Date(now.setDate(now.getDate() - 7)),
      month: new Date(now.setMonth(now.getMonth() - 1)),
      year: new Date(now.setFullYear(now.getFullYear() - 1)),
    };

    const cutoffDate = ranges[filters.dateRange];
    filtered = filtered.filter(idea =>
      new Date(idea.metadata.createdAt) >= cutoffDate
    );
  }

  return filtered;
}

/**
 * Sort ideas based on sort option
 */
export function sortIdeas(
  ideas: Idea[],
  sortBy: 'newest' | 'oldest' | 'most-explored' | 'most-viewed' | 'recently-updated'
): Idea[] {
  const sorted = [...ideas];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime()
      );
    case 'oldest':
      return sorted.sort((a, b) =>
        new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime()
      );
    case 'most-explored':
      return sorted.sort((a, b) =>
        b.metadata.explorationsCount - a.metadata.explorationsCount
      );
    case 'most-viewed':
      return sorted.sort((a, b) =>
        b.metadata.viewCount - a.metadata.viewCount
      );
    case 'recently-updated':
      return sorted.sort((a, b) =>
        new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime()
      );
    default:
      return sorted;
  }
}

/**
 * Get all unique tags from ideas
 */
export function extractUniqueTags(ideas: Idea[]): string[] {
  const tagSet = new Set<string>();
  ideas.forEach(idea => {
    idea.tags.forEach(tag => tagSet.add(tag.name));
  });
  return Array.from(tagSet).sort();
}
