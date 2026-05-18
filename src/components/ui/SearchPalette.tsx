import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  type MergedRow,
  rrfMerge,
  searchLocal,
  searchSemantic,
} from '../../lib/hybridSearch';
import type { SemanticHit } from '../../lib/semanticSearch';

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

const KIND_LABEL: Record<MergedRow['kind'], string> = {
  topic: 'Topic',
  lesson: 'Lesson',
  question: 'Question',
};

type SemanticState = 'idle' | 'loading' | 'ready' | 'error';

export default function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [semanticHits, setSemanticHits] = useState<SemanticHit[]>([]);
  const [semanticState, setSemanticState] = useState<SemanticState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Local results are instant — no async, no debounce.
  const localHits = useMemo(() => searchLocal(query), [query]);

  // Semantic results are debounced and merged in once they arrive.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSemanticHits([]);
      setSemanticState('idle');
      return;
    }
    setSemanticState('loading');
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await searchSemantic(trimmed, ctrl.signal);
        setSemanticHits(r);
        setSemanticState('ready');
      } catch (e) {
        if ((e as { name?: string }).name === 'AbortError') return;
        setSemanticHits([]);
        setSemanticState('error');
      }
    }, 250);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [query]);

  const rows = useMemo<MergedRow[]>(
    () => rrfMerge(localHits, semanticHits).slice(0, 12),
    [localHits, semanticHits],
  );

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setHighlighted(0);
    setSemanticHits([]);
    setSemanticState('idle');
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, Math.max(rows.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = rows[highlighted];
        if (!target) return;
        onClose();
        navigate(target.href);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, rows, highlighted, navigate, onClose]);

  if (!open) return null;

  const trimmed = query.trim();
  const isEmpty = trimmed === '';
  const noResults = !isEmpty && rows.length === 0 && semanticState !== 'loading';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--color-ink)]/40 px-4 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[60ch] border border-[var(--color-rule)] bg-[var(--color-paper)] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--color-rule)] px-5 py-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, topics, and questions…"
            className="w-full bg-transparent font-serif text-lg text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            type="search"
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-between border-b border-[var(--color-rule)] px-5 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
          <span>
            Hybrid · keyword + semantic
            {semanticState === 'loading' && trimmed.length >= 2 && (
              <span className="ml-2 text-[var(--color-info)]">embedding…</span>
            )}
            {semanticState === 'error' && (
              <span className="ml-2 text-[var(--color-muted)]">
                (semantic offline — keyword only)
              </span>
            )}
          </span>
          <span>
            <kbd className="font-mono">↑↓</kbd>{' '}
            <kbd className="font-mono">↵</kbd>{' '}
            <kbd className="font-mono">Esc</kbd>
          </span>
        </div>

        {isEmpty ? (
          <p className="px-5 py-6 font-sans text-sm text-[var(--color-muted)]">
            Try a keyword (“recursion”) or a question in your own words
            (“how does a CPU run instructions”). Both work.
          </p>
        ) : noResults ? (
          <p className="px-5 py-6 font-sans text-sm text-[var(--color-muted)]">
            Nothing matches “{query}”.
          </p>
        ) : (
          <ul className="max-h-[55vh] overflow-y-auto">
            {rows.map((row, i) => {
              const active = i === highlighted;
              const dual = row.sources.length === 2;
              const accent = dual
                ? 'var(--color-purple)'
                : row.sources[0] === 'semantic'
                  ? 'var(--color-info)'
                  : 'var(--color-accent)';
              const badge = dual
                ? 'kw + sem'
                : row.sources[0] === 'semantic'
                  ? 'sem'
                  : 'kw';
              return (
                <li key={row.href + ':' + i}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(row.href);
                    }}
                    onMouseEnter={() => setHighlighted(i)}
                    className="flex w-full flex-col items-start gap-1 border-l-2 px-5 py-3 text-left transition-colors"
                    style={{
                      borderLeftColor: active ? accent : 'transparent',
                      background: active
                        ? 'var(--color-rule, transparent)'
                        : 'transparent',
                    }}
                  >
                    <div className="flex w-full items-baseline gap-3">
                      <span
                        className="font-mono text-[0.6rem] uppercase tracking-[0.12em]"
                        style={{ color: accent }}
                        title={
                          dual
                            ? 'Found by both keyword and semantic search'
                            : row.sources[0] === 'semantic'
                              ? 'Semantic match (meaning, not exact words)'
                              : 'Keyword match'
                        }
                      >
                        {badge}
                      </span>
                      <span className="font-sans text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                        {KIND_LABEL[row.kind]}
                      </span>
                      <span className="font-serif text-base text-[var(--color-ink)]">
                        {row.title}
                      </span>
                    </div>
                    <span className="font-sans text-xs text-[var(--color-muted)]">
                      {row.context}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
