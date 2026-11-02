# Operations and Troubleshooting

## Routine Checks

- Check the Render service state and recent logs after a deployment.
- `GET /api/health` confirms the Express process is serving requests; it does not confirm database readiness or provider availability.
- Check MongoDB connection errors and available storage in the database provider dashboard.
- Verify public portfolio reads and the authenticated admin editor after content changes.
- Use provider dashboards for Gemini quota, SMTP delivery, and GitHub/LeetCode availability.

## Common Incidents

### Website shows fallback or stale content

The frontend can render bundled/cached public content while the API loads. Verify the Vercel `BACKEND_URL`, Render availability, MongoDB connectivity, and `GET /api/portfolio`. The backend cache TTL is 60 seconds per process; a deployment or content save refreshes the current process cache, but not other instances.

### Admin can sign in but content does not load

The admin flow requires `POST /api/auth/login` followed by `GET /api/portfolio/admin`. Confirm the deployed frontend and backend versions are compatible and inspect `401`/`5xx` responses. The token expires after eight hours and is not persisted across page reloads.

### Draft appears in admin but not on the public site

This is expected when `published` is false. Public portfolio and blog endpoints omit drafts; the dashboard's authenticated endpoint includes them. Use the admin Blogs section to review and explicitly publish.

### Contact form accepted but no email arrived

The contact record is stored before email is attempted. Check SMTP variables, sender/recipient policy, provider delivery logs, and the `ContactMessage` record's `emailSent`/`mailError` fields. Email sending is asynchronous and there is no automatic queue or retry. There is currently no admin UI for browsing these records; use an authorized MongoDB operator workflow.

### Activity calendar is incomplete or unavailable

The API settles GitHub and LeetCode requests independently. Check the response's per-provider error/note, provider status, username variables, and GitHub token permissions. Without `GITHUB_TOKEN`, the service uses public GitHub events, which are not the full contribution calendar.

### Assistant unavailable

Check that `GEMINI_API_KEY` is set in Render and that the configured model is available to the project. A missing key returns `503`; provider throttling can return `429`; upstream failures and timeouts produce a temporary-unavailable response. Review the Gemini project quota and request logs without exposing the key.

## Database Backup and Restore

Use the MongoDB provider's managed backup/snapshot facility for production. Confirm snapshot retention and periodically test restoration into a separate, non-production database. Do not run a restore against production until the target database and recovery point have been reviewed; restore operations can overwrite newer content.

Contact records include personal information. Restrict backup access and use the same retention and deletion controls as the production database.

## Recovery Priorities

1. Restore public read availability and MongoDB connectivity.
2. Restore admin editing without overwriting content.
3. Check whether any contact submissions were stored during the incident and whether email delivery failed.
4. Check activity and assistant provider errors separately; those integrations are not required for the core portfolio to render.
5. Record the cause, recovery point, and any manual content reconciliation performed.

## Current Observability Gaps

There is no centralized metrics/tracing setup, no alerting contract in the repository, no readiness endpoint, and no durable email retry queue. Render logs and provider dashboards are the primary operational signals today.
