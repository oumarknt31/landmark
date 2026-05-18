# Landmark

> A study companion for foundational computer science. 12 topics, 3 chapters, paired lessons and 5-question drills with spaced repetition, hybrid search, daily streaks, and AI explanations.

Originally a C++/Qt desktop honors project at BMCC (Fall 2023). Rebuilt in 2026 as a polyglot web app to learn the modern stack end-to-end.

## Stack at a glance

| Layer | Tech |
| --- | --- |
| **Frontend** | Vite, React 19, TypeScript, Tailwind v4, React Router 7, Zustand, MiniSearch, PWA (vite-plugin-pwa) |
| **API gateway** | Node + Hono (TypeScript), token-bucket rate limiting |
| **ML / analytics service** | Python + FastAPI, sentence-transformers, pandas, Pydantic |
| **Database / auth** | Supabase (Postgres with RLS, JSONB state, email+password and anonymous auth) |
| **AI** | Anthropic Claude Haiku 4.5, prompt caching |
| **Quality** | Playwright E2E in GitHub Actions, Sentry, Vercel Speed Insights |

## Architecture

```
   browser
      │
      ▼ (Vite proxy / Vercel rewrite)
  Node + Hono gateway ──► Anthropic explanations (rate-limited, per-IP token bucket)
      │              ──► Supabase Postgres (RLS-gated user_progress, leaderboard view)
      │
      ▼ (server-to-server, ADMIN_TOKEN)
  Python + FastAPI service
      ├── /search         sentence-transformers (all-MiniLM-L6-v2), cosine sim on numpy
      ├── /analytics/*    pandas aggregations over user_progress JSONB
      └── /generate       Anthropic + Pydantic-validated question generation (admin-only)
```

The Python service is never reachable from the browser. The Hono gateway validates the user's Supabase JWT and bridges to Python with a server-side admin token.

## Feature highlights

- **Hybrid search.** A browser-side MiniSearch (TF-IDF) index answers keyword queries instantly. The Python service embeds your query into a 384-dim vector space and returns matches by meaning. The two rankings are fused with **Reciprocal Rank Fusion (k=60)**, so a single search box handles both *"recursion"* and *"how does a CPU run instructions"*.
- **SM-2 spaced repetition.** Per-question stats (ease, interval, repetitions) track which questions are due. A dedicated `/drill` page surfaces only those.
- **Local-first progress.** Quiz attempts, lessons read, notes, XP, and streaks live in Zustand with `persist`, then sync to Postgres the moment you sign in. Works offline as a PWA.
- **Leaderboard with anonymized handles.** A SQL view exposes only `(handle, total_xp, last_active)`, never UUIDs or emails. Anonymous-auth users get a deterministic anime-flavored handle (`CrimsonKitsune42`) seeded from their UUID.
- **AI explanations.** A per-question *"Why is this the answer?"* button hits Anthropic with aggressive prompt caching. Per-IP rate-limited.
- **Daily XP and activity heatmap.** GitHub-style 12-month contribution graph rendered as SVG, computed client-side from the daily-XP map.
- **Per-user pandas analytics.** The Python service computes weakest topics, 30-day XP series, rolling 5-attempt accuracy trend, and current streak from the user's `user_progress.state` blob.
- **Security baseline.** Strict CSP allowlist, HSTS, X-Frame-Options DENY, Permissions-Policy denying camera/mic/geo/payment/USB/FLoC, COOP/CORP, server-side error sanitization. See [SECURITY.md](./SECURITY.md).

## Local dev

You need Node 20+, Python 3.11+, and a free Supabase project.

```bash
# 1. Frontend
npm install
cp .env.local.example .env.local   # then fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev                         # http://localhost:5173

# 2. Hono gateway (in a second terminal)
cd server
npm install
cp .env.example .env                # fill in SUPABASE_*, ANTHROPIC_API_KEY, PYTHON_ADMIN_TOKEN
npm run dev                         # http://localhost:8080

# 3. Python service (in a third terminal)
cd python-server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                # fill in ADMIN_TOKEN (same as PYTHON_ADMIN_TOKEN above)
uvicorn src.main:app --reload --port 8000
```

Supabase schema is in [`supabase/setup.sql`](./supabase/setup.sql) — paste into the SQL editor of a fresh project to create tables, RLS policies, the `leaderboard_view`, and the `total_xp(state)` function.

## Tests

```bash
npm run test:e2e          # Playwright, headless
npm run test:e2e:ui       # Playwright UI mode
npm run lint              # ESLint
npx tsc -b                # Frontend typecheck
cd server && npm run typecheck
```

CI runs Playwright on every push (`.github/workflows/`).

## Deployment

- **Frontend** → Vercel. `vercel.json` sets security headers and the SPA rewrite.
- **Hono gateway** → Render. `server/render.yaml` provisions the service.
- **Python service** → Render. `python-server/render.yaml` builds the Dockerfile (which pre-downloads the embedding model so cold starts don't pay the download).

## Credits, license

Content is adapted from open-licensed sources, primarily Wikipedia articles on computer science (CC BY-SA 4.0), with original interview-style question phrasing. Each topic credits its sources at the bottom of the lesson.

Built by [Oumar Kante](https://github.com/) · 2026.
