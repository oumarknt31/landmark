import { apiUrl } from './api';

export type FeedbackKind = 'unclear' | 'wrong-answer' | 'typo' | 'other';

export interface FeedbackPayload {
  questionId: string;
  topicId?: string;
  userId?: string;
  kind: FeedbackKind;
  message?: string;
}

export async function submitFeedback(
  payload: FeedbackPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(apiUrl('/api/feedback'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, error: body.error ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Network error.' };
  }
}
