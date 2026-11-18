export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          preferred_quality: '480p' | '720p' | '1080p' | '4k';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          preferred_quality?: '480p' | '720p' | '1080p' | '4k';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          preferred_quality?: '480p' | '720p' | '1080p' | '4k';
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: string;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      custom_streams: {
        Row: {
          id: string;
          tmdb_id: string;
          title: string;
          media_type: 'movie' | 'tv';
          season: number | null;
          episode: number | null;
          stream_url: string;
          stream_type: 'hls' | 'mp4' | 'embed';
          quality: '480p' | '720p' | '1080p' | '4k';
          provider_name: string;
          poster_path: string | null;
          backdrop_path: string | null;
          overview: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tmdb_id: string;
          title: string;
          media_type: 'movie' | 'tv';
          season?: number | null;
          episode?: number | null;
          stream_url: string;
          stream_type?: 'hls' | 'mp4' | 'embed';
          quality?: '480p' | '720p' | '1080p' | '4k';
          provider_name?: string;
          poster_path?: string | null;
          backdrop_path?: string | null;
          overview?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tmdb_id?: string;
          title?: string;
          media_type?: 'movie' | 'tv';
          season?: number | null;
          episode?: number | null;
          stream_url?: string;
          stream_type?: 'hls' | 'mp4' | 'embed';
          quality?: '480p' | '720p' | '1080p' | '4k';
          provider_name?: string;
          poster_path?: string | null;
          backdrop_path?: string | null;
          overview?: string | null;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          content_type: 'movie' | 'tv';
          title: string;
          poster_path: string | null;
          season_number: number | null;
          episode_number: number | null;
          progress_seconds: number;
          duration_seconds: number;
          completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          content_type: 'movie' | 'tv';
          title: string;
          poster_path?: string | null;
          season_number?: number | null;
          episode_number?: number | null;
          progress_seconds?: number;
          duration_seconds?: number;
          completed?: boolean;
          last_watched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          content_type?: 'movie' | 'tv';
          title?: string;
          poster_path?: string | null;
          season_number?: number | null;
          episode_number?: number | null;
          progress_seconds?: number;
          duration_seconds?: number;
          completed?: boolean;
          last_watched_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          content_type: 'movie' | 'tv';
          title: string;
          poster_path: string | null;
          rating: number | null;
          release_year: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          content_type: 'movie' | 'tv';
          title: string;
          poster_path?: string | null;
          rating?: number | null;
          release_year?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          content_type?: 'movie' | 'tv';
          title?: string;
          poster_path?: string | null;
          rating?: number | null;
          release_year?: string | null;
          created_at?: string;
        };
      };
      stream_cache: {
        Row: {
          id: string;
          content_id: string;
          content_type: string;
          provider_name: string;
          stream_data: Json;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          content_id: string;
          content_type: string;
          provider_name: string;
          stream_data: Json;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          content_id?: string;
          content_type?: string;
          provider_name?: string;
          stream_data?: Json;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
