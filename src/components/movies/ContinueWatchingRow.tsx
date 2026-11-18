'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Play, X, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';

export function ContinueWatchingRow() {
  const { history, removeFromHistory } = useWatchHistory();

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600/10 text-red-500">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Continue Watching
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-400">
              Resume your recent movies and series right where you left off
            </p>
          </div>
        </div>

        <span className="text-xs text-gray-400 font-semibold hidden sm:inline">
          {history.length} {history.length === 1 ? 'item' : 'items'} in progress
        </span>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex overflow-x-auto gap-3.5 sm:gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar snap-x snap-mandatory">
        {history.map((item) => {
          const isTv = item.contentType === 'tv';
          const season = item.seasonNumber || 1;
          const episode = item.episodeNumber || 1;

          const watchUrl = isTv
            ? `/watch/tv/${item.contentId}?season=${season}&episode=${episode}`
            : `/watch/movie/${item.contentId}`;

          const imageSrc = item.backdrop_path
            ? item.backdrop_path.startsWith('http')
              ? item.backdrop_path
              : `${TMDB_IMAGE_SIZES.backdrop.medium}${item.backdrop_path}`
            : item.poster_path
            ? item.poster_path.startsWith('http')
              ? item.poster_path
              : `${TMDB_IMAGE_SIZES.poster.medium}${item.poster_path}`
            : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=600&q=80';

          const progress = Math.max(5, Math.min(100, item.progressPercentage || 15));

          return (
            <div
              key={item.id}
              className="group relative flex flex-col w-56 sm:w-64 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-red-500/40 transition-all duration-300 shadow-lg hover:shadow-red-500/10 shrink-0 snap-start"
            >
              {/* Thumbnail Container */}
              <Link
                href={watchUrl}
                className="relative aspect-video w-full overflow-hidden bg-zinc-950 block"
              >
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Ambient dark gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-600/50 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Dismiss / Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  title="Remove from history"
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-gray-300 hover:text-white transition-all backdrop-blur-md opacity-80 group-hover:opacity-100 z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Top Badge: S1:E2 or Movie */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-black uppercase text-gray-200 border border-white/10">
                    {isTv ? `S${season}:E${episode}` : 'Movie'}
                  </span>
                </div>

                {/* Progress Bar at Bottom of Video */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Link>

              {/* Card Footer */}
              <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={watchUrl}
                    className="font-bold text-xs sm:text-sm text-gray-200 hover:text-red-400 line-clamp-1 transition-colors"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <span className="text-red-400 font-semibold">{progress}% watched</span>
                    {isTv && <span>• Ep {episode}</span>}
                  </div>
                </div>

                <Link
                  href={watchUrl}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-red-600 text-[11px] font-bold text-gray-200 hover:text-white transition-colors shrink-0"
                >
                  Resume
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
