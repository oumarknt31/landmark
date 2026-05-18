/**
 * Server-side Anthropic call. The API key is read at call time from the
 * environment so a stale module reference doesn't trap a bad value during
 * dev hot-reloads.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You are a precise study tutor for the Landmark learning app. The user just answered a multiple-choice question in computer science. Explain why the correct answer is right in 2 to 3 plain sentences. Be direct, accurate, and slightly warm. Do not moralize, hedge, or add disclaimers. If the user's wrong answer reflects a common misconception, name it.`;

export interface ExplainPayload {
  prompt: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  topicName: string;
}

function letter(i: number): string {
  return String.fromCharCode(65 + i);
}

function validate(p: unknown): asserts p is ExplainPayload {
  if (typeof p !== 'object' || p === null) throw new Error('Payload must be a JSON object.');
  const x = p as Record<string, unknown>;
  if (typeof x.prompt !== 'string' || !x.prompt) throw new Error('prompt is required.');
  if (!Array.isArray(x.options) || x.options.length !== 4) {
    throw new Error('options must be an array of 4 strings.');
  }
  if (typeof x.correctIndex !== 'number' || x.correctIndex < 0 || x.correctIndex > 3) {
    throw new Error('correctIndex must be in 0..3.');
  }
  if (typeof x.selectedIndex !== 'number') throw new Error('selectedIndex is required.');
}

export async function explain(rawPayload: unknown): Promise<string> {
  validate(rawPayload);
  const payload = rawPayload as ExplainPayload;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured.');

  const optionsList = payload.options
    .map((o, i) => `  ${letter(i)}) ${o}`)
    .join('\n');
  const userMessage =
    `Topic: ${payload.topicName}\n` +
    `Question: ${payload.prompt}\n` +
    `Options:\n${optionsList}\n` +
    `Correct answer: ${letter(payload.correctIndex)}\n` +
    `User selected: ${
      payload.selectedIndex >= 0 ? letter(payload.selectedIndex) : '(no answer)'
    }`;

  const upstream = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 350,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    throw new Error(`Anthropic API error (${upstream.status}): ${text}`);
  }

  const data = (await upstream.json()) as {
    content?: { type: string; text: string }[];
  };
  const block = data.content?.find((b) => b.type === 'text');
  const explanation = block?.text?.trim() ?? '';
  if (!explanation) throw new Error('Empty response from upstream.');
  return explanation;
}
