import { UserProfile } from '@/types';

/**
 * Formats user profile data into human-readable context for AI prompts
 * Handles missing or incomplete profiles gracefully
 */
export function formatUserProfile(profile?: UserProfile): string {
  if (!profile?.profile) {
    return `User Context: General audience (no specific profile available)

Instructions:
- Provide balanced, accessible content suitable for a general audience
- Avoid assuming specific expertise levels
- Use clear, straightforward language`;
  }

  const { professionalContext, areasOfInterest, thinkingStyle, primaryUseCase } = profile.profile;

  // Build context sections
  const contextParts: string[] = ['User Context:'];

  // Professional context
  if (professionalContext?.role || professionalContext?.industry) {
    const role = professionalContext.role || 'Professional';
    const industry = professionalContext.industry || 'General';
    contextParts.push(`- Professional Role: ${role} in ${industry}`);
  }

  // Areas of interest
  if (areasOfInterest && areasOfInterest.length > 0) {
    contextParts.push(`- Areas of Interest: ${areasOfInterest.join(', ')}`);
  }

  // Thinking style
  if (thinkingStyle) {
    contextParts.push(`- Thinking Style: ${thinkingStyle}`);
  }

  // Primary use case
  if (primaryUseCase) {
    contextParts.push(`- Primary Use Case: ${primaryUseCase}`);
  }

  // Add thinking style-specific instructions
  const styleInstructions = getThinkingStyleInstructions(thinkingStyle);
  
  // Add use case-specific focus
  const useCaseFocus = getUseCaseFocus(primaryUseCase);

  const instructions = [
    '\nInstructions:',
    '- Tailor your response to match this user\'s expertise level and interests',
    styleInstructions,
    useCaseFocus
  ].filter(Boolean).join('\n');

  return contextParts.join('\n') + instructions;
}

/**
 * Provides complexity guidance based on user's professional role
 * Used for content expansion, criticalities, and opportunities
 */
export function getComplexityGuidance(profile?: UserProfile): string {
  if (!profile?.profile?.professionalContext) {
    return 'Provide content at an intermediate complexity level suitable for a general audience.';
  }

  const { role, industry } = profile.profile.professionalContext;
  const roleLower = role?.toLowerCase() || '';
  const industryLower = industry?.toLowerCase() || '';

  // Technical roles - higher complexity
  if (
    roleLower.includes('engineer') ||
    roleLower.includes('developer') ||
    roleLower.includes('architect') ||
    roleLower.includes('scientist') ||
    roleLower.includes('researcher')
  ) {
    return 'Provide technical depth with specific details, methodologies, and implementation considerations. Use industry-standard terminology and assume strong technical knowledge.';
  }

  // Business/Management roles - strategic focus
  if (
    roleLower.includes('manager') ||
    roleLower.includes('director') ||
    roleLower.includes('executive') ||
    roleLower.includes('consultant') ||
    roleLower.includes('analyst')
  ) {
    return 'Focus on business impact, strategic considerations, and ROI. Emphasize practical implications, market dynamics, and organizational factors.';
  }

  // Creative roles - conceptual and innovative
  if (
    roleLower.includes('designer') ||
    roleLower.includes('artist') ||
    roleLower.includes('creative') ||
    roleLower.includes('writer')
  ) {
    return 'Emphasize creative possibilities, aesthetic considerations, and innovative approaches. Focus on user experience and emotional impact.';
  }

  // Educational roles - pedagogical approach
  if (
    roleLower.includes('teacher') ||
    roleLower.includes('educator') ||
    roleLower.includes('professor') ||
    roleLower.includes('student')
  ) {
    return 'Provide educational context with clear explanations, learning opportunities, and foundational concepts. Make content accessible and informative.';
  }

  // Default to balanced approach
  return 'Provide balanced content that combines practical insights with conceptual understanding. Use accessible language while maintaining depth.';
}

/**
 * Provides use case-specific guidance for opportunities and analysis
 * Aligns AI outputs with user's primary goals
 */
export function getUseCaseGuidance(profile?: UserProfile): string {
  if (!profile?.profile?.primaryUseCase) {
    return 'Focus on practical applications and actionable insights.';
  }

  const useCase = profile.profile.primaryUseCase.toLowerCase();

  switch (useCase) {
    case 'business_ideas':
      return 'Focus on market viability, commercial potential, revenue models, and competitive advantages. Emphasize scalability and business impact.';
    
    case 'creative_projects':
      return 'Focus on artistic expression, innovative approaches, audience engagement, and creative execution. Emphasize originality and emotional resonance.';
    
    case 'learning':
      return 'Focus on educational value, skill development, knowledge acquisition, and learning pathways. Emphasize understanding and growth opportunities.';
    
    case 'personal':
      return 'Focus on personal growth, lifestyle improvements, self-expression, and individual fulfillment. Emphasize meaningful impact on daily life.';
    
    case 'research':
      return 'Focus on research questions, methodological approaches, knowledge gaps, and scholarly contributions. Emphasize rigor and innovation.';
    
    case 'problem_solving':
      return 'Focus on practical solutions, implementation strategies, effectiveness, and measurable outcomes. Emphasize actionability and results.';
    
    default:
      return 'Focus on practical applications, actionable insights, and meaningful outcomes relevant to the user\'s goals.';
  }
}

/**
 * Internal helper: Get thinking style-specific instructions
 */
function getThinkingStyleInstructions(thinkingStyle?: string): string {
  if (!thinkingStyle) {
    return '- Use clear, balanced communication';
  }

  const style = thinkingStyle.toLowerCase();

  switch (style) {
    case 'visual':
      return '- Use metaphors, analogies, and visual descriptions to illustrate concepts\n- Help the user "see" ideas through vivid imagery and comparisons';
    
    case 'analytical':
      return '- Provide data, logic, and structured reasoning\n- Break down concepts systematically with clear cause-and-effect relationships';
    
    case 'creative':
      return '- Explore unconventional angles and innovative possibilities\n- Encourage divergent thinking and novel connections';
    
    case 'practical':
      return '- Focus on actionable steps and real-world applications\n- Emphasize concrete, implementable solutions';
    
    default:
      return '- Use clear, balanced communication';
  }
}

/**
 * Internal helper: Get use case-specific focus
 */
function getUseCaseFocus(primaryUseCase?: string): string {
  if (!primaryUseCase) {
    return '';
  }

  const useCase = primaryUseCase.toLowerCase();

  switch (useCase) {
    case 'business_ideas':
      return '- Consider market viability and commercial potential';
    
    case 'creative_projects':
      return '- Consider artistic expression and creative execution';
    
    case 'learning':
      return '- Consider educational value and learning opportunities';
    
    case 'personal':
      return '- Consider personal growth and lifestyle impact';
    
    case 'research':
      return '- Consider research questions and scholarly contributions';
    
    case 'problem_solving':
      return '- Consider practical solutions and measurable outcomes';
    
    default:
      return '';
  }
}
