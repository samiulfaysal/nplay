export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Movie {
  id: number | string;
  tmdb_id?: number;
  imdb_id?: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  runtime?: number; // minutes
  formatted_duration?: string; // e.g. "1h 48m"
  quality?: "HD" | "FHD" | "4K" | "CAM";
  genres?: { id: number; name: string }[];
  media_type?: "movie" | "tv";
  country?: string;
  tagline?: string;
  cast?: CastMember[];
  trailer_key?: string | null;
  recommendations?: Movie[];
}

export interface TVShow {
  id: number | string;
  tmdb_id?: number;
  imdb_id?: string;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  formatted_duration?: string;
  quality?: "HD" | "FHD" | "4K" | "CAM";
  genres?: { id: number; name: string }[];
  media_type?: "tv";
  seasons?: Season[];
  country?: string;
  tagline?: string;
  cast?: CastMember[];
  trailer_key?: string | null;
  recommendations?: TVShow[];
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime?: number;
}

export type ContentItem = Movie | (TVShow & { title?: string; release_date?: string });

export interface StreamSource {
  id: string;
  provider: string; // e.g., "MovieBox Pro", "4KHDHub Pro", "Stremio Direct Pro", "BDIX Pro", "Dramachi Pro", "Admin Master Pro"
  url: string;
  type: "hls" | "mp4" | "dash";
  quality: string;
  isDirect: boolean;
  headers?: Record<string, string>; // Referer, User-Agent, etc.
  adStatus?: 'ad-free' | 'minimal-ads' | 'has-ads';
  badgeLabel?: 'Ad-Free' | 'Ad-Free Pro' | 'Minimal Ads' | 'Ads';
  tooltip?: string;
}

export interface Subtitle {
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

export interface StreamPlaybackPayload {
  contentId: string;
  contentType: "movie" | "tv";
  title: string;
  sources: StreamSource[];
  subtitles: Subtitle[];
  fallbackEmbedUrl?: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}
