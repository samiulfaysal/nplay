async function inspect() {
  const url = "https://www.movy.sx/movie/666750?play=true";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Length:", text.length);

    // Look for iframes
    const iframes = [...text.matchAll(/<iframe[^>]+src="([^"]+)"/gi)].map(m => m[1]);
    console.log("Iframes:", iframes);

    // Look for player or API calls
    const playerMatches = [...text.matchAll(/https?:\/\/[^"'\s<>]+(?:embed|player|stream|api|vidsrc|vidlink|autoembed|moviebox|source)[^"'\s<>]*/gi)].map(m => m[0]);
    console.log("Player matches (first 10):", playerMatches.slice(0, 10));

    // Look for m3u8 or mp4
    const media = [...text.matchAll(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4|mpd)/gi)].map(m => m[0]);
    console.log("Media files:", media);
  } catch (err: any) {
    console.log("Error:", err.message);
  }
}

inspect().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
