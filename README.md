# StudyNook – Library Study Room Booking

StudyNook is a full-stack study room booking platform. Students browse and reserve library rooms, list their own spaces, and manage bookings with conflict-free scheduling.

**Live site:** _Deploy with [DEPLOY.md](../DEPLOY.md) — then paste your Vercel URL here_

**API repo:** _GitHub link to Server repository_

**Client repo:** _GitHub link to this repository_

> **Stack note:** The assignment brief mentions React/Vite SPA. This client is built with **Next.js 16 (App Router)** for file-based routing, SSR-friendly layouts, and production deployment on Vercel. The Express API remains a separate REST backend.

## Features

- Browse and search rooms by name, floor, amenities, and hourly rate
- Book time slots with live cost calculation and overlap prevention
- JWT auth: Better Auth + JWT plugin, Express httpOnly cookie, Google OAuth
- Owner dashboard: add, edit, delete listings; view booking counts
- Personal bookings page with room images and cancel flow
- Dark/light theme (saved in `localStorage`)
- Toast notifications via [Sonner](https://sonner.emilkowal.ski/)
- Page transitions and card animations via [Framer Motion](https://www.framer.com/motion/)

## Tech

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, DaisyUI, Sonner, Framer Motion |
| Backend | Node.js, Express 5, MongoDB |
| Auth | Better Auth (JWT plugin) + Express JWT cookie |

## Local setup

### 1. API (`Server/`)

```bash
cd Server
npm install
# .env: MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN=http://localhost:3000
node index.js
```

### 2. Client (`studynook/`)

```bash
cd studynook
npm install
cp .env.example .env.local
# Set MONGODB_URI, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API is proxied at `/backend` so auth cookies work on reload.

### Environment (`studynook/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=/backend
API_INTERNAL_URL=http://localhost:5000
MONGODB_URI=
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## API routes (assignment-style)

Rooms and bookings use the `/api` prefix:

- `GET /api/rooms`, `GET /api/rooms/:id`, `GET /api/rooms/mine`
- `POST /api/rooms`, `PUT /api/rooms/:id`, `DELETE /api/rooms/:id`
- `POST /api/bookings`, `GET /api/bookings/my`, `PATCH /api/bookings/:id/cancel`

Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/google`, `/auth/me`

Legacy `/rooms` paths still work on the server for backward compatibility.

## Production

- Set `NODE_ENV=production` on the API so cookies use `secure: true` (HTTPS only).
- Set `CLIENT_ORIGIN` to your deployed frontend URL.
- Point `NEXT_PUBLIC_API_BASE_URL` to your deployed API (or keep `/backend` rewrite if same host).

## Scripts

```bash
npm run dev    # development
npm run build  # production build
npm run start  # production server
```
