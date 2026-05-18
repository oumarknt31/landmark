/**
 * Hybrid search: merges MiniSearch (local TF-IDF) and the Python semantic
 * service into a single ranked list using Reciprocal Rank Fusion.
 *
 * RRF: each candidate's score is the sum over all input rankings of
 *      1 / (k + rank), where rank is 1-indexed. k=60 is the standard
 *      from the RRF paper (Cormack et al., 2009).
 *
 * We dedupe by `href` because both systems navigate the user to a URL;
 * if both lists surface the same destination, that's a strong signal and
 * RRF boosts it naturally.
 */

import { search as localSearch, type SearchDoc } from './searchIndex';
import { semanticHref, semanticSearch, type SemanticHit } from './semanticSearch';

const RRF_K = 60;

export type ResultKind = 'topic' | 'lesson' | 'question';
export type RowSource = 'local' | 'semantic';

export interface MergedRow {
  href: string;
  kind: ResultKind;
  title: string;
  context: string;
  sources: RowSource[];
  score: number;
}

function localKind(doc: SearchDoc): ResultKind {
  return doc.kind;
}

function semanticKind(hit: SemanticHit): ResultKind {
  return hit.kind === 'lesson' ? 'lesson' : 'question';
}

export function rrfMerge(
  localHits: SearchDoc[],
  semanticHits: SemanticHit[],
): MergedRow[] {
  const map = new Map<string, MergedRow>();

  localHits.forEach((doc, i) => {
    const rank = i + 1;
    const inc = 1 / (RRF_K + rank);
    const existing = map.get(doc.href);
    if (existing) {
      existing.score += inc;
      if (!existing.sources.includes('local')) existing.sources.push('local');
    } else {
      map.set(doc.href, {
        href: doc.href,
        kind: localKind(doc),
        title: doc.title,
        context: doc.context,
        sources: ['local'],
        score: inc,
      });
    }
  });

  semanticHits.forEach((hit, i) => {
    const rank = i + 1;
    const inc = 1 / (RRF_K + rank);
    const href = semanticHref(hit);
    const existing = map.get(href);
    if (existing) {
      existing.score += inc;
      if (!existing.sources.includes('semantic')) {
        existing.sources.push('semantic');
      }
    } else {
      map.set(href, {
        href,
        kind: semanticKind(hit),
        title: hit.title,
        context: hit.topic_name,
        sources: ['semantic'],
        score: inc,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => b.score - a.score);
}

/** Run a local search synchronously. */
export function searchLocal(query: string): SearchDoc[] {
  return localSearch(query);
}

/** Run the semantic search in the background. Caller handles re-render. */
export async function searchSemantic(
  query: string,
  signal?: AbortSignal,
): Promise<SemanticHit[]> {
  return semanticSearch(query, signal);
}
