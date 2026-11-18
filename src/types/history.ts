export interface WatchHistoryItem {
  id: string; // composite key: `${contentType}_${contentId}` or `${contentType}_${contentId}_s${seasonNumber}_e${episodeNumber}`
  contentId: string;
  contentType: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  seasonNumber?: number;
  episodeNumber?: number;
  progressPercentage: number; // 0 - 100
  progressSeconds?: number;
  durationSeconds?: number;
  lastWatchedAt: string; // ISO string
}
