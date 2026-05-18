# Landmark Python Server

A FastAPI microservice that complements the Node/Hono gateway with capabilities Python is the obvious choice for:

| Endpoint | What it does | Stack |
| --- | --- | --- |
| `GET /search?q=...` | Semantic search across lessons + quiz questions | sentence-transformers (`all-MiniLM-L6-v2`), numpy cosine sim |
| `GET /analytics/user/{user_id}` | Per-user analytics: weakest topics, XP-over-time, accuracy trend, streak | pandas + supabase-py |
| `POST /generate` | LLM-powered quiz-question generation from a lesson body | Anthropic SDK (Claude Haiku 4.5), Pydantic validation |
| `GET /health` | Liveness probe (used by Render health check) | – |

The service is **not** publicly reachable in production — the Hono gateway (`../server`) proxies frontend traffic to it and adds the admin token for protected routes.

## Architecture

```
   browser
      │
      ▼  (Vite dev proxy / Vercel rewrite)
  Hono gateway  ──►  Anthropic, Supabase, leaderboard
      │
      ▼  (server-to-server, ADMIN_TOKEN header)
  Python service  ──►  sentence-transformers (in-process)
                  ──►  Anthropic (generator)
                  ──►  Supabase (analytics, service role)
```

## Local dev

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in SUPABASE_* and ANTHROPIC_API_KEY
uvicorn src.main:app --reload --port 8000
```

First boot downloads the embedding model (~80 MB) and builds the index over `../src/content`. On subsequent runs the model is cached and index build takes ~2 s.

## Endpoints

### `GET /search?q=<query>&limit=8`
Returns ranked lesson chunks + quiz prompts by cosine similarity.

```json
{
  "query": "binary tree",
  "count": 3,
  "results": [
    { "id": "question:cs101-2", "kind": "question", "topic_id": "intro-to-cs",
      "topic_name": "Introduction to Computer Science", "title": "...",
      "snippet": "...", "score": 0.48 }
  ]
}
```

### `GET /analytics/user/{user_id}`
Requires `Authorization: Bearer $ADMIN_TOKEN`. Reads `public.user_progress.state` and computes:
- `totals`: XP (overall + per source), attempts, lessons read, overall accuracy, current streak
- `weakestTopics`: bottom-5 topics by average accuracy
- `xpLast30Days`: dense daily series (zeros included)
- `accuracyTrend`: rolling 5-attempt mean accuracy over time

### `POST /generate`
Requires `Authorization: Bearer $ADMIN_TOKEN`. Body:
```json
{ "topic_id": "binary-trees", "lesson_markdown": "...", "count": 5 }
```
Returns Pydantic-validated questions in the same shape as `quizzes.json` (`prompt`, `options[4]`, `correctIndex`, `explanation`).

## Deploy (Render)

Push the repo and point Render at `python-server/render.yaml`. Set env vars in the dashboard (`sync: false` keeps them out of git). The Dockerfile pre-downloads the embedding model so cold starts only pay the boot cost, not the download.
