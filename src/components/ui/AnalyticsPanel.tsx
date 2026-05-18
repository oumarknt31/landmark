/**
 * Renders pandas-computed analytics from the Python service.
 * Fetches /api/py/analytics/me using the current Supabase session.
 */

import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

interface AnalyticsTotals {
  xp: number;
  xpBySource: { quiz: number; lesson: number };
  attempts: number;
  lessonsRead: number;
  overallAccuracy: number | null;
  currentStreak: number;
}

interface WeakestTopic {
  topicId: string;
  attempts: number;
  avgAccuracy: number;
  bestAccuracy: number;
  lastAttempt: string | null;
}

interface AccuracyPoint {
  completedAt: string | null;
  rollingAccuracy: number;
}

interface AnalyticsPayload {
  userId: string;
  totals: AnalyticsTotals;
  weakestTopics: WeakestTopic[];
  accuracyTrend: AccuracyPoint[];
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: AnalyticsPayload };

export default function AnalyticsPanel() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setState({ kind: 'loading' });
      try {
        const sbMod = await import('../../lib/supabase');
        if (!sbMod.supabase) {
          setState({ kind: 'error', message: 'Backend not configured.' });
          return;
        }
        const { data } = await sbMod.supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setState({ kind: 'error', message: 'Sign in to see analytics.' });
          return;
        }
        const r = await fetch(`${API_BASE}/api/py/analytics/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) {
          setState({
            kind: 'error',
            message: `Analytics unavailable (${r.status}).`,
          });
          return;
        }
        const payload = (await r.json()) as AnalyticsPayload;
        if (!cancelled) setState({ kind: 'ready', data: payload });
      } catch (e) {
        if (cancelled) return;
        setState({
          kind: 'error',
          message: e instanceof Error ? e.message : 'Unknown error',
        });
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <p className="text-xs text-[var(--color-muted)]">
        Crunching with pandas…
      </p>
    );
  }
  if (state.kind === 'error') {
    return (
      <p className="text-xs text-[var(--color-muted)]">{state.message}</p>
    );
  }
  if (state.kind !== 'ready') return null;

  const { totals, weakestTopics, accuracyTrend } = state.data;
  const accuracyPct =
    totals.overallAccuracy != null
      ? `${Math.round(totals.overallAccuracy * 100)}%`
      : '–';

  return (
    <section
      className="border-2 px-6 py-5"
      style={{
        borderColor: 'var(--color-purple)',
        background: 'var(--tint-purple)',
      }}
    >
      <p
        className="text-[0.65rem] uppercase tracking-[0.18em]"
        style={{ color: 'var(--color-purple)' }}
      >
        Python · pandas analytics
      </p>
      <h2 className="mt-1 font-mono text-xl font-bold tracking-tight text-[var(--color-ink)]">
        Your study breakdown
      </h2>

      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Accuracy" value={accuracyPct} />
        <Stat label="Attempts" value={String(totals.attempts)} />
        <Stat label="Lessons read" value={String(totals.lessonsRead)} />
        <Stat label="Day streak" value={String(totals.currentStreak)} />
      </dl>

      {weakestTopics.length > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Weakest topics (lowest avg accuracy)
          </p>
          <ul className="mt-2 space-y-1">
            {weakestTopics.slice(0, 5).map((t) => (
              <li
                key={t.topicId}
                className="flex items-baseline justify-between text-sm"
              >
                <span className="font-mono text-[var(--color-ink)]">
                  {t.topicId}
                </span>
                <span className="text-xs text-[var(--color-muted)]">
                  {Math.round(t.avgAccuracy * 100)}% · {t.attempts}{' '}
                  {t.attempts === 1 ? 'attempt' : 'attempts'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {accuracyTrend.length >= 2 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Accuracy trend (rolling, 5-attempt window)
          </p>
          <Sparkline points={accuracyTrend.map((p) => p.rollingAccuracy)} />
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-2xl text-[var(--color-ink)]">
        {value}
      </dd>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  const w = 240;
  const h = 40;
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(max - min, 0.0001);
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="mt-2"
      aria-label="Rolling accuracy sparkline"
    >
      <path
        d={path}
        fill="none"
        stroke="var(--color-purple)"
        strokeWidth={1.5}
      />
    </svg>
  );
}
