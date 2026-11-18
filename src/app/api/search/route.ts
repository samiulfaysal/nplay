import { NextRequest, NextResponse } from 'next/server';
import { searchContent } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';

  try {
    const results = await searchContent(query, 1);
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
