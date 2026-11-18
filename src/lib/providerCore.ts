import { StreamSource, Subtitle } from '@/types/content';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { getAppSettings } from '@/lib/settingsStore';
import {
  MovieBoxProvider,
  FourKHdHubProvider,
  DramachiProvider,
  BdixProvider,
  StremioProvider,
} from '@/lib/providers';

export interface StreamQuery {
  tmdbId: string | number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  year?: number | string;
}

export interface EmbedServer {
  id: string;
  name: string;
  url: string;
  quality: '4K / 1080p' | '1080p HD';
  adStatus: 'ad-free' | 'minimal-ads' | 'has-ads';
  badgeLabel: 'Ad-Free' | 'Ad-Free Pro' | 'Minimal Ads' | 'Ads';
  tooltip: string;
  isVerifiedAvailable?: boolean;
}

export interface SparkBoxPayload {
  contentId: string;
  contentType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title: string;
  sources: StreamSource[];
  embedServers: EmbedServer[];
  subtitles: Subtitle[];
  fallbackEmbedUrl: string;
}

/**
 * SparkBoxCore: Multi-source streaming provider architecture ported from MovieBox-Tui.
 * Aggregates direct streams (MovieBox Core, 4KHDHub, Dramachi, BDIX, Stremio Addons),
 * custom admin overrides, and multi-server embed mirrors.
 */
export class SparkBoxCoreService {
  private cache: Map<string, { data: SparkBoxPayload; expiresAt: number }> =
    new Map();

  private movieBoxProvider = new MovieBoxProvider();
  private fourKHdHubProvider = new FourKHdHubProvider();
  private dramachiProvider = new DramachiProvider();
  private bdixProvider = new BdixProvider();
  private stremioProvider = new StremioProvider();

  private generateCacheKey(query: StreamQuery): string {
    const s = query.type === 'tv' ? query.season || 1 : 0;
    const e = query.type === 'tv' ? query.episode || 1 : 0;
    return `${query.type}-${query.tmdbId}-s${s}-e${e}`;
  }

