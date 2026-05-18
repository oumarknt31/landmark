/**
 * Proxy routes that forward to the Python FastAPI service.
 *
 *   GET  /api/py/search?q=...      -> public, just forwards
 *   GET  /api/py/analytics/me      -> validates the caller's Supabase JWT,
 *                                     then calls the Python service with the
 *                                     server-side admin token
 *   POST /api/py/generate          -> admin-only, requires X-Admin-Token from
 *                                     the caller and forwards under the
 *                                     server-side admin token
 *
 * The Python service is **never reachable from the browser**. Only this
 * gateway holds the admin token.
 */

import { Hono } from 'hono';

import { supabase } from '../lib/supabase';

const PY_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000';
const PY_TOKEN = process.env.PYTHON_ADMIN_TOKEN ?? '';
const GATEWAY_ADMIN = process.env.GATEWAY_ADMIN_TOKEN ?? '';

const app = new Hono();

app.get('/search', async (c) => {
  const q = c.req.query('q');
  const limit = c.req.query('limit') ?? '8';
  if (!q || q.length < 2) {
    return c.json({ error: 'q must be at least 2 characters.' }, 400);
  }
  const url = new URL('/search', PY_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', limit);
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

app.get('/analytics/me', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return c.json({ error: 'Sign in required.' }, 401);
  }
  const jwt = auth.slice('Bearer '.length);

  const { data: user, error } = await supabase.auth.getUser(jwt);
  if (error || !user?.user) {
    return c.json({ error: 'Invalid session.' }, 401);
  }
  const userId = user.user.id;

  if (!PY_TOKEN) {
    return c.json({ error: 'Analytics not configured.' }, 503);
  }

  const url = new URL(`/analytics/user/${userId}`, PY_URL);
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${PY_TOKEN}`, Accept: 'application/json' },
  });
  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

app.post('/generate', async (c) => {
  const caller = c.req.header('X-Admin-Token');
  if (!GATEWAY_ADMIN || caller !== GATEWAY_ADMIN) {
    return c.json({ error: 'Unauthorized.' }, 401);
  }
  if (!PY_TOKEN) {
    return c.json({ error: 'Generator not configured.' }, 503);
  }
  const body = await c.req.text();
  const r = await fetch(new URL('/generate', PY_URL), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PY_TOKEN}`,
    },
    body,
  });
  const out = await r.text();
  return new Response(out, {
    status: r.status,
    headers: { 'Content-Type': 'application/json' },
  });
});

export default app;
