import { StreamSource, Subtitle } from '@/types/content';

export interface StreamQuery {
  tmdbId: string | number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  year?: number | string;
  resolution?: string;
}

export interface ProviderResult {
  providerName: string;
  sources: StreamSource[];
  subtitles: Subtitle[];
  embedUrl?: string;
  expiresInSeconds?: number;
  adStatus?: 'ad-free' | 'minimal-ads' | 'has-ads';
  badgeLabel?: 'Ad-Free' | 'Minimal Ads' | 'Ads';
  tooltip?: string;
}

export interface IStreamingProvider {
  name: string;
  priority: number;
  disabled?: boolean;
  resolve(query: StreamQuery): Promise<ProviderResult | null>;
}
