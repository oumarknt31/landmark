import type { Question } from '../types/content';

import { apiUrl } from './api';

export interface ExplanationRequest {
  question: Question;
  selectedIndex: number;
  topicName: string;
}

/** Calls the Landmark backend's /api/explain endpoint. Returns null on any
 *  failure so the UI gracefully falls back to no explanation. */
export async function fetchExplanation({
  question,
  selectedIndex,
  topicName,
}: ExplanationRequest): Promise<string | null> {
  try {
    const res = await fetch(apiUrl('/api/explain'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: question.prompt,
        options: question.options,
        selectedIndex,
        correctIndex: question.correctIndex,
        topicName,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { explanation?: string };
    return data.explanation ?? null;
  } catch {
    return null;
  }
}
