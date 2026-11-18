'use client';

import React, { useState } from 'react';
import { MovieCard } from './MovieCard';
import { Movie, TVShow } from '@/types/content';
import { Flame, Sparkles, TrendingUp, Trophy } from 'lucide-react';

interface MovieGridProps {
  title: string;
  subtitle?: string;
  movies: (Movie | TVShow | any)[];
  showFilterTabs?: boolean;
  showRanks?: boolean;
  icon?: React.ReactNode;
  layout?: 'grid' | 'carousel';
}

export function MovieGrid({
  title,
  subtitle,
  movies,
  showFilterTabs = true,
  showRanks = false,
  icon,
  layout = 'carousel',
}: MovieGridProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'top'>('all');

  const filterTabs = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'top', label: 'Top Rated', icon: Trophy },
  ];

  const displayedMovies =
    activeTab === 'all'
      ? movies
      : activeTab === 'trending'
      ? movies.slice().sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      : movies.slice().sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));

  const isCarousel = layout === 'carousel';

  return (
    <section className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3 sm:pb-4">
        <div>
          <div className="flex items-center gap-2">
            {icon || <Flame className="w-5 h-5 text-red-500 fill-red-500" />}
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Optional Filter Switcher */}
        {showFilterTabs && (
          <div className="flex items-center bg-[#11141f] p-1 rounded-xl border border-white/10 self-start sm:self-auto overflow-x-auto no-scrollbar">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Swipeable Carousel on Mobile, Multi-Column Grid on Tablet/Desktop */}
      <div
        className={
          isCarousel
            ? 'flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4 md:gap-5'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5'
        }
      >
        {displayedMovies.map((movie, index) => (
          <div
            key={`${movie.id}-${index}`}
            className={isCarousel ? 'w-[145px] sm:w-auto shrink-0 snap-start' : ''}
          >
            <MovieCard
              movie={movie}
              priority={index < 4}
              rank={showRanks ? index + 1 : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
