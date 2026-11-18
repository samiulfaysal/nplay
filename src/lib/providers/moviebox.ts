import crypto from 'crypto';
import { IStreamingProvider, ProviderResult, StreamQuery } from './types';
import { StreamSource, Subtitle } from '@/types/content';

const DEFAULT_SECRET_BYTES = Buffer.from([
  0xef, 0xa8, 0x91, 0x97, 0x4e, 0xec, 0xd3, 0x14,
  0x8d, 0xf6, 0x3a, 0xa6, 0x11, 0x60, 0x2d, 0xef,
  0xd1, 0x01, 0x25, 0x9b, 0xa5, 0x21, 0x02, 0x2c,
  0x57, 0xae, 0x05, 0x66, 0xbd, 0x8e,
]);

const STOCK_CERT_SHA256 = '03d4b741632d136bc23e2de4c6adcdb7712f1980b619c183221801730bbd0410';
const BUILD_TAG_SALT = 'oneroom';

const HOST_POOL = [
  'https://api6.aoneroom.com',
  'https://api5.aoneroom.com',
  'https://api4.aoneroom.com',
  'https://api4sg.aoneroom.com',
  'https://api3.aoneroom.com',
  'https://api6sg.aoneroom.com',
  'https://api.inmoviebox.com',
];

function md5Hex(data: string | Buffer): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

function generateXClientToken(ts: number): string {
  const tsStr = String(ts);
  const reversed = tsStr.split('').reverse().join('');
  return `${tsStr},${md5Hex(reversed)}`;
}

function generateXClientBuild(ts: number): string {
  const rand = Math.floor(Math.random() * 1000);
  const stamp = `${Math.floor(ts / 1000)}${String(ts % 1000).padStart(3, '0')}000${rand}`;
  const hash = md5Hex(`${STOCK_CERT_SHA256}${BUILD_TAG_SALT}${stamp}`);
  return `${stamp}.${hash}`;
}

function sortedQueryString(url: string): string {
  try {
    const parsed = new URL(url);
    const params = Array.from(parsed.searchParams.entries());
    if (params.length === 0) return '';
    params.sort((a, b) => a[0].localeCompare(b[0]));
    return params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  } catch {
    return '';
  }
}

function generateXTrSignature(
  method: string,
  accept: string,
  contentType: string,
  url: string,
  body: string,
  ts: number
): string {
  const parsed = new URL(url);
  const sortedQ = sortedQueryString(url);
  const canonicalUrl = sortedQ ? `${parsed.pathname}?${sortedQ}` : parsed.pathname;
  const bodyHash = body ? md5Hex(body) : '';
  const bodyLen = body ? String(Buffer.byteLength(body)) : '';
  const canonical = `${method.toUpperCase()}\n${accept || ''}\n${contentType || ''}\n${bodyLen}\n${ts}\n${bodyHash}\n${canonicalUrl}`;
  const hmac = crypto.createHmac('md5', DEFAULT_SECRET_BYTES).update(canonical).digest('base64');
  return `${ts}|2|${hmac}`;
}

export class MovieBoxProvider implements IStreamingProvider {
  name = 'MovieBox Pro';
  priority = 1;

  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;
  private activeHostIdx = 0;

  private getActiveHost(): string {
    return HOST_POOL[this.activeHostIdx % HOST_POOL.length];
  }

  private rotateHost(): void {
    this.activeHostIdx = (this.activeHostIdx + 1) % HOST_POOL.length;
  }

