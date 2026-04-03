# Pishouli Free Backend (Cloudflare Workers + D1)

This backend is designed for:
- free hosting
- simple bilingual letter CRUD
- room-based access
- vault click logs
- last 5 visit logs
- GitHub Pages frontend compatibility

## Architecture

- Frontend: GitHub Pages (static files)
- Backend API: Cloudflare Workers (free tier)
- Database: Cloudflare D1 SQLite (free tier)

## Why this is free

- GitHub Pages: free for static hosting.
- Cloudflare Workers: generous free tier for low/medium personal app traffic.
- Cloudflare D1: free tier for personal-scale relational storage.

## API security model (simple, no complex auth)

The API uses shared secrets sent in headers:
- `X-Room-Id`
- `X-Room-Key` (required for room reads/writes)
- `X-Admin-Key` (required for admin writes and logs)

This is intentionally simple for couple-only use.

## Setup steps

1. Install Wrangler

```bash
npm install -g wrangler
```

2. Login to Cloudflare

```bash
wrangler login
```

Note:
- You do not need to manually create a Cloudflare API key or API token for this guide.
- Wrangler uses OAuth login from `wrangler login`.

3. Create D1 database

```bash
wrangler d1 create pishouli-db
```

4. Copy the returned `database_id` into [backend/wrangler.toml](backend/wrangler.toml).

5. Apply schema migration

```bash
wrangler d1 execute pishouli-db --file=./migrations/0001_init.sql
```

6. Set bootstrap secret

```bash
wrangler secret put BOOTSTRAP_KEY
```

If Wrangler asks to create the Worker while setting the secret, choose `Y`.

7. Deploy worker

```bash
wrangler deploy
```

8. Restrict CORS in production

Set `ALLOWED_ORIGINS` in [backend/wrangler.toml](backend/wrangler.toml) to your GitHub Pages origin, for example:

```toml
ALLOWED_ORIGINS = "https://yourname.github.io"
```

## One-time room creation

Use the setup endpoint once to create a room:

```bash
curl -X POST "https://YOUR-WORKER.workers.dev/api/setup-room" \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Key: YOUR_BOOTSTRAP_KEY" \
  -d '{
    "roomId": "spring-room",
    "roomKey": "room-secret-only-you-two-know",
    "adminKey": "admin-secret-only-you-two-know"
  }'
```

After room setup, do not expose the bootstrap key to clients.

## Endpoints

- `GET /api/health`
- `GET /api/bootstrap`
- `GET /api/letters`
- `POST /api/letters` (admin)
- `PUT /api/letters/sync` (admin, bulk sync)
- `PUT /api/letters/:id` (admin)
- `DELETE /api/letters/:id` (admin)
- `GET /api/settings`
- `PUT /api/settings` (admin)
- `POST /api/events/click`
- `POST /api/visits/start`
- `POST /api/visits/end`
- `GET /api/admin/logs` (admin)

## Frontend integration checklist

You will need:
- Worker base URL (for example `https://pishouli-backend.workers.dev`)
- Room ID
- Room key
- Admin key (admin mode only)

Frontend query-based one-tap setup can use:
- `syncWorker`
- `syncRoom`
- `syncKey`
- `syncAdmin` (optional)

Headers example for frontend API calls:

```http
X-Room-Id: spring-room
X-Room-Key: room-secret-only-you-two-know
X-Admin-Key: admin-secret-only-you-two-know
```

## Notes you might miss

- You cannot host dynamic backend logic on GitHub Pages alone.
- Use HTTPS only for API calls.
- Rotate room/admin keys if a URL leaks.
- Keep a simple export backup flow for letters.
- Keep CORS restricted to your Pages origin in production.
