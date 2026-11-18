'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Star,
  Clock,
  Globe,
  ArrowLeft,
  Share2,
  Film,
  Sparkles,
  Layers,
  Maximize,
} from 'lucide-react';
import { WatchlistButton } from '@/components/movies/WatchlistButton';
import { WatchTrailerButton } from '@/components/modals/WatchTrailerButton';
import { ShareButton } from '@/components/movies/ShareButton';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { StreamSource, Subtitle } from '@/types/content';

interface MovyWatchHeroProps {
  id: string;
  type: 'movie' | 'tv';
  title: string;
  releaseYear: string;
  duration: string;
  rating: number | string;
  quality?: string;
  overview: string;
  backdropUrl: string;
  posterUrl: string;
  genres?: Array<{ id: number; name: string }>;
  country?: string;
  isTv?: boolean;
  season?: number;
  episode?: number;
  trailerKey?: string | null;
  item: any;
  sources?: StreamSource[];
  embedServers?: any[];
  subtitles?: Subtitle[];
  fallbackEmbedUrl?: string;
  imdbId?: string;
  onPlayClick?: () => void;
}

export function MovyWatchHero({
  id,
  type,
  title,
  releaseYear,
  duration,
  rating,
  quality = '4K UHD',
  overview,
  backdropUrl,
  posterUrl,
  genres = [],
  country,
  isTv = false,
  season,
  episode,
  trailerKey,
  item,
  sources = [],
  embedServers = [],
  subtitles = [],
  fallbackEmbedUrl,
  imdbId,
  onPlayClick,
}: MovyWatchHeroProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const handleWatchNow = () => {
    setIsPlaying(true);
    if (onPlayClick) {
      onPlayClick();
    }
  };

  const formattedRating = typeof rating === 'number' ? rating.toFixed(1) : (rating || '8.0');

  // Fullscreen Cinema Video Player View
  if (isPlaying) {
    return (
      <div
        ref={playerContainerRef}
        className="relative w-full rounded-3xl overflow-hidden mb-6 sm:mb-8 border border-white/[0.08] bg-black shadow-2xl p-2 sm:p-4 space-y-3"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              setIsPlaying(false);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/15 transition-all active:scale-95 shadow-md"
            title="Back to Movie Details"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Info</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white font-bold text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
              {title} {isTv && season && episode && `— S${season} E${episode}`}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white shrink-0">
              {quality}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!document.fullscreenElement && playerContainerRef.current) {
                playerContainerRef.current.requestFullscreen().catch(() => {});
              } else if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-semibold border border-white/10 transition-all active:scale-95"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>

        {/* Video Player */}
        <VideoPlayer
          sources={sources}
          embedServers={embedServers}
          subtitles={subtitles}
          poster={backdropUrl}
          fallbackEmbedUrl={fallbackEmbedUrl}
          title={title}
          releaseYear={releaseYear}
          imdbId={imdbId}
          isTv={isTv}
          currentEpisode={episode}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-6 sm:mb-8 border border-white/[0.08] bg-[#0c0d14] shadow-2xl">
      {/* 1. Cinematic Backdrop Image with Multi-Stop Gradients */}
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] overflow-hidden">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 filter brightness-90 transition-transform duration-700"
        />

        {/* Multi-Stop Gradient Overlays (Movy Style) */}
        {/* Bottom fade into canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/70 to-transparent" />
        {/* Left side vignette for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b10]/95 via-[#0a0b10]/60 to-transparent" />
        {/* Top bar vignette */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0b10]/80 to-transparent" />

        {/* Top Quick Navigation Bar */}
        <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-8 flex items-center justify-between z-20">
          {/* Circular Glass Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all active:scale-95 shadow-lg group"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Quality & Media Type Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-600 text-white shadow-lg shadow-red-600/30">
              {quality}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/50 text-gray-200 border border-white/15 backdrop-blur-md">
              {isTv ? 'TV Series' : 'Movie'}
            </span>
          </div>
        </div>

        {/* Hero Content Overlay (Bottom-Left Aligned) */}
        <div className="absolute bottom-6 sm:bottom-10 inset-x-4 sm:inset-x-8 z-20 space-y-3 sm:space-y-4 max-w-4xl">
          {/* Metadata Pill Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* IMDb / Star Rating Badge */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{formattedRating}</span>
            </div>

            {/* Release Year */}
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
              {releaseYear}
            </span>

            {/* Duration */}
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{duration}</span>
            </span>

            {/* Country */}
            {country && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>{country}</span>
              </span>
            )}

            {/* Genre Chips */}
            {genres.slice(0, 3).map((g) => (
              <Link
                key={g.id || g.name}
                href={`/browse?genre=${encodeURIComponent((g.name || '').toLowerCase())}`}
                className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>

          {/* Display Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {title}
            {isTv && season && episode && (
              <span className="text-red-500 text-lg sm:text-2xl md:text-3xl font-bold ml-2">
                (S{season} E{episode})
              </span>
            )}
          </h1>

          {/* Synopsis (Truncated on mobile, clean 2-3 lines on desktop) */}
          <p className="text-xs sm:text-sm md:text-base text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
            {overview}
          </p>

          {/* Action Buttons Row (Movy Style) */}
          <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
            {/* 1. Primary Play CTA Button */}
            <button
              type="button"
              onClick={handleWatchNow}
              className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-red-600/30 transition-all transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Now</span>
            </button>

            {/* 2. Official Trailer Button (Circular Glass) */}
            <WatchTrailerButton
              title={title}
              tmdbId={id}
              mediaType={type}
              trailerKey={trailerKey}
              variant="circle"
            />

            {/* 3. Bookmark / Watchlist (Circular Glass) */}
            <WatchlistButton item={item} variant="circle" />

            {/* 4. Share Button (Circular Glass) */}
            <ShareButton
              title={title}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
