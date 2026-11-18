'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MovieCard } from '@/components/movies/MovieCard';
import {
  SlidersHorizontal,
  RotateCcw,
  Film,
  Tv,
  Globe2,
  Calendar,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Search,
} from 'lucide-react';

const GENRES_LIST = [
  { label: 'All Genres', value: 'all' },
  { label: 'Action', value: 'action' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Animation', value: 'animation' },
  { label: 'Comedy', value: 'comedy' },
  { label: 'Crime', value: 'crime' },
  { label: 'Drama', value: 'drama' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Horror', value: 'horror' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Romance', value: 'romance' },
  { label: 'Sci-Fi', value: 'sci-fi' },
  { label: 'Thriller', value: 'thriller' },
];

const COUNTRIES_LIST = [
  { label: 'All Countries', value: 'all' },
  { label: 'United States', value: 'united states' },
  { label: 'United Kingdom', value: 'united kingdom' },
  { label: 'South Korea', value: 'south korea' },
  { label: 'Japan', value: 'japan' },
  { label: 'France', value: 'france' },
  { label: 'Canada', value: 'canada' },
  { label: 'Spain', value: 'spain' },
  { label: 'Germany', value: 'germany' },
  { label: 'India', value: 'india' },
];

const PROVIDERS_LIST = [
  { label: 'All Networks', value: 'all' },
  { label: 'Netflix', value: '8' },
  { label: 'Prime Video', value: '9' },
  { label: 'Disney+', value: '337' },
  { label: 'Apple TV+', value: '350' },
  { label: 'HBO Max', value: '1899' },
  { label: 'Hulu', value: '15' },
  { label: 'Crunchyroll', value: '283' },
];

const YEARS_LIST = [
  { label: 'All Years', value: 'all' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2022', value: '2022' },
  { label: '2021', value: '2021' },
  { label: '2020', value: '2020' },
];

const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popularity.desc' },
  { label: 'Top Rated IMDb', value: 'vote_average.desc' },
  { label: 'Newest Releases', value: 'primary_release_date.desc' },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filter states initialized from URL
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv' | 'anime'>(
    (searchParams.get('type') as any) || 'all'
  );
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
  const [country, setCountry] = useState(searchParams.get('country') || 'all');
  const [provider, setProvider] = useState(searchParams.get('provider') || 'all');
  const [year, setYear] = useState(searchParams.get('year') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'popularity.desc');

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Sync state with URL params when user clicks external links
  useEffect(() => {
    const t = searchParams.get('type');
    if (t) setMediaType(t as any);
    const g = searchParams.get('genre');
    if (g) setGenre(g);
    const c = searchParams.get('country');
    if (c) setCountry(c);
    const p = searchParams.get('provider');
    if (p) setProvider(p);
    const y = searchParams.get('year');
    if (y) setYear(y);
    const s = searchParams.get('sort');
    if (s) setSort(s);
  }, [searchParams]);

  // Update URL whenever filters change
  const updateUrl = useCallback(
    (newFilters: Record<string, string>) => {
      const params = new URLSearchParams();
      if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type);
      if (newFilters.genre && newFilters.genre !== 'all') params.set('genre', newFilters.genre);
      if (newFilters.country && newFilters.country !== 'all') params.set('country', newFilters.country);
      if (newFilters.provider && newFilters.provider !== 'all') params.set('provider', newFilters.provider);
      if (newFilters.year && newFilters.year !== 'all') params.set('year', newFilters.year);
      if (newFilters.sort && newFilters.sort !== 'popularity.desc') params.set('sort', newFilters.sort);

      const qs = params.toString();
      router.push(`/browse${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router]
  );

  // Fetch initial results on filter change
  useEffect(() => {
    setLoading(true);
    setPage(1);

    const query = new URLSearchParams({
      type: mediaType,
      genre,
      country,
      provider,
      year,
      sort,
      page: '1',
    });

    fetch(`/api/browse?${query.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.results) {
          setItems(data.results);
          setHasMore(data.hasMore ?? data.results.length >= 10);
        }
      })
      .catch((err) => console.warn('Browse fetch error:', err))
      .finally(() => setLoading(false));
  }, [mediaType, genre, country, provider, year, sort]);

  // Load More Handler
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const query = new URLSearchParams({
        type: mediaType,
        genre,
        country,
        provider,
        year,
        sort,
        page: String(nextPage),
      });

      const res = await fetch(`/api/browse?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.results && data.results.length > 0) {
          setItems((prev) => [...prev, ...data.results]);
          setPage(nextPage);
          setHasMore(data.hasMore);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.warn('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReset = () => {
    setMediaType('all');
    setGenre('all');
    setCountry('all');
    setProvider('all');
    setYear('all');
    setSort('popularity.desc');
    router.push('/browse');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 min-h-screen">
      {/* Page Title & Active Summary */}
      <div className="space-y-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Explore Catalog & Filters
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Filter thousands of titles by media type, genre, country, provider network, and year.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 space-y-4 shadow-xl">
        {/* Row 1: Primary Media Type Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">
            Type:
          </span>
          {[
            { label: 'All', value: 'all' },
            { label: 'Movies', value: 'movie' },
            { label: 'TV Shows', value: 'tv' },
            { label: 'Anime HD', value: 'anime' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setMediaType(tab.value as any);
                updateUrl({ type: tab.value, genre, country, provider, year, sort });
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mediaType === tab.value
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={handleReset}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Row 2: Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* Genre Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Genre
            </label>
            <div className="relative">
              <select
                value={genre}
                onChange={(e) => {
                  setGenre(e.target.value);
                  updateUrl({ type: mediaType, genre: e.target.value, country, provider, year, sort });
                }}
                className="w-full bg-[#11141f] text-gray-200 rounded-xl px-3 py-2 border border-white/10 appearance-none focus:outline-none focus:border-red-500 font-medium"
              >
                {GENRES_LIST.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Country
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  updateUrl({ type: mediaType, genre, country: e.target.value, provider, year, sort });
                }}
                className="w-full bg-[#11141f] text-gray-200 rounded-xl px-3 py-2 border border-white/10 appearance-none focus:outline-none focus:border-red-500 font-medium"
              >
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Provider Network Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Provider
            </label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  updateUrl({ type: mediaType, genre, country, provider: e.target.value, year, sort });
                }}
                className="w-full bg-[#11141f] text-gray-200 rounded-xl px-3 py-2 border border-white/10 appearance-none focus:outline-none focus:border-red-500 font-medium"
              >
                {PROVIDERS_LIST.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Release Year Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Release Year
            </label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  updateUrl({ type: mediaType, genre, country, provider, year: e.target.value, sort });
                }}
                className="w-full bg-[#11141f] text-gray-200 rounded-xl px-3 py-2 border border-white/10 appearance-none focus:outline-none focus:border-red-500 font-medium"
              >
                {YEARS_LIST.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  updateUrl({ type: mediaType, genre, country, provider, year, sort: e.target.value });
                }}
                className="w-full bg-[#11141f] text-gray-200 rounded-xl px-3 py-2 border border-white/10 appearance-none focus:outline-none focus:border-red-500 font-medium"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-900 border border-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 mx-auto border border-white/10">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">No titles matched your filters</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try adjusting your genre, year, or provider options, or click reset to view all popular movies and shows.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {items.map((movie) => (
              <MovieCard key={`${movie.media_type || 'title'}-${movie.id}`} movie={movie} />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/25 hover:shadow-red-600/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading Titles...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Results</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
          Loading catalog filters...
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
