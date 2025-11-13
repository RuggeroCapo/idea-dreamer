import { NextRequest, NextResponse } from 'next/server';
import { generateTags } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { ideaText, userProfile, existingTags } = await request.json();

    if (!ideaText || typeof ideaText !== 'string') {
      return NextResponse.json(
        { error: 'Invalid idea text' },
        { status: 400 }
      );
    }

    const tags = await generateTags(ideaText, userProfile, existingTags);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error in generate-tags API:', error);
    return NextResponse.json(
      { error: 'Failed to generate tags' },
      { status: 500 }
    );
  }
}
