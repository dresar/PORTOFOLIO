export async function onRequest(context: any) {
  const { request, params } = context;
  const rawSegments = params.path;
  let subpath = Array.isArray(rawSegments) ? rawSegments.join('/') : (rawSegments || '');
  if (!subpath) {
    return new Response('Not Found', { status: 404 });
  }

  if (subpath.startsWith('public/')) {
    subpath = subpath.slice(7);
  }

  const cache = (typeof caches !== 'undefined' && (caches as any)?.default) ? (caches as any).default : null;
  if (cache && request.method === 'GET') {
    try {
      const cached = await cache.match(request);
      if (cached) {
        const cachedHeaders = new Headers(cached.headers);
        cachedHeaders.set('CF-Edge-Cache', 'HIT');
        return new Response(cached.body, { status: cached.status, headers: cachedHeaders });
      }
    } catch (e) {}
  }

  const upstreamUrl = `https://cdn.jsdelivr.net/gh/dresar/PORTOFOLIO@main/public/${subpath}`;
  const fallbackUrl = `https://raw.githubusercontent.com/dresar/PORTOFOLIO/main/public/${subpath}`;

  let upstreamRes = await fetch(upstreamUrl, {
    headers: { 'User-Agent': 'Portfolio-Media-Proxy' }
  });

  if (!upstreamRes.ok) {
    upstreamRes = await fetch(fallbackUrl, {
      headers: { 'User-Agent': 'Portfolio-Media-Proxy' }
    });
  }

  if (!upstreamRes.ok) {
    return new Response('Media Not Found', { status: upstreamRes.status });
  }

  const ext = subpath.split('.').pop()?.toLowerCase() || '';
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    json: 'application/json',
    txt: 'text/plain'
  };
  const contentType = mimeMap[ext] || upstreamRes.headers.get('content-type') || 'application/octet-stream';

  const responseHeaders = new Headers();
  responseHeaders.set('Content-Type', contentType);
  responseHeaders.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  responseHeaders.set('Access-Control-Allow-Origin', '*');

  const contentLength = upstreamRes.headers.get('content-length');
  if (contentLength) {
    responseHeaders.set('Content-Length', contentLength);
  }

  const response = new Response(upstreamRes.body, {
    status: 200,
    headers: responseHeaders
  });

  if (cache && request.method === 'GET' && upstreamRes.status === 200) {
    try {
      context.waitUntil(cache.put(request, response.clone()));
    } catch (e) {}
  }

  return response;
}
