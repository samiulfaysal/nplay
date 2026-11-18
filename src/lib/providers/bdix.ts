import { IStreamingProvider, ProviderResult, StreamQuery } from './types';
import { StreamSource } from '@/types/content';

export const CIRCLE_FTP_BASE = 'http://new.circleftp.net:5000';
export const DHAKA_FLIX_SERVERS = [
  'http://172.16.50.7/DHAKA-FLIX-7/',
  'http://172.16.50.14/DHAKA-FLIX-14/',
  'http://172.16.50.12/DHAKA-FLIX-12/',
  'http://172.16.50.9/DHAKA-FLIX-9/',
];

export class BdixProvider implements IStreamingProvider {
  name = 'BDIX Pro (Local Direct)';
  priority = 4;

  /**
   * Ping check to detect if client or server has access to BDIX routes
   */
  public static async isReachable(): Promise<boolean> {
    try {
      const res = await fetch(`${CIRCLE_FTP_BASE}/api/posts?searchTerm=test&order=desc`, {
        signal: AbortSignal.timeout(800),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  public async resolve(query: StreamQuery): Promise<ProviderResult | null> {
    const { tmdbId, title = '', year, season = 1, episode = 1 } = query;
    const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, '').trim();

    try {
      if (cleanTitle) {
        const searchUrl = `${CIRCLE_FTP_BASE}/api/posts?searchTerm=${encodeURIComponent(cleanTitle)}&order=desc`;
        const res = await fetch(searchUrl, {
          signal: AbortSignal.timeout(1200),
        });

        if (res.ok) {
          const data = await res.json();
          const posts = data?.posts || data?.data || [];
          if (Array.isArray(posts) && posts.length > 0) {
            const matchedPost = posts[0];
            const postId = matchedPost?._id || matchedPost?.id;

            if (postId) {
              const detailsRes = await fetch(`${CIRCLE_FTP_BASE}/api/posts/${postId}`, {
                signal: AbortSignal.timeout(1200),
              });

              if (detailsRes.ok) {
                const details = await detailsRes.json();
                const directUrl =
                  details?.downloadLink ||
                  details?.fileUrl ||
                  details?.mediaLink ||
                  `${CIRCLE_FTP_BASE}/uploads/${details?.fileName || ''}`;

                if (directUrl && directUrl.startsWith('http')) {
                  return {
                    providerName: this.name,
                    sources: [
                      {
                        id: `bdix-${postId}-circle`,
                        provider: 'BDIX CircleFTP',
                        url: directUrl,
                        type: directUrl.includes('.m3u8') ? 'hls' : 'mp4',
                        quality: '4K / 1080p',
                        isDirect: true,
                        adStatus: 'ad-free',
                        badgeLabel: 'Ad-Free',
                        tooltip: 'Bangladesh BDIX Ultra-Speed Local Mirror (100Mbps unmetered playback)',
                      },
                    ],
                    subtitles: [],
                    adStatus: 'ad-free',
                    badgeLabel: 'Ad-Free',
                    tooltip: 'BDIX Local Mirror (CircleFTP & DhakaFlix)',
                  };
                }
              }
            }
          }
        }
      }
    } catch {
      // Local BDIX not reachable from this network
    }

    return null;
  }
}
