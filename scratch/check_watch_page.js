async function check() {
  const res = await fetch('http://localhost:3000/watch/tv/1399');
  const html = await res.text();
  console.log('Status:', res.status, 'HTML length:', html.length);
  const regex = /(MovieBox Core|Server 1 \(VidLink VIP\)|Server 2 \(VidSrc Clean\)|Server 3 \(MultiEmbed Direct\)|Stremio|4KHDHub|BDIX)/g;
  const matches = [...html.matchAll(regex)].map(m => m[0]);
  console.log('Matched servers in HTML (TV 1399):', matches);
}
check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
