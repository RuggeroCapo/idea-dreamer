import { NextRequest, NextResponse } from 'next/server';
import { generateExplorationDirections } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { ideaText, userProfile } = await request.json();

    if (!ideaText) {
      return NextResponse.json(
        { error: 'Idea text is required' },
        { status: 400 }
      );
    }

    const directions = await generateExplorationDirections(ideaText, userProfile);

    return NextResponse.json({ directions });
  } catch (error) {
    console.error('Error generating directions:', error);
    return NextResponse.json(
      { error: 'Failed to generate exploration directions' },
      { status: 500 }
    );
  }
}
