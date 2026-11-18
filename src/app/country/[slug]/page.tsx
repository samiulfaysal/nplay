import React from 'react';
import { getMoviesByCountry, COUNTRY_CODE_MAP, DEMO_MOVIES } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Globe2 } from 'lucide-react';

export const revalidate = 3600;

interface CountryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  const countryCode = COUNTRY_CODE_MAP[decodedSlug] || 'US';
  const countryDisplayName = decodedSlug
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const movies = await getMoviesByCountry(countryCode).catch(() => DEMO_MOVIES);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Globe2 className="w-4 h-4" />
          <span>Regional Cinema</span>
        </div>
        <h1 className="text-3xl font-black text-white">{countryDisplayName} Titles</h1>
        <p className="text-sm text-gray-400 mt-1">
          Explore movies and series originating from {countryDisplayName}.
        </p>
      </div>

      <MovieGrid
        title={`Popular in ${countryDisplayName}`}
        movies={movies}
        showFilterTabs={true}
        layout="grid"
      />
    </div>
  );
}
