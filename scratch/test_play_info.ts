import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestPlayInfo extends MovieBoxProvider {
  async testPlay(subjectId: string, se?: number, ep?: number) {
    const token = await (this as any).ensureSession();
    const host = (this as any).getActiveHost();
    const url = se && ep
      ? `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}&se=${se}&ep=${ep}`
      : `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}`;
    const headers = (this as any).buildHeaders('GET', url, '', token);
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log(`Play info for ${subjectId} (se=${se}, ep=${ep}):`);
    const payload = data?.data || data;
    const streams = payload?.streams || payload?.list || [];
    console.log('Streams count:', streams.length);
    streams.forEach((s: any, i: number) => {
      console.log(`Stream ${i}:`, {
        url: (s.url || s.playUrl || '').slice(0, 100),
        format: s.format,
        resolution: s.resolution,
        duration: s.duration,
        signCookie: !!s.signCookie
      });
    });
  }
}

async function test() {
  const t = new TestPlayInfo();
  console.log('Testing Inception original (6391474290696802080):');
  await t.testPlay('6391474290696802080');

  console.log('\nTesting Game of Thrones (2036860087691609120, se=1, ep=1):');
  await t.testPlay('2036860087691609120', 1, 1);
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
