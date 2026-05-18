# Security model

This document describes Landmark's security posture across its three services and how to report issues.

## Threat model, scope

Landmark stores per-user study data (quiz attempts, lesson notes, XP) and proxies a small number of LLM calls. The main concerns are:

- **Cross-user data leakage** — one user reading or modifying another's progress.
- **Server-side secret exposure** — Supabase service-role key, Anthropic API key, admin tokens.
- **Cost abuse** — unauthenticated or excessive Anthropic spend via the explanation endpoint.
- **Client-side XSS / clickjacking** on the React app.

Out of scope for this implementation: DDoS protection beyond per-IP rate limiting, formal third-party penetration testing, multi-factor auth.

## Authentication, authorization

| Surface | Mechanism |
| --- | --- |
| Browser → Frontend | – |
| Browser → Hono gateway (`/api/*`) | Supabase JWT in `Authorization: Bearer` when required |
| Hono → Supabase Postgres | Service-role key (env, server-side only) |
| Hono → Python service (`/analytics`, `/generate`) | Hono validates the user JWT, then forwards with a server-side `ADMIN_TOKEN` |
| Browser → Python service | Never. The Python service is server-to-server only. |

### Row-level security

Every user-data row in Postgres is gated by RLS policies that require `auth.uid() = user_id`. RLS plus separate base-table grants are configured in `supabase/setup.sql`:

- `public.user_progress` — RLS-on; per-user select/insert/update.
- `public.question_feedback` — RLS-on; insert-only from anon/authenticated; reads are service-role only.
- `public.leaderboard_view` — exposes only the anonymized handle + total XP (no email, UUID, or PII).

Anonymous-auth users get a real Supabase JWT and are subject to the same RLS as email-account users.

## Secrets handling

- All secrets live in `*.env*` files, which are gitignored at the repo root (`.gitignore` explicitly excludes `.env`, `.env.*`, allowlisting only `.env.example` files).
- `*.env.example` files are committed and contain **no real values** — they're documentation.
- The Supabase service-role key and Anthropic API key are only ever read by Node (`server/`) and Python (`python-server/`) processes — never bundled into the frontend.
- The browser uses only the Supabase **anon** key plus the user's JWT. The anon key is gated by RLS on every read/write.
- LLM responses are not logged with their inputs server-side.

## Rate limiting, cost control

- `/api/explain` is protected by a per-IP token-bucket limiter (`server/src/middleware/rateLimit.ts`). Default: 60 calls/hour/IP, tunable via `EXPLAIN_RATE_CAPACITY` and `EXPLAIN_RATE_REFILL`.
- The AI question generator (`POST /generate`) requires a server-side admin token. End users cannot trigger Anthropic spend through it.

## Transport, headers

The deployed frontend (Vercel) sets:

- **HSTS** with `max-age=63072000; includeSubDomains; preload`
- **Content-Security-Policy** allowlisting self, Supabase (HTTPS + WSS), Sentry, Google Fonts, Vercel Analytics, and Anthropic. `frame-ancestors 'none'`, `object-src 'none'`, `upgrade-insecure-requests`.
- **X-Content-Type-Options: nosniff**
- **X-Frame-Options: DENY** (defense in depth alongside `frame-ancestors`)
- **Referrer-Policy: strict-origin-when-cross-origin**
- **Permissions-Policy** denies camera, microphone, geolocation, payment, usb, sensors, FLoC.
- **Cross-Origin-Opener-Policy: same-origin**, **Cross-Origin-Resource-Policy: same-origin**

The API services (Hono, FastAPI) set the same `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` headers on every response, plus a per-origin CORS allowlist (no wildcards) with explicit method and header allow-lists.

## Error handling, info disclosure

API error responses return generic messages to the client. Internal error text (env-var names, upstream API responses, stack traces) is logged server-side only.

## Reporting

If you discover a vulnerability, please open a private GitHub Security Advisory on this repo rather than a public issue.