  private buildHeaders(
    method: string,
    fullUrl: string,
    body: string = '',
    token?: string
  ): Record<string, string> {
    const ts = Date.now();
    const accept = 'application/json';
    const contentType = 'application/json';

    const clientToken = generateXClientToken(ts);
    const signature = generateXTrSignature(method, accept, contentType, fullUrl, body, ts);
    const clientBuild = generateXClientBuild(ts);

    const clientInfoObj = {
      package_name: 'com.community.oneroom',
      version_name: '4.0.01.0813.03',
      version_code: 50020117,
      os: 'android',
      os_version: '12',
      install_ch: 'ps',
      device_id: '8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',
      install_store: 'ps',
      gaid: 'c52b2f63-1254-47f2-95f3-581373562304',
      brand: 'Redmi',
      model: '23078RKD5C',
      system_language: 'en',
      net: 'NETWORK_WIFI',
      region: 'US',
      timezone: 'America/New_York',
      sp_code: '40401',
      'X-Play-Mode': '2',
      'X-Client-Build': clientBuild,
    };

    const headers: Record<string, string> = {
      'User-Agent':
        'com.community.oneroom/50020117 (Linux; U; Android 12; en_US; 23078RKD5C; Build/S1B.220414.015; Cronet/135.0.7012.3)',
      Accept: accept,
      'Content-Type': contentType,
      'x-client-token': clientToken,
      'x-tr-signature': signature,
      'x-client-build': clientBuild,
      'x-client-info': JSON.stringify(clientInfoObj),
    };

    if (token) {
      headers['x-token'] = token;
      headers['authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async ensureSession(): Promise<string | null> {
    if (this.cachedToken && this.tokenExpiresAt > Date.now()) {
      return this.cachedToken;
    }

    for (let attempts = 0; attempts < 3; attempts++) {
      try {
        const host = this.getActiveHost();
        const fullUrl = `${host}/wefeed-mobile-bff/user-api/visitor-login`;
        const body = '{}';
        const headers = this.buildHeaders('POST', fullUrl, body);

        const res = await fetch(fullUrl, {
          method: 'POST',
          headers,
          body,
          signal: AbortSignal.timeout(4000),
        });

        if (!res.ok) {
          this.rotateHost();
          continue;
        }

        const data = await res.json();
        const token = data?.token || data?.data?.token;
        if (token) {
          this.cachedToken = token;
          this.tokenExpiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hrs TTL
          return token;
        }
      } catch {
        this.rotateHost();
      }
    }
    return null;
  }

  /**
   * Search MovieBox catalog for TMDB matched title
   */
  private async searchTitle(
    title: string,
    isTv: boolean,
    token: string
  ): Promise<any | null> {
    const cleanTitle = title.replace(/[^\w\s]/gi, '').trim();
    for (let i = 0; i < 2; i++) {
      try {
        const host = this.getActiveHost();
        const fullUrl = `${host}/wefeed-mobile-bff/subject-api/search/v2`;
        const body = JSON.stringify({
          keyword: cleanTitle || title,
          page: 1,
          perPage: 15,
          subjectType: 0,
        });
        const headers = this.buildHeaders('POST', fullUrl, body, token);

        const res = await fetch(fullUrl, {
          method: 'POST',
          headers,
          body,
          signal: AbortSignal.timeout(4000),
        });

        if (!res.ok) {
          this.rotateHost();
          continue;
        }

        const data = await res.json();
        const results = data?.data?.results || [];
        for (const section of results) {
          const subjects = section?.subjects || [];
          if (subjects.length > 0) {
            const queryNorm = (cleanTitle || title).toLowerCase();
            const matched =
              subjects.find((s: any) => s.title?.toLowerCase().includes(queryNorm)) ||
              subjects[0];
            return matched;
          }
        }
      } catch {
        this.rotateHost();
      }
    }
    return null;
  }

  /**
   * Fetch play info with multi-resolution streams & failover recovery
   */
  public async resolve(query: StreamQuery): Promise<ProviderResult | null> {
    const { tmdbId, type, season = 1, episode = 1, title = '', year } = query;
    const isTv = type === 'tv';

    try {
      const token = await this.ensureSession();
      if (token && title) {
        const item = await this.searchTitle(title, isTv, token);
        const subjectId = item?.subjectId || item?.id;

        if (subjectId) {
          const host = this.getActiveHost();
          const playInfoPath = isTv
            ? `/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}&se=${season}&ep=${episode}`
            : `/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}`;
          const fullUrl = `${host}${playInfoPath}`;
          const headers = this.buildHeaders('GET', fullUrl, '', token);

          const res = await fetch(fullUrl, {
            headers,
            signal: AbortSignal.timeout(5000),
          });

          if (res.ok) {
            const data = await res.json();
            const payload = data?.data || data;

            // Extract captions
            const extCaptions = payload?.extCaptions || [];
            const subtitles: Subtitle[] = extCaptions
              .filter((c: any) => c.url && !c.url.includes('aa348f2541d13ffe'))
              .map((c: any) => ({
                language: c.lan || 'en',
                label: c.lanName || c.lan || 'English',
                url: c.url,
                default: (c.lanName || '').toLowerCase().includes('eng'),
              }));

            // Extract multi-resolution streams
            const rawStreams = payload?.streams || payload?.list || [];
            const sources: StreamSource[] = [];

            for (const s of rawStreams) {
              const streamUrl = s.url || s.playUrl;
              if (!streamUrl) continue;

              // Filter out short preview clips only when full stream is present
              const isPreview = streamUrl.includes('/preview/') && rawStreams.length > 1;
              if (isPreview) {
                continue;
              }

              const resNumber = s.resolution || 1080;
              const qualityLabel =
                resNumber >= 2160
                  ? '4K'
                  : resNumber >= 1080
                  ? '1080p'
                  : resNumber >= 720
                  ? '720p'
                  : '480p';

              const cookieParam = s.signCookie ? `&cookie=${encodeURIComponent(s.signCookie)}` : '';
              const isDash = s.format === 'DASH' || streamUrl.includes('.mpd');
              const streamType = isDash
                ? ('dash' as any)
                : streamUrl.includes('.m3u8')
                ? 'hls'
                : 'mp4';

              sources.push({
                id: `moviebox-${subjectId}-${resNumber}`,
                provider: this.name,
                url: `/api/stream/proxy?url=${encodeURIComponent(streamUrl)}&ref=https://sportslive.wine${cookieParam}`,
                type: streamType,
                quality: qualityLabel,
                isDirect: true,
                adStatus: 'ad-free',
                badgeLabel: 'Ad-Free Pro',
                tooltip: `MovieBox Pro direct native stream (${qualityLabel}) with zero popups and signed CDN caching`,
              });
            }

            if (sources.length > 0) {
              return {
                providerName: this.name,
                sources,
                subtitles,
                adStatus: 'ad-free',
                badgeLabel: 'Ad-Free',
                tooltip: 'Primary MovieBox Core stream with resolution selector and multi-subtitles',
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn('[MovieBox] Core stream lookup warning:', err);
    }

    return null;
  }
}
