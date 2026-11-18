import React from 'react';
import Link from 'next/link';
import {
  getTrendingTVSeries,
  getAiringTodayTV,
  getTopRatedTV,
  DEMO_TV_SHOWS,
} from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { Tv, Flame, Star, Radio } from 'lucide-react';

export const revalidate = 3600;

interface TVPageProps {
  searchParams: Promise<{ sort?: string }>;
}

export default async function TVSeriesPage({ searchParams }: TVPageProps) {
  const { sort = 'popular' } = await searchParams;

  let tvShows = DEMO_TV_SHOWS;
  let title = 'Popular TV Series';
  let subtitle = 'Binge watch complete seasons of top-rated television dramas';

  if (sort === 'airing_today') {
    tvShows = await getAiringTodayTV(1).catch(() => DEMO_TV_SHOWS);
    title = 'Airing Today';
    subtitle = 'TV series broadcasting fresh new episodes right now';
  } else if (sort === 'top_rated') {
    tvShows = await getTopRatedTV(1).catch(() => DEMO_TV_SHOWS);
    title = 'Top Rated TV Shows';
    subtitle = 'The highest rated television series of all time';
  } else {
    tvShows = await getTrendingTVSeries('week').catch(() => DEMO_TV_SHOWS);
  }

  const tabs = [
    { label: 'Popular', value: 'popular', icon: Flame },
    { label: 'Airing Today', value: 'airing_today', icon: Radio },
    { label: 'Top Rated', value: 'top_rated', icon: Star },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-500" />
            <h1 className="text-3xl font-black text-white">TV Series & Shows</h1>
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
                href={tab.value === 'popular' ? '/tv' : `/tv?sort=${tab.value}`}
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
        movies={tvShows as any}
        showFilterTabs={false}
        layout="grid"
      />
    </div>
  );
}
