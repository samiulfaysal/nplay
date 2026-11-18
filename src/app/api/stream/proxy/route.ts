import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const referer = searchParams.get('ref') || 'https://sportslive.wine';
  const cookie = searchParams.get('cookie') || '';
  const incomingRange = request.headers.get('range');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
  }

  try {
    const upstreamHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: referer,
    };

    if (cookie) {
      upstreamHeaders['Cookie'] = cookie;
    }

    if (incomingRange) {
      upstreamHeaders['Range'] = incomingRange;
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: upstreamHeaders,
      signal: AbortSignal.timeout(8000),
    });

    const isSuccess = upstreamRes.status === 200 || upstreamRes.status === 206;
    const rawContentType = upstreamRes.headers.get('content-type') || '';
    const isM3u8 = targetUrl.includes('.m3u8');
    const isMpd = targetUrl.includes('.mpd');
    const isHtmlOrJson = rawContentType.includes('text/html') || rawContentType.includes('application/json');

    // If upstream failed or returned an error page/json instead of media
    if (!isSuccess || (isHtmlOrJson && !isM3u8 && !isMpd)) {
      return NextResponse.json(
        { error: 'Upstream stream unavailable or returned non-media response' },
        { status: 404 }
      );
    }

    if (isMpd) {
      const text = await upstreamRes.text();
      const lastSlashIdx = targetUrl.lastIndexOf('/');
      const baseDir = lastSlashIdx !== -1 ? targetUrl.substring(0, lastSlashIdx + 1) : targetUrl;
      const proxyPrefix = `/api/stream/proxy?ref=${encodeURIComponent(referer)}${cookie ? '&cookie=' + encodeURIComponent(cookie) : ''}&url=`;

      const formatProxyTemplate = (filePath: string) => {
        const full = filePath.startsWith('http') ? filePath : `${baseDir}${filePath}`;
        const encoded = encodeURIComponent(full)
          .replace(/%24RepresentationID%24/gi, () => '$RepresentationID$')
          .replace(/%24Number%24/gi, () => '$Number$')
          .replace(/%24Number%2505d%24/gi, () => '$Number%05d$')
          .replace(/%24Time%24/gi, () => '$Time$')
          .replace(/%24Bandwidth%24/gi, () => '$Bandwidth$');
        return `${proxyPrefix}${encoded}`;
      };

      // Rewrite initialization and media in SegmentTemplate preserving DASH identifiers
      const rewritten = text
        .replace(/initialization="([^"]+)"/g, (_match, initPath) => {
          return `initialization="${formatProxyTemplate(initPath)}"`;
        })
        .replace(/media="([^"]+)"/g, (_match, mediaPath) => {
          return `media="${formatProxyTemplate(mediaPath)}"`;
        });

      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'application/dash+xml',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Cache-Control': 'no-cache',
        },
      });
    }

    let contentType = rawContentType;
    if (isM3u8) {
      contentType = 'application/vnd.apple.mpegurl';
    } else if (!contentType || isHtmlOrJson) {
      contentType = targetUrl.includes('.mp4') ? 'video/mp4' : 'application/octet-stream';
    }

    const body = await upstreamRes.arrayBuffer();

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      'Accept-Ranges': 'bytes',
      'Cache-Control': isM3u8 ? 'no-cache' : 'public, max-age=3600',
    };

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    return new NextResponse(body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Proxy fetch failed', details: err?.message }, { status: 404 });
  }
}
