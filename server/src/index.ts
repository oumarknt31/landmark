import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import explain from './routes/explain';
import feedback from './routes/feedback';
import health from './routes/health';
import leaderboard from './routes/leaderboard';
import python from './routes/python';

const app = new Hono();

// CORS — allow the configured origin (the deployed frontend) plus localhost
// for dev. CORS_ORIGIN is a comma-separated list.
const allowedOrigins = (
  process.env.CORS_ORIGIN ??
  'http://localhost:5173,http://localhost:4173'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  '/*',
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : null),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Baseline security headers for every API response. The frontend gets its
// own headers via Vercel, but JSON APIs benefit from a few too.
app.use('/*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Cross-Origin-Resource-Policy', 'same-site');
});

// Structured request log: METHOD path STATUS time(ms).
app.use('/*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `${new Date().toISOString()}  ${c.req.method.padEnd(6)} ${c.req.path}  ${c.res.status}  ${ms}ms`,
  );
});

app.route('/api/health', health);
app.route('/api/explain', explain);
app.route('/api/leaderboard', leaderboard);
app.route('/api/feedback', feedback);
app.route('/api/py', python);

app.notFound((c) => c.json({ error: 'Not found.' }, 404));
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error.' }, 500);
});

const port = Number(process.env.PORT ?? 8080);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Landmark server listening on http://localhost:${info.port}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
