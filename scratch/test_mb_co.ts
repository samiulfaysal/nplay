async function testMovieBoxCo() {
  const url = 'https://movie-box.co/detail/other-mommy-hindi-YQHOb43bpt2';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('HTML length:', html.length);
    const iframes = [...html.matchAll(/<iframe[^>]+src="([^"]+)"/gi)].map(m => m[1]);
    console.log('Iframes:', iframes);
    const videoMatches = [...html.matchAll(/https?:\/\/[^"'\s]+\.(?:m3u8|mp4|mpd)/gi)].map(m => m[0]);
    console.log('Video matches in html:', videoMatches);
  } catch (e: any) {
    console.log('Error:', e.message);
  }
}

testMovieBoxCo().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
