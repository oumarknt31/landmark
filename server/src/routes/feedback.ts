import { Hono } from 'hono';

import { supabase } from '../lib/supabase';
import { rateLimit } from '../middleware/rateLimit';

const ALLOWED_KINDS = new Set([
  'unclear',
  'wrong-answer',
  'typo',
  'other',
]);

const app = new Hono();

// 30 feedback submissions per hour per IP — enough for an honest user, not
// enough for a spammer.
app.use(rateLimit({ capacity: 30, refillPerHour: 30 }));

app.post('/', async (c) => {
  let body: Record<string, unknown>;
  try {
    body = (await c.req.json()) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'Body must be valid JSON.' }, 400);
  }

  const questionId = typeof body.questionId === 'string' ? body.questionId : '';
  const topicId =
    typeof body.topicId === 'string' && body.topicId.length > 0
      ? body.topicId
      : null;
  const kind = typeof body.kind === 'string' ? body.kind : '';
  const message =
    typeof body.message === 'string' && body.message.trim().length > 0
      ? body.message.trim().slice(0, 1000)
      : null;
  const userId =
    typeof body.userId === 'string' && body.userId.length > 0
      ? body.userId
      : null;

  if (!questionId) return c.json({ error: 'questionId is required.' }, 400);
  if (!ALLOWED_KINDS.has(kind)) {
    return c.json(
      { error: `kind must be one of: ${Array.from(ALLOWED_KINDS).join(', ')}.` },
      400,
    );
  }

  const { error } = await supabase.from('question_feedback').insert({
    question_id: questionId,
    topic_id: topicId,
    user_id: userId,
    kind,
    message,
  });

  if (error) {
    console.error('Feedback insert failed:', error.message);
    return c.json({ error: 'Could not save feedback.' }, 500);
  }

  return c.json({ ok: true });
});

export default app;
