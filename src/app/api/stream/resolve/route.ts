import { NextRequest, NextResponse } from 'next/server';
import {
  MovieBoxProvider,
  FourKHdHubProvider,
  DramachiProvider,
  BdixProvider,
  StremioProvider,
  StreamQuery,
} from '@/lib/providers';
import { SparkBoxCore } from '@/lib/providerCore';

const providersMap: Record<string, any> = {
  moviebox: new MovieBoxProvider(),
  '4khdhub': new FourKHdHubProvider(),
  dramachi: new DramachiProvider(),
  bdix: new BdixProvider(),
  stremio: new StremioProvider(),
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerKey = (searchParams.get('provider') || 'moviebox').toLowerCase();
    const tmdbId = searchParams.get('tmdbId') || '';
    const imdbId = searchParams.get('imdbId') || undefined;
    const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
    const season = searchParams.get('season') ? parseInt(searchParams.get('season')!, 10) : 1;
    const episode = searchParams.get('episode') ? parseInt(searchParams.get('episode')!, 10) : 1;
    const title = searchParams.get('title') || '';
    const year = searchParams.get('year') || undefined;
    const resolution = searchParams.get('resolution') || undefined;

    const query: StreamQuery = {
      tmdbId,
      imdbId,
      type,
      season,
      episode,
      title,
      year,
      resolution,
    };

    const providerInstance = providersMap[providerKey] || providersMap.moviebox;
    let result = null;
    try {
      result = await providerInstance.resolve(query);
    } catch {
      // Non-blocking fallback
    }

    if (!result || !result.sources || result.sources.length === 0) {
      const payload = await SparkBoxCore.resolveStream(query);
      const matched = payload.sources.find((s) => s.provider.toLowerCase().includes(providerKey)) || payload.sources[0];
      if (matched) {
        result = {
          providerName: matched.provider,
          sources: [matched],
          subtitles: payload.subtitles,
          adStatus: 'ad-free',
          badgeLabel: 'Ad-Free Pro',
          tooltip: matched.tooltip,
        };
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('Error resolving stream in API route:', error);
    return NextResponse.json(
      { error: 'Failed to resolve stream from provider', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const providerKey = (body.provider || 'moviebox').toLowerCase();

    const query: StreamQuery = {
      tmdbId: body.tmdbId,
      imdbId: body.imdbId,
      type: body.type || 'movie',
      season: body.season || 1,
      episode: body.episode || 1,
      title: body.title,
      year: body.year,
      resolution: body.resolution,
    };

    const providerInstance = providersMap[providerKey] || providersMap.moviebox;
    let result = null;
    try {
      result = await providerInstance.resolve(query);
    } catch {
      // Non-blocking fallback
    }

    if (!result || !result.sources || result.sources.length === 0) {
      const payload = await SparkBoxCore.resolveStream(query);
      const matched = payload.sources.find((s) => s.provider.toLowerCase().includes(providerKey)) || payload.sources[0];
      if (matched) {
        result = {
          providerName: matched.provider,
          sources: [matched],
          subtitles: payload.subtitles,
          adStatus: 'ad-free',
          badgeLabel: 'Ad-Free Pro',
          tooltip: matched.tooltip,
        };
      }
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to resolve stream', details: error?.message },
      { status: 500 }
    );
  }
}
