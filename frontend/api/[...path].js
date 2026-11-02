export default async function handler(request, response) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    response.statusCode = 503;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ message: "The portfolio API is not configured." }));
    return;
  }

  try {
    const target = new URL(request.url || "/api", backendUrl);
    if (!target.pathname.startsWith("/api/")) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    const headers = new Headers();
    for (const name of ["accept", "authorization", "content-type"]) {
      const value = request.headers[name];
      if (value) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }
    const clientIp = request.headers["x-vercel-forwarded-for"];
    if (typeof clientIp === "string") headers.set("x-forwarded-for", clientIp);

    let body;
    if (request.method !== "GET" && request.method !== "HEAD") {
      if (request.body !== undefined) {
        body = typeof request.body === "string" || request.body instanceof Uint8Array
          ? request.body
          : JSON.stringify(request.body);
      } else {
        const chunks = [];
        let size = 0;
        for await (const chunk of request) {
          const bytes = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
          chunks.push(bytes);
          size += bytes.length;
        }
        body = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.length;
        }
      }
    }

    const upstream = await fetch(target, {
      method: request.method || "GET",
      headers,
      body,
      signal: AbortSignal.timeout(35_000),
    });

    response.statusCode = upstream.status;
    for (const name of ["cache-control", "content-type", "retry-after", "www-authenticate"]) {
      const value = upstream.headers.get(name);
      if (value) response.setHeader(name, value);
    }
    response.end(new Uint8Array(await upstream.arrayBuffer()));
  } catch (error) {
    console.error("Portfolio API proxy failed", error);
    response.statusCode = 502;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ message: "The portfolio API is temporarily unavailable." }));
  }
}
