import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestMovies extends MovieBoxProvider {
  async testTitle(title: string) {
    const token = await (this as any).ensureSession();
    const item = await (this as any).searchTitle(title, false, token);
    if (!item) {
      console.log(`[${title}] not found in search`);
      return;
    }
    const host = (this as any).getActiveHost();
    const url = `${host}/wefeed-mobile-bff/subject-api/play-info/v2?subjectId=${item.subjectId || item.id}`;
    const headers = (this as any).buildHeaders('GET', url, '', token);
    const res = await fetch(url, { headers });
    const data = await res.json();
    const streams = data?.data?.streams || data?.streams || [];
    console.log(`[${title}] -> matched: "${item.title}" (${item.releaseDate})`);
    console.log(`   Streams: ${streams.length}`);
    streams.forEach((s: any) => {
      console.log(`   - url: ${s.url?.slice(0, 70)}, format: ${s.format}, duration: ${s.duration}`);
    });
  }
}

async function run() {
  const t = new TestMovies();
  for (const m of ['Deadpool', 'Dune', 'Oppenheimer', 'Moana', 'Top Gun']) {
    await t.testTitle(m);
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
