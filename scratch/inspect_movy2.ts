import fs from 'fs';

async function test() {
  const url = "https://www.movy.sx/movie/666750?play=true";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
  });
  const text = await res.text();
  fs.writeFileSync('scratch/movy.html', text);
  console.log('Saved scratch/movy.html, length:', text.length);

  // Search for script tags or server options
  const lines = text.split('\n');
  const serverLines = lines.filter(l => l.toLowerCase().includes('server') || l.toLowerCase().includes('player') || l.toLowerCase().includes('embed') || l.toLowerCase().includes('provider'));
  console.log('Server lines found:', serverLines.length);
  serverLines.slice(0, 15).forEach(l => console.log('  ', l.trim().slice(0, 120)));
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
