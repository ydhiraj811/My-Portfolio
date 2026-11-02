# Security and Privacy

## Existing Controls

- Admin passwords are bcrypt-hashed; protected APIs require an eight-hour JWT.
- The browser keeps the JWT in component state rather than persistent browser storage; reloading the page requires signing in again.
- Environment variables are validated at backend startup. Gemini and SMTP credentials belong only in the backend environment.
- CORS is restricted to the configured `CLIENT_URL`; JSON request bodies are limited to 1 MB.
- Chat input is bounded and rate-limited. Portfolio context is restricted to selected fields, and the assistant request has a timeout and output cap.
- Portfolio edits validate profile links, project/blog fields, URL schemes, slug shape, and duplicate slugs. New blog API writes default to unpublished unless explicitly marked published.
- Contact fields are validated, a honeypot is present, and values are escaped before being inserted into HTML email.
- Public portfolio responses omit unpublished blogs. Draft reads and all content writes require admin authentication; protected responses are marked `no-store`.
- Startup logging no longer prints the configured admin password.

## Important Limitations

- Login, contact, and chat endpoints have in-memory per-client limits (10 sign-ins per 15 minutes, 20 messages per 10 minutes, and 30 assistant requests per minute). Limits reset on restart and are not shared across instances; use a shared rate-limit store before horizontally scaling.
- The API does not configure a security-header middleware. Review CSP, HSTS, frame protections, and content-type protections before treating the deployment as hardened.
- The Vercel proxy forwards Vercel's platform-generated client IP header and Express trusts one upstream proxy. Verify the observed `req.ip` in the deployed Render logs before treating limits as a strict per-visitor control, especially if the proxy chain changes.
- JWTs are not revocable server-side before expiry, and there is no refresh-token or password-change workflow.
- Admin bootstrap credentials are only used when creating the first matching Admin record. Changing `ADMIN_PASSWORD` later does not update its stored hash.
- Contact submissions contain visitor names, email addresses, and message text. Define access, retention, export, and deletion procedures; there is no admin inbox or automated retention job.
- Chat turns and selected portfolio context are sent to Gemini for response generation. Do not send secrets or private visitor data through the assistant. Review the provider's current data terms and disclose the service appropriately.
- If the initial admin was seeded while an older version of the bootstrap code was deployed, inspect Render log access/retention and rotate that credential through a controlled database/admin procedure.

## Operational Rules

1. Never commit `.env`, provider keys, database URIs, JWT secrets, SMTP passwords, or admin passwords.
2. Set a unique random `JWT_SECRET` of at least 32 characters for production.
3. Use a strong unique admin password and restrict access to Render, Vercel, and MongoDB accounts with MFA where available.
4. Keep MongoDB network access limited to the backend deployment and approved operator addresses.
5. Review MongoDB backups and contact-message retention because contact records contain personal data.
6. Keep the public and admin portfolio routes separate; do not reintroduce draft data into public caches or browser storage.
