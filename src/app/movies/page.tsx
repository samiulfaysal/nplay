import React from 'react';
import Link from 'next/link';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  DEMO_MOVIES,
} from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Film, Flame, Star, Sparkles, Clock } from 'lucide-react';

export const revalidate = 3600;

interface MoviesPageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  const { sort = 'featured' } = await searchParams;

  let movies = DEMO_MOVIES;
  let title = 'Featured Movies';
  let subtitle = 'Explore the hottest trending movies right now in Full HD';

  if (sort === 'popular') {
    movies = await getPopularMovies(1).catch(() => DEMO_MOVIES);
    title = 'Most Popular Movies';
    subtitle = 'Fan favorite movies with high popularity and active streaming interest';
  } else if (sort === 'top_rated') {
    movies = await getTopRatedMovies(1).catch(() => DEMO_MOVIES.slice().reverse());
    title = 'Top Rated Movies';
    subtitle = 'Critically acclaimed motion pictures with the highest audience scores';
  } else if (sort === 'upcoming') {
    movies = await getUpcomingMovies(1).catch(() => DEMO_MOVIES);
    title = 'Upcoming Releases';
    subtitle = 'Brand new and forthcoming cinema releases coming to streaming';
  } else {
    movies = await getTrendingMovies('week').catch(() => DEMO_MOVIES);
  }

  const tabs = [
    { label: 'Featured', value: 'featured', icon: Flame },
    { label: 'Popular', value: 'popular', icon: Sparkles },
    { label: 'Top Rated', value: 'top_rated', icon: Star },
    { label: 'Upcoming', value: 'upcoming', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            <h1 className="text-3xl font-black text-white">Stream Movies</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center bg-[#11141f] p-1 rounded-xl border border-white/10 self-start sm:self-auto overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = sort === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value === 'featured' ? '/movies' : `/movies?sort=${tab.value}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <MovieGrid
        title={title}
        subtitle={subtitle}
        movies={movies}
        showFilterTabs={false}
        layout="grid"
      />
    </div>
  );
}
