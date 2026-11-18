async function testStremioAddons() {
  const imdbId = 'tt0903747'; // Breaking Bad
  const endpoints = [
    `https://webstreamr.hayd.uk/stream/series/${imdbId}:1:1.json`,
    `https://torrentio.strem.fun/stream/series/${imdbId}:1:1.json`,
  ];

  for (const ep of endpoints) {
    try {
      console.log('Testing endpoint:', ep);
      const res = await fetch(ep, { signal: AbortSignal.timeout(5000) });
      console.log('Status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Streams count:', (data.streams || []).length);
        if (data.streams?.length > 0) {
          console.log('First stream:', data.streams[0]);
        }
      }
    } catch (e: any) {
      console.log('Error:', e.message);
    }
  }
}

testStremioAddons().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
