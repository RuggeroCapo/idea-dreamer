import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AITagSuggestion, AIExpansionDirection, UserProfile } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Using Gemini Flash for fast, cost-effective responses
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate tag suggestions for a new idea
 */
export async function generateTags(
  ideaText: string,
  userProfile?: UserProfile,
  existingTags: string[] = []
): Promise<string[]> {
  try {
    const prompt = `
User Profile: ${userProfile ? JSON.stringify(userProfile.profile) : 'Not provided'}
Existing Tags Used: ${existingTags.join(', ') || 'None'}
New Idea: "${ideaText}"

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
    const prompt = `
User Profile: ${userProfile ? JSON.stringify(userProfile.profile) : 'Not provided'}
Idea: "${ideaText}"

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
    const prompt = `
User Profile: ${userProfile ? JSON.stringify(userProfile.profile) : 'Not provided'}
Original Idea: "${ideaText}"
Selected Direction: "${direction}"
Exploration Prompt: "${directionPrompt}"

Generate a detailed expansion exploring this direction:
- Length: 200-400 words
- Tone: Professional yet accessible
- Focus on actionable insights and concrete details
- Consider user's background and expertise level

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
  exploredContent: { section: string; content: string }[]
): Promise<string> {
  try {
    const sectionsText = exploredContent
      .map(item => `### ${item.section}\n${item.content}`)
      .join('\n\n');

    const prompt = `
Original Idea: "${originalIdea}"

Explored Sections:
${sectionsText}

Generate a cohesive summary document that:
- Starts with the original idea
- Organizes explored content into logical sections
- Maintains user-edited content exactly as-is
- Fills in transitions between sections
- Is professional yet accessible

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
