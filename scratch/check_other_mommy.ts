import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestMB extends MovieBoxProvider {
  async run() {
    const token = await (this as any).ensureSession();
    console.log('token:', !!token);
    const item = await (this as any).searchTitle('Other Mommy', false, token);
    console.log('search item:', item);
    if (item) {
      const subjectId = item.subjectId || item.id;
      const host = (this as any).getActiveHost();
      const url = `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${subjectId}`;
      const headers = (this as any).buildHeaders('GET', url, '', token);
      const res = await fetch(url, { headers });
      const data = await res.json();
      console.log('play-info:', JSON.stringify(data, null, 2));
    }
  }
}

new TestMB().run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
