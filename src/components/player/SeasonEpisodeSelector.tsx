'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Season, Episode } from '@/types/content';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';
import {
  Layers,
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SeasonEpisodeSelectorProps {
  tvId: string | number;
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
}

export function SeasonEpisodeSelector({
  tvId,
  seasons,
  currentSeason,
  currentEpisode,
}: SeasonEpisodeSelectorProps) {
  const [selectedSeasonNum, setSelectedSeasonNum] = useState<number>(currentSeason);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeSeason =
    seasons.find((s) => s.season_number === selectedSeasonNum) ||
    seasons[0] || {
      id: 1,
      season_number: 1,
      name: 'Season 1',
      episode_count: 8,
    };

  const totalEpisodes = activeSeason.episode_count || 8;
  const rawEpisodes = activeSeason.episodes || [];

  // Generate episodes array with fallback data
  const episodeList = useMemo(() => {
    return Array.from({ length: totalEpisodes }, (_, i) => {
      const epNum = i + 1;
      const existing = rawEpisodes.find((e) => e.episode_number === epNum);
      return {
        id: existing?.id || epNum,
        episode_number: epNum,
        season_number: selectedSeasonNum,
        name: existing?.name || `Episode ${epNum}`,
        overview: existing?.overview || '',
        still_path: existing?.still_path || null,
        runtime: existing?.runtime || 45,
      };
    });
  }, [totalEpisodes, rawEpisodes, selectedSeasonNum]);

  // Filter episodes based on search
  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodeList;
    const q = searchQuery.toLowerCase().trim();
    return episodeList.filter(
      (ep) =>
        ep.name.toLowerCase().includes(q) ||
        String(ep.episode_number).includes(q) ||
        ep.overview.toLowerCase().includes(q)
    );
  }, [episodeList, searchQuery]);

  const hasPrev = currentEpisode > 1;
  const hasNext = currentEpisode < totalEpisodes;

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-[#0e1017]/95 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-5">
      {/* 1. Header Toolbar (Season tabs, Prev/Next, and View Mode) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        {/* Left: Section Title & Quick Nav */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-wide leading-none">
                Season & Episodes
              </h2>
              <span className="text-[11px] text-gray-400 font-medium">
                {activeSeason.name || `Season ${selectedSeasonNum}`} · {totalEpisodes} Episodes
              </span>
            </div>
          </div>

          {/* Quick Prev / Next Controls */}
          <div className="flex items-center gap-1.5 ml-2">
            {hasPrev && (
              <Link
                href={`/watch/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode - 1}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors border border-white/5"
                title="Previous episode"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </Link>
            )}
            {hasNext && (
              <Link
                href={`/watch/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode + 1}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg shadow-red-600/25 transition-all"
                title="Next episode"
              >
                <span>Next Ep</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Right: Search Filter & View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Quick Filter Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter episode..."
              className="bg-white/5 hover:bg-white/10 text-xs text-gray-200 placeholder-gray-500 rounded-xl pl-8 pr-3 py-1.5 border border-white/10 focus:outline-none focus:border-red-500 w-36 sm:w-44 transition-all"
            />
          </div>

          {/* View Mode Toggle (Card vs List) */}
          <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'card'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Card View"
              aria-label="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Season Tabs Row (Pills with Active Highlight) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap pb-1">
        {seasons.map((season) => {
          const isSelected = season.season_number === selectedSeasonNum;
          return (
            <button
              key={season.id || season.season_number}
              onClick={() => {
                setSelectedSeasonNum(season.season_number);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.05]'
              }`}
            >
              {season.name || `Season ${season.season_number}`}
              <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                ({season.episode_count || 0})
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Episodes Content Area */}
      {viewMode === 'card' ? (
        /* Widescreen 16:9 Card View (Movy Style) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
          {filteredEpisodes.map((ep) => {
            const isCurrent =
              selectedSeasonNum === currentSeason && ep.episode_number === currentEpisode;

            const stillUrl = ep.still_path
              ? `${TMDB_IMAGE_SIZES.backdrop.small}${ep.still_path}`
              : 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=400&q=80';

            return (
              <Link
                key={ep.episode_number}
                href={`/watch/tv/${tvId}?season=${selectedSeasonNum}&episode=${ep.episode_number}`}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${
                  isCurrent
                    ? 'border-red-500 bg-red-950/20 shadow-lg shadow-red-600/20'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                {/* 16:9 Thumbnail Canvas */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                  <Image
                    src={stillUrl}
                    alt={ep.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Watching Badge (Movy Style) */}
                  {isCurrent && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>Watching</span>
                    </div>
                  )}

                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-gray-300 border border-white/10 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{ep.runtime}m</span>
                  </div>

                  {/* Play Overlay Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-red-500">
                        EP {ep.episode_number}
                      </span>
                      {isCurrent && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                      {ep.name}
                    </h3>
                  </div>

                  {ep.overview && (
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed pt-1">
                      {ep.overview}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Compact List View */
        <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
          {filteredEpisodes.map((ep) => {
            const isCurrent =
              selectedSeasonNum === currentSeason && ep.episode_number === currentEpisode;

            return (
              <Link
                key={ep.episode_number}
                href={`/watch/tv/${tvId}?season=${selectedSeasonNum}&episode=${ep.episode_number}`}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-red-600/20 border border-red-500/50 text-white'
                    : 'bg-white/[0.02] hover:bg-white/[0.06] text-gray-300 hover:text-white border border-transparent hover:border-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      isCurrent
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {ep.episode_number}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold truncate">
                      {ep.name}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">
                      Season {selectedSeasonNum} · Episode {ep.episode_number}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                    {ep.runtime}m
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCurrent
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
