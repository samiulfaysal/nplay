import { IStreamingProvider, ProviderResult, StreamQuery } from './types';
import { StreamSource, Subtitle } from '@/types/content';

export class DramachiProvider implements IStreamingProvider {
  name = 'Dramachi Pro';
  priority = 3;

  private baseUrl = 'https://api.nodeobjects.com/';

  public async resolve(query: StreamQuery): Promise<ProviderResult | null> {
    const { tmdbId, type, title = '', year, season = 1, episode = 1 } = query;
    const cleanTitle = title.trim();

    try {
      if (cleanTitle) {
        const searchUrl = `${this.baseUrl}?interface=search&q=${encodeURIComponent(cleanTitle)}&filter=all&page=1`;
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const searchData = await res.json();
          const items = searchData?.data || [];

          if (Array.isArray(items) && items.length > 0) {
            const matched = items.find((item: any) => {
              const itemTitle = (item.title || '').toLowerCase();
              return itemTitle.includes(cleanTitle.toLowerCase());
            }) || items[0];

            const titleId = matched?.id;
            if (titleId) {
              // Fetch title details
              const detailsUrl = `${this.baseUrl}?interface=title_v2&id=${encodeURIComponent(titleId)}`;
              const detailsRes = await fetch(detailsUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
                signal: AbortSignal.timeout(4000),
              });

              if (detailsRes.ok) {
                const detailsData = await detailsRes.json();
                const seasonsMap = detailsData?.seasons || {};
                const firstSeasonKey = Object.keys(seasonsMap)[0];
                const rip = seasonsMap[firstSeasonKey]?.versions?.[0]?.rip || firstSeasonKey;

                // Fetch episode list
                if (rip) {
                  const epListUrl = `${this.baseUrl}?interface=eplist&season=${encodeURIComponent(rip)}&id=${encodeURIComponent(titleId)}`;
                  const epRes = await fetch(epListUrl, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    },
                    signal: AbortSignal.timeout(4000),
                  });

                  if (epRes.ok) {
                    const epData = await epRes.json();
                    const epList = epData?.episode_list || [];
                    const targetEp = epList[Math.max(0, episode - 1)] || epList[0];

                    if (targetEp?.fid && targetEp?.disk) {
                      const getFileUrl = `${this.baseUrl}?interface=getFile&fid=${encodeURIComponent(targetEp.fid)}&findex=${encodeURIComponent(targetEp.disk)}`;
                      const fileRes = await fetch(getFileUrl, {
                        headers: {
                          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        },
                        signal: AbortSignal.timeout(4000),
                      });

                      if (fileRes.ok) {
                        const fileData = await fileRes.json();
                        const host = fileData?.hostInfo?.host || fileData?.host_info?.host;
                        const fileUrl = fileData?.fileInfo?.[0]?.url || fileData?.file_info?.[0]?.url;

                        if (host && fileUrl) {
                          const directStream = `https://${host.replace(/\/$/, '')}/cdn/${fileUrl.replace(/^\//, '')}`;
                          return {
                            providerName: this.name,
                            sources: [
                              {
                                id: `dramachi-${titleId}-${targetEp.fid}`,
                                provider: this.name,
                                url: `/api/stream/proxy?url=${encodeURIComponent(directStream)}`,
                                type: directStream.includes('.m3u8') ? 'hls' : 'mp4',
                                quality: '1080p HD',
                                isDirect: true,
                                adStatus: 'ad-free',
                                badgeLabel: 'Ad-Free',
                                tooltip: 'Dramachi dedicated Asian Drama direct CDN stream (K-Drama / C-Drama / J-Drama)',
                              },
                            ],
                            subtitles: [],
                            adStatus: 'ad-free',
                            badgeLabel: 'Ad-Free',
                            tooltip: 'Dramachi Ad-Free direct Asian drama & anime feed',
                          };
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Dramachi] Resolver warning:', err);
    }

    return null;
  }
}
