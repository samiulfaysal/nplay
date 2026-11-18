import { MovieBoxProvider } from '../src/lib/providers/moviebox';
import { FourKHdHubProvider } from '../src/lib/providers/4khdhub';
import { DramachiProvider } from '../src/lib/providers/dramachi';
import { BdixProvider } from '../src/lib/providers/bdix';
import { StremioProvider } from '../src/lib/providers/stremio';

async function main() {
  const query = {
    tmdbId: '1400837',
    imdbId: 'tt33342084',
    type: 'movie' as const,
    title: 'Other Mommy',
    year: '2024'
  };

  console.log('Testing MovieBox...');
  try {
    const mb = new MovieBoxProvider();
    const t0 = Date.now();
    const res = await mb.resolve(query);
    console.log(`MovieBox (${Date.now() - t0}ms):`, res ? `${res.sources.length} sources` : 'null');
    if (res?.sources) {
      res.sources.forEach(s => console.log('  MB source:', s.quality, s.url));
    }
  } catch (e: any) {
    console.log('MovieBox error:', e.message);
  }

  console.log('Testing 4KHDHub...');
  try {
    const f = new FourKHdHubProvider();
    const t0 = Date.now();
    const res = await f.resolve(query);
    console.log(`4KHDHub (${Date.now() - t0}ms):`, res ? `${res.sources.length} sources` : 'null');
  } catch (e: any) {
    console.log('4KHDHub error:', e.message);
  }

  console.log('Testing Dramachi...');
  try {
    const d = new DramachiProvider();
    const t0 = Date.now();
    const res = await d.resolve(query);
    console.log(`Dramachi (${Date.now() - t0}ms):`, res ? `${res.sources.length} sources` : 'null');
  } catch (e: any) {
    console.log('Dramachi error:', e.message);
  }

  console.log('Testing BDIX...');
  try {
    const b = new BdixProvider();
    const t0 = Date.now();
    const res = await b.resolve(query);
    console.log(`BDIX (${Date.now() - t0}ms):`, res ? `${res.sources.length} sources` : 'null');
  } catch (e: any) {
    console.log('BDIX error:', e.message);
  }

  console.log('Testing Stremio...');
  try {
    const s = new StremioProvider();
    const t0 = Date.now();
    const res = await s.resolve(query);
    console.log(`Stremio (${Date.now() - t0}ms):`, res ? `${res.sources.length} sources` : 'null');
  } catch (e: any) {
    console.log('Stremio error:', e.message);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
