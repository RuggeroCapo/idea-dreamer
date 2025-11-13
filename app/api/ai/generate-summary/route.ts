import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentSummary } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { originalIdea, exploredContent } = await request.json();

    if (!originalIdea || !exploredContent) {
      return NextResponse.json(
        { error: 'Original idea and explored content are required' },
        { status: 400 }
      );
    }

    const summary = await generateDocumentSummary(originalIdea, exploredContent);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate document summary' },
      { status: 500 }
    );
  }
}
