# Deployment and Configuration

## Local Development

1. Install the locked workspace dependencies with `npm ci`.
2. Copy `.env.example` to `backend/.env` and replace the required placeholders.
3. Start MongoDB locally or use a development MongoDB database.
4. Run `npm run dev` from the repository root. The frontend is served at `http://127.0.0.1:5173`; the backend listens on port `5001` by default.

The backend seeds a portfolio and initial admin only when those records do not already exist. Seed files are not a migration mechanism for an existing database.

## Render Backend

Recommended workspace configuration:

- Root directory: repository root
- Build command: `npm ci && npm run build -w backend`
- Start command: `npm run start -w backend`
- Health-check path: `/api/health` (liveness only; it does not verify MongoDB)
- Express trusts one proxy hop for client-IP rate limiting. Keep the Render/Vercel proxy chain aligned with that setting and verify `req.ip` in deployed logs.

Set these variables in the Render service environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Recommended | Set to `production` |
| `PORT` | Usually platform-provided | Express listen port; defaults to `5001` |
| `MONGODB_URI` | Yes | Production MongoDB connection string |
| `JWT_SECRET` | Yes | Random signing secret, at least 32 characters |
| `ADMIN_EMAIL` | Yes | Initial admin email when no matching admin exists |
| `ADMIN_PASSWORD` | Yes | Initial admin password when no matching admin exists |
| `CLIENT_URL` | Yes for browser-origin calls | Exact public frontend origin for CORS |
| `GITHUB_USERNAME` | Optional | Activity account; defaults to `ydhiraj811` |
| `GITHUB_TOKEN` | Optional | Enables the full GitHub contribution calendar |
| `LEETCODE_USERNAME` | Optional | Activity account; defaults to `ydhiraj811` |
| `GEMINI_API_KEY` | Optional | Enables the portfolio assistant |
| `GEMINI_MODEL` | Optional | Gemini model; defaults to `gemini-3.5-flash-lite` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Optional | SMTP delivery for contact submissions |
| `CONTACT_TO_EMAIL` | Optional | Recipient; falls back to `ADMIN_EMAIL` |
| `CONTACT_FROM_EMAIL` | Optional | Sender; falls back to `ADMIN_EMAIL` |

Only set `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` to valid email addresses; omit them rather than setting empty values. `SMTP_SECURE` accepts the strings `true` or `false`.

## Vercel Frontend

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Enable inclusion of source files outside the root directory because the frontend imports the backend's default content and shared types.
- Set `BACKEND_URL` to the Render origin only, for example `https://portfolio-api.onrender.com`; do not append `/api`.
- Leave `VITE_API_URL` unset when using the Vercel proxy. The frontend calls `/api/*`, and `frontend/api/[...path].js` forwards those requests.

For direct browser-to-Render calls instead, set `VITE_API_URL` to the full API prefix (for example `https://portfolio-api.onrender.com/api`) and set Render's `CLIENT_URL` to the exact Vercel/custom-domain origin.

## Release Procedure

1. Run backend regression tests with `npm test` and build both workspaces with `npm run build`.
2. Review `git diff --check` and confirm no secrets or local environment files are staged.
3. Push the intended commit to the deployment branch.
4. Confirm Render builds and starts the API, then check `/api/health` and a public portfolio request.
5. Confirm Vercel has the correct `BACKEND_URL` and that `/api/portfolio` works from the deployed origin.
6. Verify admin login, a draft remains absent from public endpoints, contact storage, and activity behavior.

## Rollback

Rollback frontend and backend deployments to the last known-good commit independently if necessary. Avoid rolling back MongoDB data automatically; take a backup before any manual restore or content correction.
