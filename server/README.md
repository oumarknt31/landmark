# landmark-server

A small Hono backend that powers the parts of Landmark that need server-side credentials, aggregations, or rate limiting:

- **`POST /api/explain`** — proxies a question + user answer to the Anthropic API, with rate limiting per IP and ephemeral prompt caching.
- **`GET  /api/leaderboard`** — top 10 users by total XP, anonymized handles. Reads from a Postgres view.
- **`POST /api/feedback`** — accepts user reports about unclear / wrong / typo questions; writes to `question_feedback`.
- **`GET  /api/health`** — uptime / version probe.

The frontend lives separately in `landmark-web/`. Both projects share the Supabase database.

## Local development

```bash
# from landmark-web/server/
cp .env.example .env
# fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
npm install
npm run dev
```

The server listens on `http://localhost:8080`. The Vite frontend (`cd ..; npm run dev`) proxies `/api/*` to it automatically — open `http://localhost:5173/` and everything just works.

Useful one-offs:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # compile to dist/
npm start           # node dist/index.js
```

## Required environment variables

| Variable                       | Where to get it                                                                                                                              |
|--------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| `SUPABASE_URL`                 | Supabase Dashboard → Project Settings → API → Project URL                                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase Dashboard → Project Settings → API → `service_role` key. **Server-only**. Bypasses RLS — do not expose to the browser or commit it. |
| `ANTHROPIC_API_KEY`            | console.anthropic.com → API Keys                                                                                                              |
| `CORS_ORIGIN`                  | Comma-separated list of allowed origins. Dev: `http://localhost:5173,http://localhost:4173`. Prod: `https://your-app.vercel.app`              |
| `PORT`                         | Defaults to `8080`. Render sets this automatically.                                                                                           |
| `EXPLAIN_RATE_CAPACITY`        | Optional. Max tokens in the per-IP bucket (default 60).                                                                                       |
| `EXPLAIN_RATE_REFILL`          | Optional. Tokens refilled per hour (default 60).                                                                                              |

## Database schema

Run `landmark-web/supabase/setup.sql` once in the Supabase SQL Editor. It creates:

- `public.user_progress` — single-row-per-user JSONB blob with RLS.
- `public.question_feedback` — feedback inserts; the frontend can write, but only the backend (service role) reads.
- `public.total_xp(state jsonb)` — pure function summing the `dailyXp` map.
- `public.leaderboard_view` — top-XP-first view, exposes only an anonymized handle + total XP + last active timestamp. Granted SELECT to `anon` and `authenticated` roles.

## Deploying to Render (free tier)

1. Push this repo to GitHub.
2. In Render → **New** → **Web Service** → connect the GitHub repo.
3. Root directory: `landmark-web/server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add the env vars above in the Render dashboard (under **Environment**).
7. Render assigns a URL like `https://landmark-server.onrender.com`. Copy it into the frontend's `VITE_API_BASE_URL` env var on Vercel.

The free Render plan idles the service after 15 minutes of inactivity; the first request after that wakes it up (cold-start ~15s). Acceptable for a study app; upgrade to the Starter plan ($7/mo) if you want the server always-on.
