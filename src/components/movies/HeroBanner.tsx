'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Star, Clock, Info, Check } from 'lucide-react';
import { Movie } from '@/types/content';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';

interface HeroBannerProps {
  movie: Movie;
}

export function HeroBanner({ movie }: HeroBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  const backdropUrl = !imageError && movie.backdrop_path
    ? (movie.backdrop_path.startsWith('http')
        ? movie.backdrop_path
        : `${TMDB_IMAGE_SIZES.backdrop.original}${movie.backdrop_path}`)
    : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1920&q=80';

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : '2024';

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] min-h-[520px] max-h-[850px] overflow-hidden">
      {/* Background Poster / Backdrop */}
      <div className="absolute inset-0">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          sizes="100vw"
          priority
          onError={() => setImageError(true)}
          className="object-cover object-top scale-105 animate-in fade-in duration-700"
        />
        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060709] via-[#060709]/75 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-[#060709]/40 z-10" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Spotlight Tag & Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/30">
              Spotlight #{movie.quality || 'HD'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{movie.vote_average?.toFixed(1) || '8.2'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{movie.formatted_duration || '2h 21m'}</span>
            </div>
            <span className="text-xs font-semibold text-gray-400 px-2 py-1 rounded-md bg-white/5">
              {releaseYear}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
            {movie.title}
          </h1>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-300">
            {movie.genres?.map((g) => (
              <span key={g.id} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                {g.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-xl">
            {movie.overview}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/watch/${movie.id}`}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Watch Now</span>
            </Link>

            <button
              onClick={() => setInWatchlist(!inWatchlist)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm sm:text-base backdrop-blur-md border transition-all hover:scale-105 active:scale-95 ${
                inWatchlist
                  ? 'bg-emerald-600/90 text-white border-emerald-500/40 shadow-lg shadow-emerald-600/20'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
            >
              {inWatchlist ? (
                <>
                  <Check className="w-5 h-5 text-emerald-200" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-gray-200" />
                  <span>Watchlist</span>
                </>
              )}
            </button>

            <Link
              href={`/watch/${movie.id}#details`}
              className="p-3.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors"
              title="More details"
            >
              <Info className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
