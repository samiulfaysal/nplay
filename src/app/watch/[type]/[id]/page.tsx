import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  getMovieDetails,
  getTVDetails,
  getTrendingMovies,
  getTrendingTVSeries,
  DEMO_MOVIES,
  DEMO_TV_SHOWS,
  TMDB_IMAGE_SIZES,
} from '@/lib/tmdb';
import { SparkBoxCore } from '@/lib/providerCore';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { SeasonEpisodeSelector } from '@/components/player/SeasonEpisodeSelector';
import { MovyWatchHero } from '@/components/movies/MovyWatchHero';
import { WatchlistButton } from '@/components/movies/WatchlistButton';
import { WatchTrailerButton } from '@/components/modals/WatchTrailerButton';
import { ShareButton } from '@/components/movies/ShareButton';
import { WatchHistoryTracker } from '@/components/player/WatchHistoryTracker';
import { CastRow } from '@/components/movies/CastRow';
import {
  Star,
  Clock,
  Globe,
  Film,
  Tv,
} from 'lucide-react';

interface WatchPageProps {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { type, id: rawId } = await params;
  const id = decodeURIComponent(rawId || '').replace(/[^0-9a-zA-Z_-]/g, '');
  const isTv = type === 'tv';
  const content = isTv ? await getTVDetails(id) : await getMovieDetails(id);

  if (!content) {
    return {
      title: 'Watch Title - nPlay Cinema',
    };
  }

  const title = (content as any).title || (content as any).name || 'Untitled';
  const releaseDate = (content as any).release_date || (content as any).first_air_date || '';
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : '2024';
  const overview =
    content.overview ||
    `Stream ${title} (${releaseYear}) in HD with multi-server mirrors on nPlay. 100% free streaming with zero subscriptions.`;
  const backdrop = content.backdrop_path
    ? content.backdrop_path.startsWith('http')
      ? content.backdrop_path
      : `${TMDB_IMAGE_SIZES.backdrop.large}${content.backdrop_path}`
    : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80';

