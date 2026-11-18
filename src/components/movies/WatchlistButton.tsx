'use client';

import React, { useState } from 'react';
import { Bookmark, Check, Plus } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { WatchlistItem } from '@/types/watchlist';

interface WatchlistButtonProps {
  item: {
    id: string | number;
    title?: string;
    name?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    media_type?: 'movie' | 'tv' | string;
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
  };
  variant?: 'hero' | 'header' | 'icon' | 'circle' | 'glass-round';
  className?: string;
}

export function WatchlistButton({
  item,
  variant = 'header',
  className = '',
}: WatchlistButtonProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const contentId = String(item.id);
  const inList = isInWatchlist(contentId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || '';
    const releaseYear = releaseDate ? releaseDate.slice(0, 4) : undefined;
    const mediaType = (item.media_type === 'tv' || (!item.title && item.name)) ? 'tv' : 'movie';

    const watchlistItem: WatchlistItem = {
      contentId,
      contentType: mediaType,
      title,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      rating: item.vote_average,
      release_year: releaseYear,
      overview: item.overview,
      added_at: new Date().toISOString(),
    };

    const added = toggleWatchlist(watchlistItem);

    setToastMessage(added ? 'Added to My List' : 'Removed from My List');
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  if (variant === 'circle' || variant === 'glass-round') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          title={inList ? 'Remove from My List' : 'Save to My List'}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            inList
              ? 'bg-red-600/30 text-red-400 border border-red-500 shadow-lg shadow-red-600/20'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md'
          } ${className}`}
        >
          {inList ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        {toastMessage && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-red-500/50 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm backdrop-blur-md transition-all active:scale-95 ${
            inList
              ? 'bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/30 shadow-lg shadow-red-600/20'
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
          } ${className}`}
        >
          {inList ? (
            <>
              <Check className="w-4 h-4 text-red-400" />
              <span>In Watchlist</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>+ Watchlist</span>
            </>
          )}
        </button>

        {toastMessage && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-red-500/50 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleClick}
          title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`p-2 rounded-xl transition-all active:scale-95 ${
            inList
              ? 'bg-red-600/30 text-red-400 border border-red-500/50'
              : 'bg-black/60 hover:bg-white/20 text-gray-300 hover:text-white border border-white/10'
          } ${className}`}
        >
          {inList ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>

        {toastMessage && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/50 shadow-xl whitespace-nowrap z-50">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  // Default: variant === 'header' (Watch page header style)
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all border active:scale-95 ${
          inList
            ? 'bg-red-600/20 text-red-400 border-red-500/50 shadow-md shadow-red-600/10'
            : 'bg-white/10 hover:bg-white/20 text-gray-200 border-white/5'
        } ${className}`}
        title={inList ? 'In your Watchlist' : 'Add to Watchlist'}
      >
        {inList ? (
          <>
            <Check className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Saved</span>
          </>
        ) : (
          <>
            <Bookmark className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Bookmark</span>
          </>
        )}
      </button>

      {toastMessage && (
        <div className="absolute -top-9 right-0 bg-[#0a0a0f] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-red-500/40 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
