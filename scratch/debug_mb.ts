import { MovieBoxProvider } from '../src/lib/providers/moviebox';

// Let's subclass or inspect MovieBoxProvider internals
class DebugMovieBox extends MovieBoxProvider {
  async debugSearch(title: string, isTv: boolean) {
    const token = await (this as any).ensureSession();
    console.log('Session token:', token ? 'GOT TOKEN (len ' + token.length + ')' : 'NO TOKEN');
    if (!token) return;
    const item = await (this as any).searchTitle(title, isTv, token);
    console.log('Search item:', item);
    if (item) {
      const subjectId = item.subjectId || item.id;
      const host = (this as any).getActiveHost();
      const playInfoPath = `/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}`;
      const fullUrl = `${host}${playInfoPath}`;
      const headers = (this as any).buildHeaders('GET', fullUrl, '', token);
      console.log('Fetching play-info from:', fullUrl);
      const res = await fetch(fullUrl, { headers });
      console.log('Play-info status:', res.status);
      const data = await res.json();
      console.log('Play-info data keys:', Object.keys(data));
      console.log('Play-info code/msg:', data.code, data.message);
      const payload = data?.data || data;
      const streams = payload?.streams || payload?.list || [];
      console.log('Streams count:', streams.length);
      streams.forEach((s: any, i: number) => {
        console.log(`Stream ${i}:`, {
          url: (s.url || s.playUrl || '').slice(0, 70),
          format: s.format,
          resolution: s.resolution,
          duration: s.duration
        });
      });
    }
  }
}

async function test() {
  const d = new DebugMovieBox();
  await d.debugSearch('Inception', false);
  console.log('\n--- Now Game of Thrones ---');
  await d.debugSearch('Game of Thrones', true);
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
