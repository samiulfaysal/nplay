import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestParams extends MovieBoxProvider {
  async testPlayParams(subjectId: string) {
    const token = await (this as any).ensureSession();
    const host = (this as any).getActiveHost();
    const urls = [
      `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}`,
      `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}&vip=1`,
      `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}&quality=1080p`,
      `${host}/wefeed-mobile-bff/subject-api/detail?subjectId=${subjectId}`,
    ];

    for (const url of urls) {
      const headers = (this as any).buildHeaders('GET', url, '', token);
      const res = await fetch(url, { headers });
      const data = await res.json();
      console.log(`URL: ${url}`);
      console.log('Status:', res.status, 'Code:', data.code, 'Msg:', data.message);
      if (data.data?.streams) {
        console.log('Streams:', data.data.streams.map((s: any) => ({ url: s.url?.slice(0, 60), duration: s.duration, format: s.format })));
      }
      if (data.data?.downloads) {
        console.log('Downloads:', data.data.downloads);
      }
    }
  }
}

async function test() {
  const t = new TestParams();
  await t.testPlayParams('6391474290696802080'); // Inception
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
