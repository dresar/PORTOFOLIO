// src-functions/media/[[path]].ts
async function onRequest(context) {
  const { request, params, env } = context;
  const rawSegments = params.path;
  let subpath = Array.isArray(rawSegments) ? rawSegments.join("/") : rawSegments || "";
  if (!subpath) {
    return new Response("Not Found", { status: 404 });
  }
  if (subpath.startsWith("public/")) {
    subpath = subpath.slice(7);
  }
  if (env?.ASSETS) {
    try {
      const acceptHeader = request.headers.get("accept") || "";
      if (acceptHeader.includes("image/webp") && /\.(png|jpe?g)$/i.test(subpath)) {
        const webpSubpath = subpath.replace(/\.(png|jpe?g)$/i, ".webp");
        const webpUrl = new URL(`/${webpSubpath}`, request.url);
        const webpRes = await env.ASSETS.fetch(webpUrl.toString());
        const webpType = webpRes.headers.get("content-type") || "";
        if (webpRes.status === 200 && webpType.includes("image/webp")) {
          const resHeaders = new Headers(webpRes.headers);
          resHeaders.set("Content-Type", "image/webp");
          resHeaders.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
          resHeaders.set("Access-Control-Allow-Origin", "*");
          resHeaders.set("Vary", "Accept");
          return new Response(webpRes.body, {
            status: 200,
            headers: resHeaders
          });
        }
      }
      const assetUrl = new URL(`/${subpath}`, request.url);
      const assetRes = await env.ASSETS.fetch(assetUrl.toString());
      const assetType = assetRes.headers.get("content-type") || "";
      if (assetRes.status === 200 && !assetType.includes("text/html")) {
        const resHeaders = new Headers(assetRes.headers);
        resHeaders.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
        resHeaders.set("Access-Control-Allow-Origin", "*");
        return new Response(assetRes.body, {
          status: 200,
          headers: resHeaders
        });
      }
    } catch (e) {
    }
  }
  const cache = typeof caches !== "undefined" && caches?.default ? caches.default : null;
  const urlObj = new URL(request.url);
  const isPurge = urlObj.searchParams.has("purge") || request.headers.get("cache-control")?.includes("no-cache");
  if (cache && isPurge) {
    try {
      await cache.delete(request);
    } catch (e) {
    }
  }
  if (cache && request.method === "GET" && !isPurge) {
    try {
      const cached = await cache.match(request);
      if (cached) {
        const cachedHeaders = new Headers(cached.headers);
        cachedHeaders.set("CF-Edge-Cache", "HIT");
        return new Response(cached.body, { status: cached.status, headers: cachedHeaders });
      }
    } catch (e) {
    }
  }
  const upstreamUrl = `https://cdn.jsdelivr.net/gh/ekasyarifmaulana10-crypto/PORTOFOLIO-assets@main/public/${subpath}`;
  const fallbackUrl = `https://raw.githubusercontent.com/ekasyarifmaulana10-crypto/PORTOFOLIO-assets/main/public/${subpath}`;
  let upstreamRes = await fetch(upstreamUrl, {
    headers: { "User-Agent": "Portfolio-Media-Proxy" }
  });
  if (!upstreamRes.ok) {
    upstreamRes = await fetch(fallbackUrl, {
      headers: { "User-Agent": "Portfolio-Media-Proxy" }
    });
  }
  if (!upstreamRes.ok) {
    return new Response("Media Not Found", { status: upstreamRes.status });
  }
  const ext = subpath.split(".").pop()?.toLowerCase() || "";
  const mimeMap = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
    json: "application/json",
    txt: "text/plain"
  };
  const contentType = mimeMap[ext] || upstreamRes.headers.get("content-type") || "application/octet-stream";
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", contentType);
  responseHeaders.set("Cache-Control", "public, max-age=31536000, s-maxage=31536000, immutable");
  responseHeaders.set("Access-Control-Allow-Origin", "*");
  const contentLength = upstreamRes.headers.get("content-length");
  if (contentLength) {
    responseHeaders.set("Content-Length", contentLength);
  }
  const response = new Response(upstreamRes.body, {
    status: 200,
    headers: responseHeaders
  });
  if (cache && request.method === "GET" && upstreamRes.status === 200) {
    try {
      context.waitUntil(cache.put(request, response.clone()));
    } catch (e) {
    }
  }
  return response;
}
export {
  onRequest
};
