import assert from "node:assert/strict";
import test from "node:test";
import { createRateLimiter } from "../dist/middleware/rateLimit.js";

test("rate limiter blocks requests after the configured window allowance", () => {
  const limit = createRateLimiter({ limit: 1, windowMs: 60_000, message: "Slow down" });
  const response = {
    code: 200,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  let nextCalls = 0;
  const request = { ip: "203.0.113.5" };

  limit(request, response, () => { nextCalls += 1; });
  limit(request, response, () => { nextCalls += 1; });

  assert.equal(nextCalls, 1);
  assert.equal(response.code, 429);
  assert.equal(response.body.message, "Slow down");
  assert.ok(Number(response.headers["Retry-After"]) > 0);
});
