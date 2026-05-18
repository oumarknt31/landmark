import { Hono } from 'hono';

const app = new Hono();

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version ?? '0.0.0',
    time: new Date().toISOString(),
  });
});

export default app;
