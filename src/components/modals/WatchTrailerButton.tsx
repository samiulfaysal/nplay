'use client';

import React, { useState } from 'react';
import { Film } from 'lucide-react';
import { TrailerModal } from '@/components/modals/TrailerModal';

interface WatchTrailerButtonProps {
  title: string;
  tmdbId: string | number;
  mediaType?: 'movie' | 'tv' | string;
  trailerKey?: string | null;
  variant?: 'pill' | 'circle';
  className?: string;
}

export function WatchTrailerButton({
  title,
  tmdbId,
  mediaType = 'movie',
  trailerKey,
  variant = 'pill',
  className = '',
}: WatchTrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'circle' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 ${className}`}
          title="Watch Official Trailer"
        >
          <Film className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors border border-white/5 active:scale-95 ${className}`}
          title="Watch Official YouTube Trailer"
        >
          <Film className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Trailer</span>
        </button>
      )}

      <TrailerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        tmdbId={tmdbId}
        mediaType={mediaType}
        trailerKey={trailerKey}
      />
    </>
  );
}
