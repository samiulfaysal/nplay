import { MovieBoxProvider } from '../src/lib/providers/moviebox';

class TestSearch extends MovieBoxProvider {
  async inspectSearch(q: string) {
    const token = await (this as any).ensureSession();
    const host = (this as any).getActiveHost();
    const fullUrl = `${host}/wefeed-mobile-bff/subject-api/search/v2`;
    const body = JSON.stringify({
      keyword: q,
      page: 1,
      perPage: 15,
      subjectType: 0,
    });
    const headers = (this as any).buildHeaders('POST', fullUrl, body, token);
    const res = await fetch(fullUrl, { method: 'POST', headers, body });
    const data = await res.json();
    console.log(`\nSearch results for "${q}":`);
    const results = data?.data?.results || [];
    for (const section of results) {
      console.log('Section title:', section.title);
      for (const s of (section.subjects || [])) {
        console.log(` - ID: ${s.subjectId}, Type: ${s.subjectType}, Title: "${s.title}", Year: ${s.releaseDate}, VIP:`, s.vipInfo);
      }
    }
  }
}

async function test() {
  const ts = new TestSearch();
  await ts.inspectSearch('Inception');
  await ts.inspectSearch('Game of Thrones');
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
