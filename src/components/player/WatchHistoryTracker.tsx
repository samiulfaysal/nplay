'use client';

import { useEffect } from 'react';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { WatchHistoryItem } from '@/types/history';

interface WatchHistoryTrackerProps {
  contentId: string | number;
  contentType: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  seasonNumber?: number;
  episodeNumber?: number;
}

export function WatchHistoryTracker({
  contentId,
  contentType,
  title,
  poster_path,
  backdrop_path,
  seasonNumber,
  episodeNumber,
}: WatchHistoryTrackerProps) {
  const { saveProgress } = useWatchHistory();

  useEffect(() => {
    const isTv = contentType === 'tv';
    const idKey = isTv
      ? `tv_${contentId}_s${seasonNumber || 1}_e${episodeNumber || 1}`
      : `movie_${contentId}`;

    const historyItem: WatchHistoryItem = {
      id: idKey,
      contentId: String(contentId),
      contentType,
      title,
      poster_path,
      backdrop_path,
      seasonNumber: isTv ? (seasonNumber || 1) : undefined,
      episodeNumber: isTv ? (episodeNumber || 1) : undefined,
      progressPercentage: 15, // Starts at 15% progress on opening player
      lastWatchedAt: new Date().toISOString(),
    };

    saveProgress(historyItem);
  }, [contentId, contentType, title, poster_path, backdrop_path, seasonNumber, episodeNumber, saveProgress]);

  return null;
}
