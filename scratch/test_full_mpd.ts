import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestDashManifest extends MovieBoxProvider {
  async inspectManifest() {
    const token = await (this as any).ensureSession();
    const host = (this as any).getActiveHost();
    const url = `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=2036860087691609120&se=1&ep=1`;
    const headers = (this as any).buildHeaders('GET', url, '', token);
    const res = await fetch(url, { headers });
    const data = await res.json();
    const stream = data?.data?.streams?.[0];

    const dashRes = await fetch(stream.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sportslive.wine',
        'Cookie': stream.signCookie
      }
    });
    const text = await dashRes.text();
    console.log('FULL MPD MANIFEST:\n', text);
  }
}

const t = new TestDashManifest();
t.inspectManifest().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
