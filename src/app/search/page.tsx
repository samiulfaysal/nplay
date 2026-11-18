import React from 'react';
import { searchContent } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  const movies = query ? await searchContent(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          <span>Search Results</span>
        </div>
        <h1 className="text-3xl font-black text-white">
          {query ? `Results for "${query}"` : 'Search Movies & TV Shows'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {movies.length > 0
            ? `Found ${movies.length} title${movies.length === 1 ? '' : 's'} matching your query.`
            : query
            ? 'No matches found. Try searching for a different title, actor, or genre.'
            : 'Type a title in the search bar above to discover movies and series.'}
        </p>
      </div>

      {movies.length > 0 ? (
        <MovieGrid
          title="Matching Titles"
          movies={movies as any}
          showFilterTabs={true}
          layout="grid"
        />
      ) : (
        <div className="text-center py-20 rounded-2xl glass-panel space-y-3">
          <Search className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-gray-300">No titles found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            We couldn&apos;t find any titles matching &quot;{query}&quot;. Check your spelling or try another keyword.
          </p>
        </div>
      )}
    </div>
  );
}
