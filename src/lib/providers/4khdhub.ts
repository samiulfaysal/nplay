import { IStreamingProvider, ProviderResult, StreamQuery } from './types';
import { StreamSource } from '@/types/content';

export class FourKHdHubProvider implements IStreamingProvider {
  name = '4KHDHub Pro';
  priority = 2;

  private baseUrl = 'https://4khdhub.one';

  public async resolve(query: StreamQuery): Promise<ProviderResult | null> {
    const { tmdbId, type, title = '', year } = query;
    const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').trim();

    try {
      if (cleanTitle) {
        const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(cleanTitle)}`;
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const html = await res.text();
          // Extract post links matching title or year
          const linkMatches = [...html.matchAll(/<a\s+href="([^"]+)"\s+rel="bookmark"[^>]*>([^<]+)<\/a>/gi)];
          
          let matchedUrl = '';
          for (const match of linkMatches) {
            const postHref = match[1];
            const postTitle = match[2].toLowerCase();
            if (postTitle.includes(cleanTitle.toLowerCase())) {
              if (!year || postTitle.includes(String(year))) {
                matchedUrl = postHref;
                break;
              }
            }
          }

          if (matchedUrl) {
            const pageRes = await fetch(matchedUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
              signal: AbortSignal.timeout(4000),
            });

            if (pageRes.ok) {
              const pageHtml = await pageRes.text();
              const hubLinks = [
                ...pageHtml.matchAll(/href="(https:\/\/[^"]*(?:hubcloud|gdflix|gamerxyt|pixeldrain)[^"]*)"/gi),
              ].map((m) => m[1]);

              // Ensure only direct media files (.m3u8 or .mp4) are offered as direct streams
              const directMediaLinks = hubLinks.filter(
                (l) => l.includes('.m3u8') || l.includes('.mp4')
              );

              if (directMediaLinks.length > 0) {
                const sources: StreamSource[] = [
                  {
                    id: `4khd-${tmdbId}-4k`,
                    provider: this.name,
                    url: `/api/stream/proxy?url=${encodeURIComponent(directMediaLinks[0])}`,
                    type: directMediaLinks[0].includes('.m3u8') ? 'hls' : 'mp4',
                    quality: '4K UHD',
                    isDirect: true,
                    adStatus: 'ad-free',
                    badgeLabel: 'Ad-Free',
                    tooltip: '4KHDHub high-bitrate 4K UHD stream via direct cloud mirror',
                  },
                ];

                if (directMediaLinks.length > 1) {
                  sources.push({
                    id: `4khd-${tmdbId}-1080p`,
                    provider: this.name,
                    url: `/api/stream/proxy?url=${encodeURIComponent(directMediaLinks[1])}`,
                    type: directMediaLinks[1].includes('.m3u8') ? 'hls' : 'mp4',
                    quality: '1080p HD',
                    isDirect: true,
                    adStatus: 'ad-free',
                    badgeLabel: 'Ad-Free',
                    tooltip: '4KHDHub 1080p Full HD stream with high audio bitrate',
                  });
                }

                return {
                  providerName: this.name,
                  sources,
                  subtitles: [],
                  adStatus: 'ad-free',
                  badgeLabel: 'Ad-Free',
                  tooltip: '4KHDHub ultra-high bitrate 4K/1080p stream with zero ads',
                };
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[4KHDHub] Resolver warning:', err);
    }

    return null;
  }
}
