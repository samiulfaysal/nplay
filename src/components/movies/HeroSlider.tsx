'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play,
  Star,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Flame,
  Film,
} from 'lucide-react';
import { Movie } from '@/types/content';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';
import { WatchlistButton } from '@/components/movies/WatchlistButton';
import { TrailerModal } from '@/components/modals/TrailerModal';

interface HeroSliderProps {
  movies: Movie[];
}

export function HeroSlider({ movies }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const featuredList = movies.slice(0, 5);
  const currentMovie = featuredList[currentIndex] || movies[0];

  useEffect(() => {
    if (isPaused || featuredList.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, featuredList.length]);

  if (!currentMovie) return null;

  const backdropUrl = currentMovie.backdrop_path
    ? currentMovie.backdrop_path.startsWith('http')
      ? currentMovie.backdrop_path
      : `${TMDB_IMAGE_SIZES.backdrop.original}${currentMovie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1920&q=80';

  const releaseYear = currentMovie.release_date
    ? new Date(currentMovie.release_date).getFullYear()
    : '2024';

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  const watchUrl = `/watch/${currentMovie.media_type || 'movie'}/${currentMovie.id}`;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[420px] sm:h-[480px] md:h-[560px] overflow-hidden group select-none"
    >
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 transition-opacity duration-700 ease-in-out bg-zinc-950">
        <Image
          key={currentMovie.id}
          src={imageError ? 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1920&q=80' : backdropUrl}
          alt={currentMovie.title}
          fill
          sizes="100vw"
          priority
          onError={() => setImageError(true)}
          className="object-cover object-top scale-105 animate-in fade-in duration-700"
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-5 sm:pb-8 md:pb-12">
        <div className="max-w-2xl space-y-2 sm:space-y-3 md:space-y-3.5">
          {/* Spotlight Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/30 flex items-center gap-1">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
              <span>Spotlight #{currentIndex + 1}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/10 text-gray-200 border border-white/10">
              {currentMovie.quality || 'HD'}
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span>{currentMovie.vote_average?.toFixed(1) || '8.2'}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[10px] sm:text-xs font-medium">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>{currentMovie.formatted_duration || '2h 10m'}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-400 px-1.5 py-0.5 rounded-md bg-white/5">
              {releaseYear}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white drop-shadow-lg line-clamp-2">
            {currentMovie.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 text-xs font-medium text-gray-300">
            {currentMovie.genres?.map((g) => (
              <span
                key={g.id}
                className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[10px] sm:text-[11px]"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 sm:line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {currentMovie.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
            <Link
              href={watchUrl}
              className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/50 hover:shadow-red-600/80 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-white" />
              <span>Watch Now</span>
            </Link>

            <button
              type="button"
              onClick={() => setTrailerOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95 transition-all"
            >
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span>Trailer</span>
            </button>

            <WatchlistButton item={currentMovie} variant="hero" />

            <Link
              href={`${watchUrl}#details`}
              className="p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="More details"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Official YouTube Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={currentMovie.title}
        tmdbId={currentMovie.id}
        mediaType={currentMovie.media_type || 'movie'}
      />

      {/* Slider Prev / Next Controls */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-red-600 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/50 hover:bg-red-600 text-white/70 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2">
        {featuredList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'w-8 bg-red-600'
                : 'w-2.5 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
