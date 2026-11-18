import { IStreamingProvider, ProviderResult, StreamQuery } from './types';
import { StreamSource } from '@/types/content';

const DEFAULT_STREMIO_ADDONS = [
  'https://v3-cinemeta.strem.io',
  'https://torrentio.strem.fun',
];

export class StremioProvider implements IStreamingProvider {
  name = 'Stremio Direct Pro';
  priority = 5;

  public async resolve(query: StreamQuery): Promise<ProviderResult | null> {
    const { imdbId, type, season = 1, episode = 1, title = '' } = query;

    if (!imdbId) {
      return null;
    }

    const isTv = type === 'tv';
    const streamPath = isTv
      ? `/stream/series/${imdbId}:${season}:${episode}.json`
      : `/stream/movie/${imdbId}.json`;

    for (const addonBase of DEFAULT_STREMIO_ADDONS) {
      try {
        const streamEndpoint = `${addonBase}${streamPath}`;
        const res = await fetch(streamEndpoint, {
          headers: {
            'User-Agent': 'MovieBox-Tui/1.0 (Addon-Client)',
          },
          signal: AbortSignal.timeout(3000),
        });

        if (res.ok) {
          const data = await res.json();
          const streams = data?.streams || [];

          if (Array.isArray(streams) && streams.length > 0) {
            const sources: StreamSource[] = [];

            for (let i = 0; i < Math.min(streams.length, 3); i++) {
              const item = streams[i];
              const streamUrl = item.url;
              if (!streamUrl || !streamUrl.startsWith('http')) continue;

              const label = item.title || item.name || `Stremio Stream ${i + 1}`;
              const quality = label.includes('4k') || label.includes('2160p') ? '4K' : '1080p';

              sources.push({
                id: `stremio-${imdbId}-${i}`,
                provider: `Stremio Pro (${quality})`,
                url: streamUrl,
                type: streamUrl.includes('.m3u8') ? 'hls' : 'mp4',
                quality,
                isDirect: true,
                adStatus: 'ad-free',
                badgeLabel: 'Ad-Free',
                tooltip: `Community Stremio direct stream: ${label}`,
              });
            }

            if (sources.length > 0) {
              return {
                providerName: this.name,
                sources,
                subtitles: [],
                adStatus: 'ad-free',
                badgeLabel: 'Ad-Free',
                tooltip: 'Stremio Community Addons direct stream bridge',
              };
            }
          }
        }
      } catch {
        // Continue to next addon
      }
    }

    return null;
  }
}
