import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AITagSuggestion, AIExpansionDirection, UserProfile } from '@/types';
import { formatUserProfile, getComplexityGuidance, getUseCaseGuidance } from './promptUtils';

// Get API key from environment variable
const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.error('GOOGLE_GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Using Gemini 2.0 Flash for fast, cost-effective responses with latest features
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

/**
 * Generate tag suggestions for a new idea
 */
export async function generateTags(
  ideaText: string,
  userProfile?: UserProfile,
  existingTags: string[] = []
): Promise<string[]> {
  try {
    const profileContext = formatUserProfile(userProfile);
    
    const prompt = `
${profileContext}

Existing Tags Used: ${existingTags.join(', ') || 'None'}
New Idea: "${ideaText}"

IMPORTANT: Generate tags in the SAME LANGUAGE as the idea text above. Match the language exactly.

Generate 3-5 relevant tags for this idea that:
- Match the user's domain and interests
- Are consistent with their existing tag vocabulary
- Are specific enough to be useful for filtering
- Use the same format/style as existing tags

Format: Return only tag names, comma-separated, without any explanation.
Example: Technology, Innovation, Mobile App, AI
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the comma-separated tags
    const tags = text
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Limit to 5 tags

    return tags;
  } catch (error) {
    console.error('Error generating tags:', error);
    return []; // Return empty array on error
  }
}

/**
 * Generate initial exploration directions for an idea
 */
export async function generateExplorationDirections(
  ideaText: string,
  userProfile?: UserProfile
): Promise<AIExpansionDirection[]> {
  try {
    const profileContext = formatUserProfile(userProfile);
    
    const prompt = `
${profileContext}

Idea: "${ideaText}"

IMPORTANT: Respond in the SAME LANGUAGE as the idea text above. Match the language exactly.

Generate 4-5 different exploration directions for this idea. For each direction, provide:
- A title (2-4 words)
- A brief description (1 sentence)
- A thought-provoking question or prompt

Format your response as a JSON array with this structure:
[
  {
    "title": "Direction Title",
    "description": "Brief description of this exploration angle",
    "prompt": "A question or prompt to stimulate thinking"
  }
]

Consider different angles like: technical implementation, user experience, market potential, challenges, creative applications, etc.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const directions = JSON.parse(jsonMatch[0]);
      return directions.slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error('Error generating exploration directions:', error);
    return [];
  }
}

/**
 * Expand on a specific direction
 */
export async function expandContent(
  ideaText: string,
  direction: string,
  directionPrompt: string,
  userProfile?: UserProfile
): Promise<string> {
  try {
    const profileContext = formatUserProfile(userProfile);
    const complexityGuidance = getComplexityGuidance(userProfile);
    
    const prompt = `
${profileContext}

Original Idea: "${ideaText}"
Selected Direction: "${direction}"
Exploration Prompt: "${directionPrompt}"

IMPORTANT: Respond in the SAME LANGUAGE as the original idea text above. Match the language exactly.

Generate a detailed expansion exploring this direction:
- Length: 200-400 words
- Tone: Professional yet accessible
- Focus on actionable insights and concrete details
- ${complexityGuidance}

Provide only the expansion content, no meta-commentary.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error expanding content:', error);
    return 'Unable to generate content at this time. Please try again.';
  }
}

/**
 * Generate a document summary from explored content
 */
export async function generateDocumentSummary(
  originalIdea: string,
  exploredContent: { section: string; content: string }[],
  userProfile?: UserProfile
): Promise<string> {
  try {
    const sectionsText = exploredContent
      .map(item => `### ${item.section}\n${item.content}`)
      .join('\n\n');

    const profileContext = formatUserProfile(userProfile);

    const prompt = `
${profileContext}

Original Idea: "${originalIdea}"

Explored Sections:
${sectionsText}

IMPORTANT: Respond in the SAME LANGUAGE as the original idea and explored sections above. Match the language exactly.

Generate a cohesive summary document that:
- Starts with the original idea
- Organizes explored content into logical sections
- Maintains user-edited content exactly as-is
- Fills in transitions between sections
- Is professional yet accessible
- Adjusts tone and depth based on the user's professional context

Format as markdown with clear headings. Include only ## heading level for main sections.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating document summary:', error);
    return `# ${originalIdea}\n\nUnable to generate summary at this time.`;
  }
}

/**
 * Discover connections between ideas
 */
export async function findConnections(
  newIdea: string,
  existingIdeas: { id: string; text: string }[]
): Promise<{ ideaId: string; strength: number; reason: string }[]> {
  try {
    if (existingIdeas.length === 0) return [];

    const ideasText = existingIdeas
      .map((idea, idx) => `${idx + 1}. [${idea.id}] ${idea.text}`)
      .join('\n');

    const prompt = `
New Idea: "${newIdea}"

Existing Ideas:
${ideasText}

Analyze the new idea and identify connections with existing ideas. For each connection, provide:
- The idea number and ID
- Strength (0.0 to 1.0, where 1.0 is very strong connection)
- Brief reason for the connection

Format as JSON array:
[
  {
    "ideaId": "id_here",
    "strength": 0.8,
    "reason": "Brief explanation"
  }
]

Only include connections with strength >= 0.5. Limit to top 3 connections.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const connections = JSON.parse(jsonMatch[0]);
      return connections.filter((c: any) => c.strength >= 0.5).slice(0, 3);
    }

    return [];
  } catch (error) {
    console.error('Error finding connections:', error);
    return [];
  }
}

/**
 * Generate criticality analysis for an idea
 */
export async function generateCriticalities(
  ideaText: string,
  userProfile?: UserProfile
): Promise<{ category: string; content: string; severity: 'high' | 'medium' | 'low' }[]> {
  try {
    const profileContext = formatUserProfile(userProfile);
    const complexityGuidance = getComplexityGuidance(userProfile);
    
    const prompt = `
${profileContext}

Idea: "${ideaText}"

IMPORTANT: Respond in the SAME LANGUAGE as the idea text above. Match the language exactly.

Analyze potential criticalities, challenges, or concerns with this idea. Generate 3-5 criticalities covering:
- Technical challenges
- Market/business risks
- Resource requirements
- Implementation barriers
- Ethical or social concerns

${complexityGuidance}

For each criticality, provide:
- Category (e.g., "Technical Complexity", "Market Risk", "Resource Constraints")
- Content (2-3 sentences explaining the concern)
- Severity (high, medium, or low)

Format as JSON array:
[
  {
    "category": "Category Name",
    "content": "Detailed explanation of the criticality",
    "severity": "high"
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const criticalities = JSON.parse(jsonMatch[0]);
      return criticalities.slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error('Error generating criticalities:', error);
    return [];
  }
}

/**
 * Generate opportunity analysis for an idea
 */
export async function generateOpportunities(
  ideaText: string,
  userProfile?: UserProfile
): Promise<{ type: string; content: string; potential: 'high' | 'medium' | 'low' }[]> {
  try {
    const profileContext = formatUserProfile(userProfile);
    const useCaseGuidance = getUseCaseGuidance(userProfile);
    
    const prompt = `
${profileContext}

Idea: "${ideaText}"

IMPORTANT: Respond in the SAME LANGUAGE as the idea text above. Match the language exactly.

Identify potential opportunities and positive aspects of this idea. Generate 3-5 opportunities covering:
- Market opportunities
- Innovation potential
- Competitive advantages
- Growth possibilities
- Positive impact areas

${useCaseGuidance}

For each opportunity, provide:
- Type (e.g., "Market Gap", "Innovation", "Scalability", "Social Impact")
- Content (2-3 sentences explaining the opportunity)
- Potential (high, medium, or low)

Format as JSON array:
[
  {
    "type": "Opportunity Type",
    "content": "Detailed explanation of the opportunity",
    "potential": "high"
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const opportunities = JSON.parse(jsonMatch[0]);
      return opportunities.slice(0, 5);
    }

    return [];
  } catch (error) {
    console.error('Error generating opportunities:', error);
    return [];
  }
}
