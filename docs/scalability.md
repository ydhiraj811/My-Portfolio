# Scalability Assessment

## Verdict

The current design is suitable for a personal portfolio, a small content catalog, and low-to-moderate public traffic. It has sensible component boundaries and keeps the delivery path relatively simple. There is no load-test data or defined traffic target, so a responsible requests-per-second or user-count limit cannot be stated from source inspection alone.

It should not be described as horizontally scalable without caveats. Several controls and caches are process-local, and some endpoints perform provider work on every request.

## What Scales Well Today

- Vercel serves the compiled frontend as static assets and can distribute those assets independently of API compute.
- Render can run the API separately from the browser bundle; MongoDB and provider credentials remain backend concerns.
- Public portfolio reads have a 60-second in-process cache and the browser has a public-content cache.
- Login, contact, and assistant requests have input validation; portfolio write payloads currently rely mostly on Mongoose behavior. Assistant failures are bounded, and activity-provider failures settle independently without exposing credentials to the browser.
- Activity calls run concurrently and settle independently.

## Current Bottlenecks and Failure Modes

| Area | Current behavior | Scaling or reliability impact |
| --- | --- | --- |
| Portfolio cache | One 60-second cache per Node process | Multiple instances can serve different versions; cache invalidation is not coordinated |
| Rate limiting | In-memory limits for login, contact, and chat per process | Limits reset on restart and are not shared; verify the client IP seen by Render and move to shared storage before adding instances |
| Activity API | GitHub and LeetCode requests run concurrently with ten-second timeouts and a five-minute per-process cache | Cache is not shared across instances; one request can still wait for provider timeouts on a cold cache |
| Portfolio data | Projects and blogs are embedded in one portfolio document | The document and write contention grow with content; updates are effectively last-write-wins |
| Contact email | SMTP is attempted in the API process without a durable queue | A process restart or provider outage can delay notification; retries are manual |
| API proxy | Buffers full upstream and downstream bodies | Not suitable for large responses or streaming endpoints |
| Health checks | `/api/health` returns `{ ok: true }` without checking MongoDB or providers | It is a liveness signal, not a readiness or dependency health signal |
| Validation and tests | No test script is configured; content write payloads rely largely on Mongoose behavior | Regressions and malformed content can reach production without a CI gate |

## Staged Growth Plan

### Stage 1: Production baseline

- Keep draft filtering at the API boundary and use authenticated, non-cacheable admin reads.
- Extend backend tests to cover route-level public/private boundaries, auth, contact persistence, and API error handling; current tests cover validation, async error forwarding, and rate limits.
- Verify trusted client-IP handling through Render and Vercel; move rate-limit state to shared storage before adding API instances.
- Add request IDs, structured logs, dependency timeouts, and a readiness check that verifies MongoDB connectivity.
- Set explicit response cache headers for public reads and `no-store` for admin data.
- Define a contact-message retention and email retry procedure.

### Stage 2: Moderate traffic

- Move shared cache/rate-limit state to a managed Redis-compatible store or another shared platform primitive if multiple API instances are used.
- Cache GitHub and LeetCode results with separate provider TTLs and stale-on-error behavior.
- Add bounded timeouts and retries with jitter for idempotent external reads; do not blindly retry chat generation or email sends.
- Add database indexes for query patterns as they emerge and measure document size/read latency.
- Add optimistic concurrency or section-level update semantics to prevent two admin sessions overwriting one another.

### Stage 3: Larger content or operational load

- Split projects, blogs, and contact messages into independently queried collections if pagination, search, publishing workflows, or write volume justify it.
- Move email delivery to a durable queue with retries and dead-letter visibility.
- Add centralized metrics, traces, alerting, and a tested backup/restore process.
- Reassess the Vercel proxy for payload streaming, upload support, and regional latency requirements.
- Define an SLO and run representative load tests before scaling instance counts or adopting more complex architecture.

## Scaling Checklist

- Establish expected peak requests per second and acceptable p95/p99 latency.
- Measure cold start, API response time, MongoDB connection pool use, and external-provider latency.
- Test two or more API instances to expose process-local state assumptions.
- Test cache invalidation after content edits.
- Test provider timeouts, rate-limit responses, MongoDB unavailability, and SMTP failure.
- Verify deployed Vercel proxy headers and the client IP observed by Render.
