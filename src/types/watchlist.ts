export interface WatchlistItem {
  contentId: string;
  contentType: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  rating?: number;
  release_year?: string;
  overview?: string;
  added_at: string; // ISO string
}
