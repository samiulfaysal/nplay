import React from 'react';
import { getTopRatedMovies, DEMO_MOVIES } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';

export const revalidate = 3600;

export default async function TopImdbPage() {
  const topMovies = await getTopRatedMovies(1).catch(() =>
    DEMO_MOVIES.slice().reverse()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Top IMDb Rated Titles</h1>
        <p className="text-sm text-gray-400 mt-1">
          Hand-picked cinema masterpieces ranked by global IMDb audience evaluations.
        </p>
      </div>

      <MovieGrid
        title="Top Rated Masterpieces"
        movies={topMovies}
        showFilterTabs={false}
        layout="grid"
      />
    </div>
  );
}
