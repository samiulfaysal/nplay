async function testDashFetch() {
  const url = 'https://sbcdn3.hakunaymatata.com/dash/2036860087691609120_1_1_1080_h265_169/index_web.mpd';
  console.log('Testing fetch to DASH url without cookie:');
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://sportslive.wine'
      }
    });
    console.log('Status:', res.status, 'Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Body length:', text.length, 'Preview:', text.slice(0, 300));
  } catch (e: any) {
    console.log('Fetch error:', e.message);
  }
}

testDashFetch().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
