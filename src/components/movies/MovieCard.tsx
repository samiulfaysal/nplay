'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, Clock, Tv, Film } from 'lucide-react';
import { Movie, TVShow } from '@/types/content';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';

interface MovieCardProps {
  movie: Movie | TVShow | any;
  priority?: boolean;
  rank?: number;
}

export function MovieCard({ movie, priority = false, rank }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);

  const isTv = movie.media_type === 'tv' || Boolean(movie.name && !movie.title);
  const title = movie.title || movie.name || 'Untitled';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : '2024';

  const rating =
    movie.vote_average && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : '7.5';

  // Format TV series badge like S1 • EP8 or Movie duration like 2h 05m
  let durationOrEps = movie.formatted_duration;
  if (isTv) {
    if (!durationOrEps || durationOrEps === 'TV Series') {
      const s = movie.number_of_seasons || 1;
      const e = movie.number_of_episodes || 8;
      durationOrEps = `S${s} • EP${e}`;
    } else if (durationOrEps.includes('SS') && durationOrEps.includes('EPS')) {
      durationOrEps = durationOrEps.replace('SS ', 'S').replace(' / EPS ', ' • EP');
    }
  } else {
    durationOrEps = durationOrEps || '2h 00m';
  }

  const quality = movie.quality || 'HD';
  const type = isTv ? 'tv' : 'movie';

  const posterUrl =
    !imageError && movie.poster_path
      ? movie.poster_path.startsWith('http')
        ? movie.poster_path
        : `${TMDB_IMAGE_SIZES.poster.medium}${movie.poster_path}`
      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80';

  const watchUrl = `/watch/${type}/${movie.id}`;

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/10 hover:-translate-y-1 active:scale-95 snap-start shrink-0">
      {/* Poster Image Container */}
      <Link
        href={watchUrl}
        className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950 block"
      >
        <Image
          src={posterUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
          onError={() => setImageError(true)}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-black/50 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* TOP OVERLAYS: Quality Badge, Type Badge, IMDb Rating */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          <div className="flex items-center gap-1">
            {/* Quality Badge */}
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md backdrop-blur-md">
              {quality}
            </span>
            {/* Type Badge */}
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/20 text-gray-200 backdrop-blur-md">
              {isTv ? 'TV' : 'Movie'}
            </span>
          </div>

          {/* IMDb Rating Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/30 text-amber-400 font-bold text-[11px] shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{rating}</span>
          </div>
        </div>

        {/* BOTTOM OVERLAY: Duration / Season & Episode Badge */}
        <div className={`absolute bottom-2.5 ${rank ? 'left-14' : 'left-2.5'} z-10 pointer-events-none transition-all`}>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-gray-200 text-[11px] font-medium shadow">
            {isTv ? (
              <Tv className="w-3 h-3 text-red-400" />
            ) : (
              <Clock className="w-3 h-3 text-cyan-400" />
            )}
            <span>{durationOrEps}</span>
          </div>
        </div>

        {/* Ranked Top 10 Overlay Badge (Cinejoy Style) */}
        {rank !== undefined && (
          <div className="absolute -bottom-2.5 left-1 z-20 pointer-events-none select-none">
            <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-red-600 via-rose-500 to-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] italic tracking-tighter">
              #{rank}
            </span>
          </div>
        )}

        {/* Hover Center Play Button Trigger */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-600/60 scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-white translate-x-0.5" />
          </div>
        </div>
      </Link>

      {/* Title & Metadata Footer */}
      <div className="p-3 flex flex-col flex-grow justify-between gap-1.5">
        <Link
          href={watchUrl}
          className="text-sm font-bold text-gray-100 hover:text-red-400 transition-colors line-clamp-1"
          title={title}
        >
          {title}
        </Link>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{releaseYear}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 capitalize truncate max-w-[100px]">
            {movie.genres?.[0]?.name || (isTv ? 'Series' : 'Film')}
          </span>
        </div>
      </div>
    </div>
  );
}
