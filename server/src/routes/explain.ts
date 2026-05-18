import { Hono } from 'hono';

import { explain } from '../lib/anthropic';
import { rateLimit } from '../middleware/rateLimit';

const app = new Hono();

// 60 explanations per hour per IP. Tunable via env.
app.use(
  rateLimit({
    capacity: Number(process.env.EXPLAIN_RATE_CAPACITY ?? 60),
    refillPerHour: Number(process.env.EXPLAIN_RATE_REFILL ?? 60),
  }),
);

app.post('/', async (c) => {
  try {
    const payload = await c.req.json();
    const explanation = await explain(payload);
    c.header('Cache-Control', 'public, max-age=86400');
    return c.json({ explanation });
  } catch (err) {
    // Log internal detail server-side; return a generic message to the client
    // so we don't echo stack traces, env-var names, or upstream error text.
    console.error('[explain] failed:', err instanceof Error ? err.message : err);
    return c.json({ error: 'Could not generate explanation.' }, 500);
  }
});

export default app;
