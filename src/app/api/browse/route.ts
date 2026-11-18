import { NextResponse } from 'next/server';
import { discoverCatalog } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const type = (searchParams.get('type') || 'all') as any;
    const genre = searchParams.get('genre') || undefined;
    const country = searchParams.get('country') || undefined;
    const provider = searchParams.get('provider') || undefined;
    const year = searchParams.get('year') || undefined;
    const sort = searchParams.get('sort') || 'popularity.desc';
    const page = parseInt(searchParams.get('page') || '1', 10);

    const results = await discoverCatalog({
      type,
      genre,
      country,
      provider,
      year,
      sort,
      page,
    });

    return NextResponse.json({
      results,
      page,
      hasMore: results.length >= 12,
    });
  } catch (err: any) {
    console.warn('[API /api/browse] Error:', err);
    return NextResponse.json({ results: [], page: 1, hasMore: false });
  }
}
