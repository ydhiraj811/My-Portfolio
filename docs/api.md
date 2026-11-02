# API Reference

All routes are prefixed with `/api`. Production browsers normally call the Vercel same-origin proxy; the proxy forwards requests to the Render API configured by `BACKEND_URL`.

## Authentication

Protected routes require `Authorization: Bearer <JWT>`. Login tokens expire after eight hours. Authenticated API responses set `Cache-Control: no-store`.

## Health and Authentication

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Liveness response `{ "ok": true }`; does not verify MongoDB or provider health |
| `POST` | `/auth/login` | Public | Validates `{ "email", "password" }`; returns `{ "token", "admin": { "email" } }` |

## Portfolio

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/portfolio` | Public | Public portfolio projection; excludes unpublished blogs; cached in process for 60 seconds |
| `GET` | `/portfolio/admin` | Admin | Full portfolio including drafts; non-cacheable |
| `PUT` | `/portfolio` | Admin | Replaces the portfolio document from the submitted payload |

## Projects

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/portfolio/projects` | Public | List projects |
| `GET` | `/portfolio/projects/:slug` | Public | Read one project |
| `POST` | `/portfolio/projects` | Admin | Append a project; slug is generated from title if omitted |
| `PUT` | `/portfolio/projects` | Admin | Replace the project list |
| `PUT` | `/portfolio/projects/:slug` | Admin | Update one project |
| `DELETE` | `/portfolio/projects/:slug` | Admin | Remove one project |

## Blogs

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/portfolio/blogs` | Public | List published blogs only |
| `GET` | `/portfolio/blogs/:slug` | Public | Read one published blog; drafts return `404` |
| `POST` | `/portfolio/blogs` | Admin | Append a blog; slug is generated from title if omitted |
| `PUT` | `/portfolio/blogs` | Admin | Replace the blog list, including drafts |
| `PUT` | `/portfolio/blogs/:slug` | Admin | Update one blog |
| `DELETE` | `/portfolio/blogs/:slug` | Admin | Remove one blog |

## Integrations and Contact

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/activity` | Public | GitHub and LeetCode activity summaries |
| `GET` | `/contact/messages` | Admin | Lists the latest 100 contact messages and delivery statuses; responses are not cached |
| `POST` | `/contact` | Public | Validates and stores a contact submission, then attempts configured SMTP delivery |
| `POST` | `/chat` | Public | Generates a portfolio answer using Gemini; accepts 1-10 messages, each up to 1,000 characters |

## Contact Request

```json
{
  "name": "Visitor name",
  "email": "visitor@example.com",
  "subject": "Project inquiry",
  "message": "A message with at least ten characters.",
  "website": ""
}
```

The `website` field is a honeypot. A successful response includes `emailSent`; submissions remain stored even if email delivery is not configured or fails. Messages are visible only through the authenticated admin inbox and the API does not expose them publicly.

## Error Behavior

Validation errors use `400`; duplicate content slugs use `409`; missing or invalid admin tokens use `401`; rate limits use `429`; missing assistant configuration uses `503`; unavailable upstream services use bounded `502`/`503` responses. Unhandled async controller failures return a generic `500` response.
