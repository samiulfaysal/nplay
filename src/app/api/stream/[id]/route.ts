import { NextRequest, NextResponse } from 'next/server';
import { SparkBoxCore } from '@/lib/providerCore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;

  const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';
  const season = searchParams.get('season') ? Number(searchParams.get('season')) : 1;
  const episode = searchParams.get('episode') ? Number(searchParams.get('episode')) : 1;

  try {
    const streamPayload = await SparkBoxCore.resolveStream({
      tmdbId: id,
      type,
      season,
      episode,
    });

    return NextResponse.json(streamPayload, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('[API Stream Route Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error resolving stream' },
      { status: 500 }
    );
  }
}