  return {
    title: `${title} (${releaseYear}) - Watch Free Online HD | Netfly`,
    description: overview.slice(0, 160),
    openGraph: {
      title: `${title} (${releaseYear}) - Stream Free in HD | Netfly`,
      description: overview.slice(0, 160),
      images: [
        {
          url: backdrop,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: isTv ? 'video.tv_show' : 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - Watch Free HD on Netfly`,
      description: overview.slice(0, 160),
      images: [backdrop],
    },
  };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { type, id: rawId } = await params;
  const id = decodeURIComponent(rawId || '').replace(/[^0-9a-zA-Z_-]/g, '');
  const { season: seasonQuery, episode: episodeQuery } = await searchParams;

  const isTv = type === 'tv';
  const seasonNum = seasonQuery ? parseInt(seasonQuery, 10) : 1;
  const episodeNum = episodeQuery ? parseInt(episodeQuery, 10) : 1;

  // Fetch title details based on media type
  let content: any = null;
  if (isTv) {
    content = await getTVDetails(id);
  } else {
    content = await getMovieDetails(id);
  }

  if (!content) {
    notFound();
  }

  const title = content.title || content.name || 'Untitled';
  const releaseDate = content.release_date || content.first_air_date || '';
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : '2024';
  const imdbId = content.imdb_id || (content as any).external_ids?.imdb_id || '';
  const isUpcoming = Boolean(
    releaseDate && new Date(releaseDate).getTime() > Date.now()
  );

  // Strict Season & Episode validation for TV Series (prevent mismatched/missing episodes)
  let verifiedSeason = seasonNum;
  let verifiedEpisode = episodeNum;
  if (isTv && content.seasons && content.seasons.length > 0) {
    const validSeasons = content.seasons.filter((s: any) => s.season_number > 0);
    const matchedSeason = validSeasons.find((s: any) => s.season_number === seasonNum) || validSeasons[0];
    verifiedSeason = matchedSeason?.season_number || 1;
    const maxEpisodes = matchedSeason?.episode_count || 50;
    verifiedEpisode = Math.max(1, Math.min(episodeNum, maxEpisodes));
  }

  // Resolve streaming sources via SparkBoxCore with strict TMDB + IMDb validation
  const streamPayload = await SparkBoxCore.resolveStream({
    tmdbId: id,
    imdbId,
    type: isTv ? 'tv' : 'movie',
    season: verifiedSeason,
    episode: verifiedEpisode,
    title,
    year: releaseYear,
  });

  // Fetch recommendations for "You May Also Like"
  const recommendationsFallback = isTv
    ? await getTrendingTVSeries('week').catch(() => DEMO_TV_SHOWS)
    : await getTrendingMovies('week').catch(() => DEMO_MOVIES);

  const finalRecommendations =
    content.recommendations && content.recommendations.length > 0
      ? content.recommendations
      : recommendationsFallback.filter((item: any) => String(item.id) !== String(id)).slice(0, 12);

  const backdropUrl = content.backdrop_path
    ? content.backdrop_path.startsWith('http')
      ? content.backdrop_path
      : `${TMDB_IMAGE_SIZES.backdrop.original}${content.backdrop_path}`
    : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1920&q=80';

  const posterUrl = content.poster_path
    ? content.poster_path.startsWith('http')
      ? content.poster_path
      : `${TMDB_IMAGE_SIZES.poster.medium}${content.poster_path}`
    : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80';

  return (
    <div className="min-h-screen pb-20">
      {/* Auto-record Watch History Progress */}
      <WatchHistoryTracker
        contentId={id}
        contentType={isTv ? 'tv' : 'movie'}
        title={title}
        poster_path={content.poster_path}
        backdrop_path={content.backdrop_path}
        seasonNumber={isTv ? verifiedSeason : undefined}
        episodeNumber={isTv ? verifiedEpisode : undefined}
      />

      {/* Blurred Ambient Backdrop Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 -z-10 overflow-hidden">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover blur-3xl scale-125"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-6 space-y-6 sm:space-y-8">
        {/* Movy Cinematic Hero & Fullscreen Video Player */}
        <MovyWatchHero
          id={id}
          type={isTv ? 'tv' : 'movie'}
          title={title}
          releaseYear={releaseYear}
          duration={content.formatted_duration || (isTv ? 'Season Series' : '2h 05m')}
          rating={content.vote_average || 8.0}
          quality={content.quality || '4K UHD'}
          overview={content.overview || ''}
          backdropUrl={backdropUrl}
          posterUrl={posterUrl}
          genres={content.genres || []}
          country={content.country}
          isTv={isTv}
          season={verifiedSeason}
          episode={verifiedEpisode}
          trailerKey={content.trailer_key}
          item={content}
          sources={streamPayload.sources}
          embedServers={streamPayload.embedServers}
          subtitles={streamPayload.subtitles}
          fallbackEmbedUrl={streamPayload.fallbackEmbedUrl}
          imdbId={imdbId}
        />

        {/* 2. TV Show Season and Episode Selector (Only on TV pages) */}
        {isTv && content.seasons && content.seasons.length > 0 && (
          <SeasonEpisodeSelector
            tvId={id}
            seasons={content.seasons}
            currentSeason={verifiedSeason}
            currentEpisode={verifiedEpisode}
          />
        )}

        {/* 3. Movie/Show Synopsis, Top Cast & Metadata Details */}
        <section id="details" className="p-4 sm:p-6 rounded-2xl glass-panel space-y-6 border border-white/5 overflow-hidden w-full max-w-full">
          <div className="flex flex-col md:flex-row gap-6 items-start w-full min-w-0 max-w-full">
            {/* Poster Thumbnail */}
            <div className="relative w-32 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-xl shrink-0 hidden sm:block border border-white/10 bg-zinc-950">
              <Image
                src={posterUrl}
                alt={title}
                fill
                sizes="(max-width: 640px) 128px, 176px"
                className="object-cover"
              />
            </div>

            {/* Synopsis and Metadata */}
            <div className="flex-1 min-w-0 max-w-full space-y-4 overflow-hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-red-600 text-white">
                  {content.quality || 'HD'}
                </span>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/60 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{content.vote_average?.toFixed(1) || '8.0'} / 10 IMDb</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 text-gray-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{content.formatted_duration || '2h 00m'}</span>
                </div>
                {content.country && (
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/10 text-gray-300 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{content.country}</span>
                  </div>
                )}
              </div>

              {content.tagline && (
                <p className="text-sm italic text-gray-400 border-l-2 border-red-500 pl-3">
                  &quot;{content.tagline}&quot;
                </p>
              )}

              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                {content.overview}
              </p>

              {/* Genre Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold uppercase text-gray-400">
                  Genres:
                </span>
                {content.genres?.map((g: any) => (
                  <Link
                    key={g.id || g.name}
                    href={`/browse?genre=${encodeURIComponent((g.name || '').toLowerCase())}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 hover:bg-red-600/20 hover:text-red-400 transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>

              {/* Top Cast Horizontal Row */}
              <CastRow cast={content.cast || []} />
            </div>
          </div>
        </section>

        {/* 4. You May Also Like / Recommendations Grid */}
        <section className="pt-2 sm:pt-4">
          <MovieGrid
            title="You May Also Like"
            subtitle="Recommended titles similar to this release"
            movies={finalRecommendations}
            showFilterTabs={false}
          />
        </section>
      </div>
    </div>
  );
}
