import { NextRequest, NextResponse } from 'next/server';
import { generateCriticalities } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { ideaText, userProfile } = await request.json();

    if (!ideaText) {
      return NextResponse.json(
        { error: 'Idea text is required' },
        { status: 400 }
      );
    }

    const criticalities = await generateCriticalities(ideaText, userProfile);

    return NextResponse.json({ criticalities });
  } catch (error) {
    console.error('Error generating criticalities:', error);
    return NextResponse.json(
      { error: 'Failed to generate criticalities' },
      { status: 500 }
    );
  }
}
