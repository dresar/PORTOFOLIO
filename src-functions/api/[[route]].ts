import vercelHandler from '../../vercel-api-archive/index.ts';

export async function onRequest(context: any) {
  const { request, env } = context;
  (globalThis as any).__CF_ENV__ = env;
  try {
    if (typeof process === 'undefined') {
      (globalThis as any).process = { env: { ...env } };
    } else {
      if (!process.env) {
        (process as any).env = {};
      }
      for (const [k, v] of Object.entries(env || {})) {
        try {
          process.env[k] = v as string;
        } catch (e) {}
      }
    }
  } catch (e) {}

  const url = new URL(request.url);
  
  const isGet = request.method === 'GET';
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const hasAuth = Boolean(request.headers.get('authorization'));
  const cache = (typeof caches !== 'undefined' && (caches as any)?.default) ? (caches as any).default : null;

  // 1. Instant Edge Cache lookup for public GET requests
  if (cache && isGet && !hasAuth) {
    try {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        const cachedHeaders = new Headers(cachedResponse.headers);
        cachedHeaders.set('CF-Edge-Cache', 'HIT');
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          headers: cachedHeaders
        });
      }
    } catch (e) {}
  }
  
  // Read body text first
  let bodyData = '';
  if (isMutation) {
    try {
      bodyData = await request.text();
    } catch (e) {
      bodyData = '';
    }
  }
  
  // Parse body text if JSON
  let parsedBody: any = null;
  if (bodyData) {
    try {
      parsedBody = JSON.parse(bodyData);
    } catch (e) {
      parsedBody = null;
    }
  }
  
  // Create mock req
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(request.headers.entries()),
    socket: { remoteAddress: request.headers.get('cf-connecting-ip') || '127.0.0.1' },
    query: Object.fromEntries(url.searchParams.entries()),
    body: parsedBody || bodyData,
    on: (event: string, callback: any) => {
      if (event === 'data' && bodyData) {
        callback(bodyData);
      }
      if (event === 'end') {
        callback();
      }
    }
  };

  return new Promise((resolve) => {
    let statusCode = 200;
    const headers = new Headers();
    let body: any = null;
    let headersSent = false;

    // Create mock res
    const res = {
      get statusCode() { return statusCode; },
      set statusCode(code) { statusCode = code; },
      setHeader: (name: string, value: string) => { headers.set(name, value); },
      getHeader: (name: string) => headers.get(name),
      removeHeader: (name: string) => headers.delete(name),
      get headersSent() { return headersSent; },
      end: (data: any) => {
        headersSent = true;
        body = data;
        const response = new Response(body, { status: statusCode, headers });

        // If this was a successful mutation, purge cache for this resource endpoint
        if (cache && isMutation && (statusCode >= 200 && statusCode < 300)) {
          try {
            const getReq = new Request(url.origin + url.pathname, { method: 'GET' });
            context.waitUntil(cache.delete(getReq));
          } catch (e) {}
        }

        // Cache successful public GET responses at Cloudflare Edge
        if (cache && isGet && !hasAuth && statusCode === 200) {
          try {
            const cacheControl = headers.get('Cache-Control');
            if (cacheControl && cacheControl.includes('public')) {
              context.waitUntil(cache.put(request, response.clone()));
            }
          } catch (e) {}
        }

        resolve(response);
      },
      write: () => {}
    };

    try {
      vercelHandler(req, res).catch((err: any) => {
        console.error("Vercel Handler Error:", err);
        resolve(new Response(JSON.stringify({ error: err.message }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }));
      });
    } catch (err: any) {
      console.error("Vercel Handler Sync Error:", err);
      resolve(new Response(JSON.stringify({ error: err.message }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }));
    }
  });
}
