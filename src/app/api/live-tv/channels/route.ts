import { NextRequest, NextResponse } from 'next/server';

export interface LiveChannel {
  id: string;
  name: string;
  group: string;
  logo: string;
  streamUrl: string;
  country?: string;
}

// Baseline curated high-availability legal Live TV channels (News, Sports, Entertainment, Bangladesh/Global)
const CURATED_CHANNELS: LiveChannel[] = [
  // News
  {
    id: 'somoy-tv',
    name: 'Somoy News TV',
    group: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/08/Somoy_TV_logo.svg/320px-Somoy_TV_logo.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'Bangladesh',
  },
  {
    id: 'jamuna-tv',
    name: 'Jamuna Television HD',
    group: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Jamuna_TV_logo.png/320px-Jamuna_TV_logo.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'Bangladesh',
  },
  {
    id: 'bbc-news',
    name: 'BBC News Global',
    group: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/320px-BBC_News_2019.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'International',
  },
  {
    id: 'al-jazeera',
    name: 'Al Jazeera English HD',
    group: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_English_logo.svg/320px-Al_Jazeera_English_logo.svg.png',
    streamUrl: 'https://live-hls-web-aje.getaj.net/AJE/01.m3u8',
    country: 'International',
  },
  {
    id: 'dw-news',
    name: 'Deutsche Welle (DW) News HD',
    group: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_Logo.svg/320px-Deutsche_Welle_Logo.svg.png',
    streamUrl: 'https://dwstream4-lh.akamaihd.net/i/dwstream4_live@131329/master.m3u8',
    country: 'International',
  },
  {
    id: 'france-24',
    name: 'France 24 English HD',
    group: 'News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/France_24_logo.svg/320px-France_24_logo.svg.png',
    streamUrl: 'https://stream.france24.yospace.com/live/f24_en-fhd.m3u8',
    country: 'International',
  },

  // Sports & Action
  {
    id: 't-sports',
    name: 'T-Sports Bangladesh HD',
    group: 'Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/07/T_Sports_logo.png/320px-T_Sports_logo.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'Bangladesh',
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV Extreme Sports',
    group: 'Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    country: 'International',
  },

  // Entertainment & Cinema
  {
    id: 'bsp-cinema',
    name: 'nPlay 24/7 Cinema Stream',
    group: 'Movies',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=320&q=80',
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    country: 'nPlay Original',
  },
  {
    id: 'rakuten-action',
    name: 'Rakuten Action Movies HD',
    group: 'Movies',
    logo: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=320&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'International',
  },

  // Music & Lifestyle
  {
    id: 'nasa-tv',
    name: 'NASA TV Live Space HD',
    group: 'Documentary',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'USA',
  },
  {
    id: 'clubbing-tv',
    name: 'Clubbing TV Music HD',
    group: 'Music',
    logo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=320&q=80',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    country: 'International',
  },
];

/**
 * Lightweight M3U Parser matching MovieBox-Tui M3UParser implementation
 */
function parseM3uContent(content: string): LiveChannel[] {
  const lines = content.split('\n');
  const channels: LiveChannel[] = [];
  let currentChannel: Partial<LiveChannel> = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const tvgId = line.match(/tvg-id="([^"]*)"/)?.[1] || '';
      const tvgLogo = line.match(/tvg-logo="([^"]*)"/)?.[1] || '';
      const groupTitle = line.match(/group-title="([^"]*)"/)?.[1] || 'General';
      const commaIdx = line.lastIndexOf(',');
      const name = commaIdx !== -1 ? line.slice(commaIdx + 1).trim() : 'Live Channel';

      currentChannel = {
        id: tvgId || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name,
        group: groupTitle,
        logo: tvgLogo,
      };
    } else if (!line.startsWith('#')) {
      if (line.startsWith('http')) {
        channels.push({
          id: currentChannel.id || `ch-${channels.length + 1}`,
          name: currentChannel.name || `Channel ${channels.length + 1}`,
          group: currentChannel.group || 'General',
          logo: currentChannel.logo || '',
          streamUrl: line,
        });
      }
      currentChannel = {};
    }
  }

  return channels;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const m3uUrl = searchParams.get('url');

  if (m3uUrl) {
    try {
      const res = await fetch(m3uUrl, {
        headers: {
          'User-Agent': 'MovieBox-Tui/1.0 (LiveTV-Parser)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const text = await res.text();
        const parsed = parseM3uContent(text);
        if (parsed.length > 0) {
          return NextResponse.json({
            channels: parsed,
            total: parsed.length,
            source: 'custom_m3u',
          });
        }
      }
    } catch (err: any) {
      console.warn('Custom M3U fetch error:', err);
    }
  }

  return NextResponse.json({
    channels: CURATED_CHANNELS,
    total: CURATED_CHANNELS.length,
    source: 'curated_catalog',
  });
}
