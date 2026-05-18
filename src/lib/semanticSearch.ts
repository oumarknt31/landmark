/** Client for the Python /api/py/search endpoint. */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export interface SemanticHit {
  id: string;
  kind: 'lesson' | 'question';
  topic_id: string;
  topic_name: string;
  title: string;
  snippet: string;
  score: number;
}

export interface SemanticSearchResponse {
  query: string;
  count: number;
  results: SemanticHit[];
}

export async function semanticSearch(
  query: string,
  signal?: AbortSignal,
): Promise<SemanticHit[]> {
  const url = new URL(`${API_BASE}/api/py/search`, window.location.origin);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '8');
  const r = await fetch(url, { signal });
  if (!r.ok) {
    throw new Error(`Semantic search failed (${r.status})`);
  }
  const data = (await r.json()) as SemanticSearchResponse;
  return data.results;
}

/** Map a semantic hit to the in-app route that displays it. */
export function semanticHref(hit: SemanticHit): string {
  return hit.kind === 'lesson'
    ? `/lesson/${hit.topic_id}`
    : `/quiz/${hit.topic_id}`;
}
