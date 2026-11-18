'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CastMember } from '@/types/content';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';
import { Users, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 320);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [cast]);

  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-3 pt-2 w-full min-w-0 max-w-full overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-red-500" />
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Top Cast
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-lg transition-all ${
              canScrollLeft
                ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                : 'opacity-20 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Scroll cast left"
            title="Previous cast"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-lg transition-all ${
              canScrollRight
                ? 'bg-white/10 hover:bg-white/20 text-white active:scale-95'
                : 'opacity-20 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Scroll cast right"
            title="Next cast"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-4 pb-2 no-scrollbar scroll-smooth w-full min-w-0 max-w-full snap-x snap-mandatory"
      >
        {cast.slice(0, 15).map((actor) => (
          <CastCard key={`${actor.id}-${actor.name}`} actor={actor} />
        ))}
      </div>
    </div>
  );
}

function CastCard({ actor }: { actor: CastMember }) {
  const [imgError, setImgError] = useState(false);

  const profileUrl =
    !imgError && actor.profile_path
      ? actor.profile_path.startsWith('http')
        ? actor.profile_path
        : `${TMDB_IMAGE_SIZES.poster.small}${actor.profile_path}`
      : null;

  return (
    <div className="flex flex-col items-center text-center w-20 sm:w-24 shrink-0 snap-start space-y-1.5 group">
      {/* Circular Avatar */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10 group-hover:border-red-500/50 shadow-md transition-all">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={actor.name}
            fill
            sizes="64px"
            onError={() => setImgError(true)}
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-gray-400">
            <User className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Actor & Character Info */}
      <div className="w-full">
        <div className="text-xs font-bold text-gray-200 group-hover:text-red-400 truncate transition-colors">
          {actor.name}
        </div>
        <div className="text-[10px] text-gray-400 truncate italic">
          {actor.character || 'Cast'}
        </div>
      </div>
    </div>
  );
}
