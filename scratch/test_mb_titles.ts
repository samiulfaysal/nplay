import { MovieBoxProvider } from '../src/lib/providers/moviebox';

async function testTitles() {
  const mb = new MovieBoxProvider();
  const testCases = [
    { title: 'Game of Thrones', type: 'tv' as const, season: 1, episode: 1, year: '2011' },
    { title: 'Breaking Bad', type: 'tv' as const, season: 1, episode: 1, year: '2008' },
    { title: 'Inception', type: 'movie' as const, year: '2010' },
    { title: 'Interstellar', type: 'movie' as const, year: '2014' },
    { title: 'Avatar: The Way of Water', type: 'movie' as const, year: '2022' },
    { title: 'Other Mommy', type: 'movie' as const, year: '2024' }
  ];

  for (const tc of testCases) {
    const t0 = Date.now();
    const res = await mb.resolve({
      tmdbId: '0',
      type: tc.type,
      title: tc.title,
      season: tc.season,
      episode: tc.episode,
      year: tc.year
    });
    console.log(`[${tc.title}] (${Date.now() - t0}ms):`, res ? `${res.sources.length} sources` : 'null');
    if (res?.sources) {
      res.sources.forEach(s => console.log('   ->', s.quality, s.type, s.url.slice(0, 80)));
    }
  }
}

testTitles().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
