import { NextRequest, NextResponse } from 'next/server';
import { expandContent } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { ideaText, direction, directionPrompt, userProfile } = await request.json();

    if (!ideaText || !direction || !directionPrompt) {
      return NextResponse.json(
        { error: 'Idea text, direction, and prompt are required' },
        { status: 400 }
      );
    }

    const content = await expandContent(ideaText, direction, directionPrompt, userProfile);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error expanding content:', error);
    return NextResponse.json(
      { error: 'Failed to expand content' },
      { status: 500 }
    );
  }
}
