'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWatchlist } from '@/hooks/useWatchlist';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';
import {
  Bookmark,
  Trash2,
  Play,
  Film,
  Tv,
  Star,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function WatchlistPage() {
  const { watchlist, loading, removeFromWatchlist } = useWatchlist();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const filteredItems = watchlist.filter((item) => {
    if (filterType === 'all') return true;
    return item.contentType === filterType;
  });

  const movieCount = watchlist.filter((x) => x.contentType === 'movie').length;
  const tvCount = watchlist.filter((x) => x.contentType === 'tv').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[80vh]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <Bookmark className="w-5 h-5 fill-red-500/20" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              My Watchlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-red-400 border border-white/10">
              {watchlist.length} {watchlist.length === 1 ? 'Title' : 'Titles'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Your saved movies and series ready for instant streaming anytime.
          </p>
        </div>

        {/* Filter Pills */}
        {watchlist.length > 0 && (
          <div className="flex items-center bg-[#11141f] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({watchlist.length})
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'movie'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Movies ({movieCount})
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'tv'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              TV Series ({tvCount})
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-zinc-900 border border-white/5" />
          ))}
        </div>
      ) : watchlist.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xl shadow-red-600/10">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Your Watchlist is empty</h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Save movies and TV series you want to watch later by clicking the Bookmark or + Watchlist button on any title.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Discover Trending Titles</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">
          No saved items match this filter category.
        </div>
      ) : (
        /* Watchlist Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredItems.map((item) => {
            const isTv = item.contentType === 'tv';
            const watchUrl = `/watch/${item.contentType}/${item.contentId}`;
            const posterUrl = item.poster_path
              ? item.poster_path.startsWith('http')
                ? item.poster_path
                : `${TMDB_IMAGE_SIZES.poster.medium}${item.poster_path}`
              : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80';

            return (
              <div
                key={item.contentId}
                className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-red-500/40 transition-all duration-300 shadow-lg hover:shadow-red-500/10 hover:-translate-y-1"
              >
                {/* Poster Container */}
                <Link href={watchUrl} className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 block">
                  <Image
                    src={posterUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/50 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Media Type Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-black uppercase text-gray-200 border border-white/10">
                      {isTv ? 'TV' : 'Movie'}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromWatchlist(item.contentId);
                    }}
                    title="Remove from Watchlist"
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/70 hover:bg-red-600/90 text-gray-300 hover:text-white transition-all backdrop-blur-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Link>

                {/* Info Bar */}
                <div className="p-2.5 sm:p-3 flex flex-col flex-grow justify-between gap-1">
                  <Link
                    href={watchUrl}
                    className="font-bold text-xs sm:text-sm text-gray-200 hover:text-red-400 line-clamp-1 transition-colors"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>{item.release_year || '2024'}</span>
                    {item.rating && (
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
