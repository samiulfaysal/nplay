'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Season, Episode } from '@/types/content';
import { Layers, Play, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const activeSeason =
    seasons.find((s) => s.season_number === selectedSeasonNum) ||
    seasons[0] || {
      id: 1,
      season_number: 1,
      name: 'Season 1',
      episode_count: 8,
    };

  const totalEpisodes = activeSeason.episode_count || 8;
  const episodeList = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

  const hasPrev = currentEpisode > 1;
  const hasNext = currentEpisode < totalEpisodes;

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-panel space-y-4">
      {/* Header and Season Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-red-500" />
            <span className="font-bold text-white text-sm">Season & Episodes</span>
          </div>

          {/* Quick Prev / Next Controls */}
          <div className="flex items-center gap-1.5">
            {hasPrev && (
              <Link
                href={`/watch/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode - 1}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
                title="Previous episode"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Link>
            )}
            {hasNext && (
              <Link
                href={`/watch/tv/${tvId}?season=${currentSeason}&episode=${currentEpisode + 1}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-600/30 transition-all"
                title="Next episode"
              >
                <span>Next Ep</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Season Selector Dropdown / Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pb-1 sm:pb-0">
          {seasons.map((season) => {
            const isSelected = season.season_number === selectedSeasonNum;
            return (
              <button
                key={season.id || season.season_number}
                onClick={() => setSelectedSeasonNum(season.season_number)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {season.name || `Season ${season.season_number}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Episode Grid Selector (Scrollable horizontally on mobile, multi-column on desktop) */}
      <div className="flex sm:grid sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 overflow-x-auto sm:overflow-y-auto no-scrollbar whitespace-nowrap max-h-60 pb-2 sm:pb-0 pr-1">
        {episodeList.map((epNum) => {
          const isCurrent =
            selectedSeasonNum === currentSeason && epNum === currentEpisode;

          return (
            <Link
              key={epNum}
              href={`/watch/tv/${tvId}?season=${selectedSeasonNum}&episode=${epNum}`}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-2 rounded-xl text-center transition-all shrink-0 min-w-[68px] sm:min-w-0 ${
                isCurrent
                  ? 'bg-red-600 text-white font-black shadow-lg shadow-red-600/40 ring-2 ring-red-400'
                  : 'bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1">
                {isCurrent && <Play className="w-3 h-3 fill-white" />}
                <span className="text-xs font-bold">Ep {epNum}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
