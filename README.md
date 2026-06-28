# Dhiraj Kumar Yadav Portfolio

MERN + TypeScript portfolio with MongoDB-backed dynamic content, JWT-protected admin dashboard, and live GitHub/LeetCode consistency calendars.

## Structure

- `backend/` - Express, TypeScript, MongoDB, JWT, API routes
- `frontend/` - React, TypeScript, Vite admin and public portfolio

## Setup

```bash
npm install
cp .env.example backend/.env
npm run dev
```

MongoDB must be running locally or `MONGODB_URI` must point to a MongoDB Atlas database.

## Admin

Default credentials come from `backend/.env`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Change them before deploying.

## Live Calendars

- LeetCode uses the public GraphQL endpoint for `https://leetcode.com/u/ydhiraj811/`.
- GitHub uses the official GraphQL contribution calendar when `GITHUB_TOKEN` is set. Create a fine-scoped token with public profile/repo read access and add it to `backend/.env`.
- If `GITHUB_TOKEN` is empty, the API falls back to public GitHub events, which is genuine public activity but not the full contribution calendar.

## Admin Features

- JWT login with logout and expired-session handling.
- Field-based editors for profile, stats, stack, skills, experience, projects, education, and blogs.
- Preview mode before saving.
- Project image URL and blog cover image URL fields.
- SEO title and SEO description fields for project and blog detail pages.
- Focused project/blog APIs in addition to the full portfolio update API.

## Content APIs

- `GET /api/portfolio`
- `PUT /api/portfolio`
- `GET /api/portfolio/projects`
- `GET /api/portfolio/projects/:slug`
- `POST /api/portfolio/projects`
- `PUT /api/portfolio/projects`
- `PUT /api/portfolio/projects/:slug`
- `DELETE /api/portfolio/projects/:slug`
- `GET /api/portfolio/blogs`
- `GET /api/portfolio/blogs/:slug`
- `POST /api/portfolio/blogs`
- `PUT /api/portfolio/blogs`
- `PUT /api/portfolio/blogs/:slug`
- `DELETE /api/portfolio/blogs/:slug`
