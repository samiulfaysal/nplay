import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestCookie extends MovieBoxProvider {
  async inspectStream() {
    const token = await (this as any).ensureSession();
    const host = (this as any).getActiveHost();
    const url = `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=2036860087691609120&se=1&ep=1`;
    const headers = (this as any).buildHeaders('GET', url, '', token);
    const res = await fetch(url, { headers });
    const data = await res.json();
    const streams = data?.data?.streams || [];
    const stream = streams[0];
    console.log('Stream object:', {
      url: stream.url,
      signCookie: stream.signCookie,
      format: stream.format,
      cookie: stream.cookie,
      headers: stream.headers
    });

    if (stream.url && stream.signCookie) {
      console.log('\nFetching with signCookie...');
      const dashRes = await fetch(stream.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://sportslive.wine',
          'Cookie': stream.signCookie
        }
      });
      console.log('Dash status:', dashRes.status, 'Content-Type:', dashRes.headers.get('content-type'));
      const text = await dashRes.text();
      console.log('Dash manifest preview:\n', text.slice(0, 500));
    }
  }
}

const t = new TestCookie();
t.inspectStream().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