  /**
   * Resolve playable streaming sources across all MovieBox-Tui providers
   */
  public async resolveStream(query: StreamQuery): Promise<SparkBoxPayload> {
    const cacheKey = this.generateCacheKey(query);

    // 1. Check in-memory cache (30 min TTL)
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const {
      tmdbId,
      imdbId,
      type,
      season = 1,
      episode = 1,
      title = 'Streaming Title',
      year = '',
    } = query;

    // 2. Pure Native Direct Architecture - Zero 3rd party iframes or popup embeds
    const embedServers: EmbedServer[] = [];

    // 3. Resolve all Pro Providers in parallel
    const directSources: StreamSource[] = [];
    const directSubtitles: Subtitle[] = [];

    const providerQuery = {
      tmdbId,
      imdbId,
      type,
      season,
      episode,
      title,
      year,
    };

    try {
      const [mbRes, fourKRes, dramaRes, bdixRes, stremioRes] = await Promise.allSettled([
        this.movieBoxProvider.resolve(providerQuery),
        this.fourKHdHubProvider.resolve(providerQuery),
        this.dramachiProvider.resolve(providerQuery),
        this.bdixProvider.resolve(providerQuery),
        this.stremioProvider.resolve(providerQuery),
      ]);

      if (mbRes.status === 'fulfilled' && mbRes.value?.sources && mbRes.value.sources.length > 0) {
        directSources.push(...mbRes.value.sources);
        if (mbRes.value.subtitles) {
          directSubtitles.push(...mbRes.value.subtitles);
        }
      }

      if (fourKRes.status === 'fulfilled' && fourKRes.value?.sources && fourKRes.value.sources.length > 0) {
        directSources.push(...fourKRes.value.sources);
      }

      if (stremioRes.status === 'fulfilled' && stremioRes.value?.sources && stremioRes.value.sources.length > 0) {
        directSources.push(...stremioRes.value.sources);
      }

      if (bdixRes.status === 'fulfilled' && bdixRes.value?.sources && bdixRes.value.sources.length > 0) {
        directSources.push(...bdixRes.value.sources);
      }

      if (dramaRes.status === 'fulfilled' && dramaRes.value?.sources && dramaRes.value.sources.length > 0) {
        directSources.push(...dramaRes.value.sources);
      }
    } catch (err) {
      console.warn('[SparkBoxCore] Provider fan-out warning:', err);
    }

    // 4. Guaranteed Representation for the 6 Pro Servers
    // 1) MovieBox Pro
    if (!directSources.some((s) => s.provider?.toLowerCase().includes('moviebox'))) {
      directSources.push({
        id: `moviebox-${tmdbId}-core`,
        provider: 'MovieBox Pro',
        url: `/api/stream/resolve?provider=moviebox&tmdbId=${tmdbId}&imdbId=${imdbId || ''}&type=${type}&season=${season}&episode=${episode}&title=${encodeURIComponent(title)}`,
        type: 'dash',
        quality: '4K / 1080p',
        isDirect: true,
        adStatus: 'ad-free',
        badgeLabel: 'Ad-Free Pro',
        tooltip: 'MovieBox Pro high-bitrate direct stream with zero ads and multi-audio tracks',
      });
    }

    // 2) 4KHDHub Pro
    if (!directSources.some((s) => s.provider?.toLowerCase().includes('4khd'))) {
      directSources.push({
        id: `4khd-${tmdbId}-core`,
        provider: '4KHDHub Pro',
        url: `/api/stream/resolve?provider=4khdhub&tmdbId=${tmdbId}&type=${type}&title=${encodeURIComponent(title)}`,
        type: 'hls',
        quality: '4K UHD',
        isDirect: true,
        adStatus: 'ad-free',
        badgeLabel: 'Ad-Free Pro',
        tooltip: '4KHDHub Pro ultra-high bitrate 4K/1080p stream with zero ads',
      });
    }

    // 3) Stremio Direct Pro
    if (!directSources.some((s) => s.provider?.toLowerCase().includes('stremio'))) {
      directSources.push({
        id: `stremio-${tmdbId}-core`,
        provider: 'Stremio Direct Pro',
        url: `/api/stream/resolve?provider=stremio&tmdbId=${tmdbId}&imdbId=${imdbId || ''}&type=${type}&season=${season}&episode=${episode}`,
        type: 'hls',
        quality: '1080p HD',
        isDirect: true,
        adStatus: 'ad-free',
        badgeLabel: 'Ad-Free Pro',
        tooltip: 'Stremio Direct Pro community multi-addon streaming feed',
      });
    }

    // 4) BDIX Pro (Local Direct)
    if (!directSources.some((s) => s.provider?.toLowerCase().includes('bdix'))) {
      directSources.push({
        id: `bdix-${tmdbId}-core`,
        provider: 'BDIX Pro (Local Direct)',
        url: `/api/stream/resolve?provider=bdix&tmdbId=${tmdbId}&title=${encodeURIComponent(title)}`,
        type: 'mp4',
        quality: '1080p HD',
        isDirect: true,
        adStatus: 'ad-free',
        badgeLabel: 'Ad-Free Pro',
        tooltip: 'Bangladesh BDIX Ultra-Speed Local Mirror (100Mbps unmetered playback)',
      });
    }

    // 5) Dramachi Pro
    if (!directSources.some((s) => s.provider?.toLowerCase().includes('dramachi'))) {
      directSources.push({
        id: `dramachi-${tmdbId}-core`,
        provider: 'Dramachi Pro',
        url: `/api/stream/resolve?provider=dramachi&tmdbId=${tmdbId}&type=${type}&season=${season}&episode=${episode}&title=${encodeURIComponent(title)}`,
        type: 'hls',
        quality: '1080p HD',
        isDirect: true,
        adStatus: 'ad-free',
        badgeLabel: 'Ad-Free Pro',
        tooltip: 'Dramachi Pro dedicated Asian drama & anime direct CDN stream',
      });
    }

    // 6) Admin Master Pro (Check for admin custom stream overrides in Supabase)
    let hasAdminStream = false;
    try {
      const supabase = await createServerSupabaseClient();
      let customQuery: any = supabase
        .from('custom_streams' as any)
        .select('*')
        .eq('tmdb_id', String(tmdbId))
        .eq('media_type', type);

      if (type === 'tv') {
        customQuery = customQuery.eq('season', season).eq('episode', episode);
      }

      const { data: customList }: any = await customQuery;

      if (Array.isArray(customList) && customList.length > 0) {
        hasAdminStream = true;
        customList.forEach((cs: any) => {
          directSources.unshift({
            id: `custom-direct-${cs.id}`,
            provider: `${cs.provider_name || 'Admin Master'} Pro`,
            url: cs.stream_url,
            type: cs.stream_type === 'mp4' ? 'mp4' : cs.stream_type === 'dash' ? 'dash' : 'hls',
            quality: cs.quality || '4K / 1080p',
            isDirect: true,
            adStatus: 'ad-free',
            badgeLabel: 'Ad-Free Pro',
            tooltip: 'Admin verified master direct native stream with zero ads',
          });
        });
      }
    } catch {
      // Non-blocking fallback
    }

    if (!hasAdminStream) {
      directSources.push({
        id: `admin-master-${tmdbId}-core`,
        provider: 'Admin Master Pro',
        url: '',
        type: 'hls',
        quality: '4K UHD',
        isDirect: true,
        adStatus: 'ad-free',
        badgeLabel: 'Ad-Free Pro',
        tooltip: 'Admin Master verified direct feed (Managed via Netfly Admin Portal)',
      });
    }

    // 5. Deduplicate subtitles and ensure baseline defaults
    const seenSubLang = new Set<string>();
    const subtitles: Subtitle[] = [];

    for (const sub of directSubtitles) {
      if (!seenSubLang.has(sub.language)) {
        seenSubLang.add(sub.language);
        subtitles.push(sub);
      }
    }

    if (!seenSubLang.has('en')) {
      subtitles.push({
        language: 'en',
        label: 'English [CC]',
        url: '/subtitles/en.vtt',
        default: true,
      });
    }

    const payload: SparkBoxPayload = {
      contentId: String(tmdbId),
      contentType: type,
      season: type === 'tv' ? season : undefined,
      episode: type === 'tv' ? episode : undefined,
      title,
      sources: directSources,
      embedServers,
      subtitles,
      fallbackEmbedUrl: '',
    };

    // Cache result for 30 minutes
    this.cache.set(cacheKey, {
      data: payload,
      expiresAt: Date.now() + 1800 * 1000,
    });

    return payload;
  }
}

export const SparkBoxCore = new SparkBoxCoreService();
export const ProviderCore = SparkBoxCore;
