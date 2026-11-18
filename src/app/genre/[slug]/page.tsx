import React from 'react';
import { getMoviesByGenre, GENRE_SLUG_MAP, DEMO_MOVIES } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Layers } from 'lucide-react';

export const revalidate = 3600;

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const genreInfo = GENRE_SLUG_MAP[decodedSlug] || {
    id: 28,
    name: decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1),
  };

  const movies = await getMoviesByGenre(decodedSlug).catch(() => DEMO_MOVIES);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>Genre Category</span>
        </div>
        <h1 className="text-3xl font-black text-white">{genreInfo.name} Movies & Shows</h1>
        <p className="text-sm text-gray-400 mt-1">
          Stream top-rated and latest {genreInfo.name.toLowerCase()} releases in Full HD.
        </p>
      </div>

      <MovieGrid
        title={`${genreInfo.name} Titles`}
        movies={movies}
        showFilterTabs={true}
        layout="grid"
      />
    </div>
  );
}
