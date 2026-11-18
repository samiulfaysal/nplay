import React from 'react';
import { HeroSlider } from '@/components/movies/HeroSlider';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { ProviderBar } from '@/components/movies/ProviderBar';
import { ContinueWatchingRow } from '@/components/movies/ContinueWatchingRow';
import {
  getTrendingMovies,
  getLatestMovies,
  getTrendingTVSeries,
  getLatestTVSeries,
  getTopRatedMovies,
  getTop10Today,
  getAnimeList,
  DEMO_MOVIES,
  DEMO_TV_SHOWS,
  DEMO_ANIME,
} from '@/lib/tmdb';
import Link from 'next/link';
import {
  Flame,
  Film,
  Tv,
  Compass,
  ShieldCheck,
  Zap,
  Sparkles,
  Trophy,
  TrendingUp,
} from 'lucide-react';

export const revalidate = 3600; // ISR cache revalidation every hour

export default async function HomePage() {
  const [
    top10Today,
    trendingMovies,
    trendingTV,
    latestMovies,
    latestTV,
    animeList,
    topRatedMovies,
  ] = await Promise.all([
    getTop10Today().catch(() => DEMO_MOVIES.slice(0, 10)),
    getTrendingMovies('day').catch(() => DEMO_MOVIES),
    getTrendingTVSeries('day').catch(() => DEMO_TV_SHOWS),
    getLatestMovies(1).catch(() => DEMO_MOVIES),
    getLatestTVSeries(1).catch(() => DEMO_TV_SHOWS),
    getAnimeList(1).catch(() => DEMO_ANIME),
    getTopRatedMovies(1).catch(() => DEMO_MOVIES.slice().reverse()),
  ]);

  const heroSpotlights = trendingMovies.slice(0, 5);

  const quickGenres = [
    { name: 'Action', href: '/genre/action', count: '1.2k+ Titles' },
    { name: 'Horror', href: '/genre/horror', count: '640+ Titles' },
    { name: 'Sci-Fi', href: '/genre/sci-fi', count: '890+ Titles' },
    { name: 'Romance', href: '/genre/romance', count: '520+ Titles' },
    { name: 'Comedy', href: '/genre/comedy', count: '1.4k+ Titles' },
    { name: 'Animation', href: '/genre/animation', count: '780+ Titles' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-12 sm:pb-16">
      {/* 1. Cinematic Hero Slider with Carousel Controls */}
      <HeroSlider movies={heroSpotlights} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Continue Watching Row (Active user/guest playback progress) */}
        <ContinueWatchingRow />

        {/* Feature Highlights Bar (Compact and desktop-focused for native app feel on mobile) */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 p-4 rounded-2xl glass-panel text-xs sm:text-sm border border-white/5">
          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-red-600/10 text-red-500">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Multi-Server 4K</div>
              <div className="text-gray-400 text-xs">High-Speed Cloud Nodes</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Daily Updates</div>
              <div className="text-gray-400 text-xs">Fresh theatrical releases</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Direct HLS Playback</div>
              <div className="text-gray-400 text-xs">Fast ad-free streaming</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Zero Subscriptions</div>
              <div className="text-gray-400 text-xs">100% Free cinema</div>
            </div>
          </div>
        </div>

        {/* 2. Browse by Streaming Provider Row (Netflix, Prime, Disney+, Apple TV+, HBO Max, Hulu, Crunchyroll) */}
        <ProviderBar />

        {/* 3. Row 1: Top 10 Today (Numbered 1-10 ranked cards Cinejoy style) */}
        <MovieGrid
          title="Top 10 Today"
          subtitle="The most-streamed movies and series today ranked #1 to #10"
          movies={top10Today}
          showFilterTabs={false}
          showRanks={true}
          icon={<Trophy className="w-5 h-5 text-amber-400" />}
        />

        {/* 4. Row 2: Trending Movies */}
        <MovieGrid
          title="Trending Movies"
          subtitle="Top motion pictures capturing global audience attention"
          movies={trendingMovies.slice(0, 12)}
          showFilterTabs={true}
          icon={<Flame className="w-5 h-5 text-red-500 fill-red-500" />}
        />

        {/* 5. Row 3: Trending Series */}
        <MovieGrid
          title="Trending Series"
          subtitle="Binge-worthy drama, action, and fantasy series streaming now"
          movies={trendingTV.slice(0, 12)}
          showFilterTabs={false}
          icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
        />

        {/* 6. Row 4: Latest Movies */}
        <MovieGrid
          title="Latest Movies"
          subtitle="Newly released blockbuster movies available in HD quality"
          movies={latestMovies.slice(0, 12)}
          showFilterTabs={false}
          icon={<Film className="w-5 h-5 text-cyan-400" />}
        />

        {/* 7. Row 5: Latest TV-Series (Showing S1 • EP8 badges) */}
        <MovieGrid
          title="Latest TV-Series"
          subtitle="Newly aired seasons and fresh episodes"
          movies={latestTV.slice(0, 12)}
          showFilterTabs={false}
          icon={<Tv className="w-5 h-5 text-red-400" />}
        />

        {/* 8. Quick Genre Discovery Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Explore Popular Genres
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickGenres.map((genre) => (
              <Link
                key={genre.name}
                href={genre.href}
                className="group p-4 rounded-xl bg-[#11141f] border border-white/5 hover:border-red-500/50 hover:bg-gradient-to-br hover:from-red-950/30 hover:to-[#171c2b] transition-all duration-300"
              >
                <div className="text-sm font-bold text-gray-200 group-hover:text-red-400 transition-colors">
                  {genre.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">{genre.count}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* 9. Row 6: Anime (Japanese Animation) */}
        <MovieGrid
          title="Trending Anime"
          subtitle="Top rated anime series and movies with English subs and dubs"
          movies={animeList.slice(0, 12)}
          showFilterTabs={false}
          icon={<Sparkles className="w-5 h-5 text-amber-400" />}
        />

        {/* 10. Row 7: Top IMDb Rated */}
        <MovieGrid
          title="Top IMDb Rated"
          subtitle="Critically acclaimed movies with the highest audience score"
          movies={topRatedMovies.slice(0, 12)}
          showFilterTabs={false}
          icon={<Trophy className="w-5 h-5 text-yellow-400" />}
        />
      </div>
    </div>
  );
}
