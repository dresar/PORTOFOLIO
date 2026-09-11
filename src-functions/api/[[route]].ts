import vercelHandler from '../../vercel-api-archive/index.ts';

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Read body text first
  let bodyData = '';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      bodyData = await request.text();
    } catch (e) {
      bodyData = '';
    }
  }
  
  // Create mock req
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(request.headers.entries()),
    socket: { remoteAddress: request.headers.get('cf-connecting-ip') || '127.0.0.1' },
    query: Object.fromEntries(url.searchParams.entries()),
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
        resolve(new Response(body, { status: statusCode, headers }));
      },
      write: () => {}
    };

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
