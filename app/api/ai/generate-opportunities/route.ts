import { NextRequest, NextResponse } from 'next/server';
import { generateOpportunities } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { ideaText, userProfile } = await request.json();

    if (!ideaText) {
      return NextResponse.json(
        { error: 'Idea text is required' },
        { status: 400 }
      );
    }

    const opportunities = await generateOpportunities(ideaText, userProfile);

    return NextResponse.json({ opportunities });
  } catch (error) {
    console.error('Error generating opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to generate opportunities' },
      { status: 500 }
    );
  }
}
