import { Hono } from 'hono';

import { supabase } from '../lib/supabase';

const app = new Hono();

/** Top 10 users by total XP, anonymized by an opaque handle. */
app.get('/', async (c) => {
  const { data, error } = await supabase
    .from('leaderboard_view')
    .select('handle, total_xp, last_active')
    .order('total_xp', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Leaderboard query failed:', error.message);
    return c.json({ error: 'Leaderboard temporarily unavailable.' }, 500);
  }

  return c.json({ users: data ?? [] }, 200, {
    'Cache-Control': 'public, max-age=120, s-maxage=120',
  });
});

export default app;
