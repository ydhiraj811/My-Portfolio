# Data Model

MongoDB is accessed through Mongoose. Collection names follow Mongoose's pluralization of the model names unless explicitly configured by the deployment.

## Portfolio

The application expects one portfolio document. Most related content is embedded to keep the public read and admin editor simple.

| Field | Shape | Notes |
| --- | --- | --- |
| `profile` | Object | Name, role, location, contact links, headline, summary, about text, and resume URL |
| `stats` | Array of `{ value, label }` | Short portfolio metrics |
| `stack` | String array | Technology list |
| `skills` | Array of `{ title, items[] }` | Grouped competencies |
| `experience` | Array of role/company/period/location/bullets | Work history |
| `projects` | Embedded documents | Title, slug, year, summary/body, image, stack, highlights, links, SEO fields |
| `blogs` | Embedded documents | Title, date/category, slug, excerpt/body, cover image, SEO fields, `published` |
| `education` | Embedded documents | Qualification, institution, period, detail |
| timestamps | `createdAt`, `updatedAt` | Managed by Mongoose |

`published` defaults to `true` in the schema for backwards compatibility. Drafts must explicitly store `published: false`. The public portfolio projection and blog endpoints filter drafts; the authenticated admin portfolio endpoint returns them.

The default content in `backend/src/utils/defaultContent.ts` is inserted only when no portfolio document exists. Editing that file does not update an already-seeded database.

## Admin

One or more administrator records contain a normalized, unique email and `passwordHash`. Passwords are hashed with bcrypt before insertion. The configured `ADMIN_EMAIL` and `ADMIN_PASSWORD` bootstrap a record only when that email does not already exist; changing those environment values does not currently rotate an existing database password.

## ContactMessage

Each accepted contact submission is stored separately with name, normalized email, subject, message, `emailSent`, `mailError`, and timestamps. These fields contain personal information. There is no application endpoint for listing or deleting these records yet.

## Consistency and Concurrency

Content arrays are embedded in the portfolio document and written as whole arrays. The editor is intended for one owner, but simultaneous admin sessions can overwrite each other's changes. There is no content revision workflow, publication audit trail, or optimistic concurrency contract in the API.

Contact messages are independent records, so they do not grow the portfolio document. The current models do not define explicit retention or archival policies.
