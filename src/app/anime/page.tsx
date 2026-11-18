import React from 'react';
import { getAnimeList, DEMO_ANIME } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Sparkles, Film, Flame } from 'lucide-react';

export const revalidate = 3600;

export default async function AnimePage() {
  const animeList = await getAnimeList(1).catch(() => DEMO_ANIME);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="space-y-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-black">
            Anime Catalog
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
          Stream Anime HD & Movies
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl">
          Watch top-rated Japanese animation, trending shonen series, and critically acclaimed anime films in 1080p with English subtitles and dubbing options.
        </p>
      </div>

      <MovieGrid
        title="Trending Anime"
        subtitle="Most watched anime series and movies today"
        movies={animeList}
        showFilterTabs={true}
        layout="grid"
        icon={<Sparkles className="w-5 h-5 text-amber-400" />}
      />
    </div>
  );
}
