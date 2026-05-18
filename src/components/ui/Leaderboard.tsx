import { useEffect, useState } from 'react';

import { fetchLeaderboard, type LeaderboardEntry } from '../../lib/leaderboard';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; entries: LeaderboardEntry[] };

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export default function Leaderboard() {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    void fetchLeaderboard().then((entries) => {
      if (cancelled) return;
      if (entries === null) setState({ status: 'error' });
      else setState({ status: 'loaded', entries });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Leaderboard, top 10 by XP
      </p>

      {state.status === 'loading' && (
        <p className="mt-3 text-sm italic text-[var(--color-muted)]">
          fetching…
        </p>
      )}

      {state.status === 'error' && (
        <p className="mt-3 text-sm italic text-[var(--color-muted)]">
          Couldn't reach the server. Try again later.
        </p>
      )}

      {state.status === 'loaded' && state.entries.length === 0 && (
        <p className="mt-3 text-sm italic text-[var(--color-muted)]">
          No XP earned yet across the system. Be the first.
        </p>
      )}

      {state.status === 'loaded' && state.entries.length > 0 && (
        <ol className="mt-4 divide-y divide-[var(--color-rule)] border border-[var(--color-rule)] bg-[rgba(184,65,14,0.035)]">
          {state.entries.map((entry, index) => (
            <li
              key={entry.handle}
              className="flex items-baseline gap-4 px-4 py-2.5 font-mono text-sm"
            >
              <span className="w-7 shrink-0 tabular-nums text-[var(--color-muted)]">
                {String(index + 1).padStart(2, '0')}.
              </span>
              <span className="flex-1 text-[var(--color-ink)]">
                {entry.handle}
              </span>
              <span className="hidden text-xs italic text-[var(--color-muted)] sm:inline">
                active {formatRelative(entry.last_active)}
              </span>
              <span className="tabular-nums text-[var(--color-accent)]">
                {entry.total_xp.toLocaleString()} XP
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
