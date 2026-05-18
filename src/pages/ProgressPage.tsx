import { Link } from 'react-router-dom';

import AnalyticsPanel from '../components/ui/AnalyticsPanel';
import ContributionGraph from '../components/ui/ContributionGraph';
import Leaderboard from '../components/ui/Leaderboard';
import PageShell from '../components/layout/PageShell';
import { findTopicById } from '../lib/loadQuizzes';
import { currentStreak, longestStreak, totalXp } from '../lib/streak';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';

interface TopicRow {
  topicId: string;
  topicName: string;
  href: string;
  best: number;
  attempts: number;
  total: number;
}

export default function ProgressPage() {
  const attempts = useProgressStore((s) => s.attempts);
  const questionStats = useProgressStore((s) => s.questionStats);
  const dailyXp = useProgressStore((s) => s.dailyXp);
  const xpBySource = useProgressStore((s) => s.xpBySource);
  const lastSyncedAt = useProgressStore((s) => s.lastSyncedAt);
  const reset = useProgressStore((s) => s.reset);
  const user = useAuthStore((s) => s.user);

  const now = Date.now();
  const dueCount = Object.values(questionStats).filter(
    (s) => s.nextDueAt <= now,
  ).length;

  const streak = currentStreak(dailyXp);
  const longest = longestStreak(dailyXp);
  const xpTotal = totalXp(dailyXp);
  const xpQuiz = xpBySource.quiz;
  const xpLesson = xpBySource.lesson;
  const xpDenom = Math.max(xpQuiz + xpLesson, 1);
  const quizPct = Math.round((xpQuiz / xpDenom) * 100);
  const lessonPct = 100 - quizPct;

  const rows: TopicRow[] = [];
  const seen = new Set<string>();
  for (const attempt of attempts) {
    if (seen.has(attempt.topicId)) continue;
    seen.add(attempt.topicId);
    const topic = findTopicById(attempt.topicId);
    if (!topic) continue;
    const topicAttempts = attempts.filter(
      (a) => a.topicId === attempt.topicId,
    );
    const best = Math.max(...topicAttempts.map((a) => a.score));
    rows.push({
      topicId: topic.id,
      topicName: topic.name,
      href: `/quiz/${topic.id}`,
      best,
      attempts: topicAttempts.length,
      total: topic.questions.length,
    });
  }

  const syncLabel = (() => {
    if (!user) return null;
    if (lastSyncedAt) {
      const diff = Date.now() - lastSyncedAt;
      const secs = Math.floor(diff / 1000);
      if (secs < 60) return `synced ${secs}s ago`;
      if (secs < 3600) return `synced ${Math.floor(secs / 60)}m ago`;
      return `synced ${Math.floor(secs / 3600)}h ago`;
    }
    return 'not yet synced';
  })();

  return (
    <PageShell wide>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        $ stat /user
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        PROGRESS_
      </h1>

      {user && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          signed in as{' '}
          <span className="text-[var(--color-ink)]">{user.email}</span>
          {syncLabel ? <> &middot; {syncLabel}</> : null}
        </p>
      )}
      {!user && (
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          working locally &middot; sign in to back up your progress.
        </p>
      )}

      {/* Stat cards: STREAK | LONGEST | XP TOTAL */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Current streak"
          value={`${streak}`}
          unit={streak === 1 ? 'day' : 'days'}
          flame={streak >= 3}
        />
        <StatCard
          label="Longest streak"
          value={`${longest}`}
          unit={longest === 1 ? 'day' : 'days'}
        />
        <StatCard
          label="Total XP"
          value={xpTotal.toLocaleString()}
          unit="xp"
          flame={xpTotal >= 1000}
        />
      </div>

      {/* XP breakdown bar */}
      {xpTotal > 0 && (
        <section className="mt-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            XP by source
          </p>
          <div className="mt-3 font-mono text-xs leading-relaxed">
            <div className="flex items-baseline justify-between text-[var(--color-ink)]">
              <span>LESSONS</span>
              <span className="tabular-nums">
                {xpLesson.toLocaleString()} XP &middot; {lessonPct}%
              </span>
            </div>
            <BarRow pct={lessonPct} char="█" color="var(--color-ink)" />

            <div className="mt-2 flex items-baseline justify-between text-[var(--color-accent)]">
              <span>QUIZZES</span>
              <span className="tabular-nums">
                {xpQuiz.toLocaleString()} XP &middot; {quizPct}%
              </span>
            </div>
            <BarRow pct={quizPct} char="█" color="var(--color-accent)" />
          </div>
        </section>
      )}

      {/* Activity heatmap */}
      <section className="mt-12">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Activity, last 12 months
        </p>
        <div className="mt-4">
          <ContributionGraph daily={dailyXp} />
        </div>
      </section>

      {/* Python-powered analytics: pandas aggregations served by FastAPI. */}
      {user && (
        <section className="mt-12">
          <AnalyticsPanel />
        </section>
      )}

      {/* Leaderboard (top users by XP across the whole system) */}
      <section className="mt-12">
        <Leaderboard />
      </section>

      <hr className="my-12" />

      {(dueCount > 0 || Object.keys(questionStats).length > 0) && (
        <>
          <Link
            to="/drill"
            className="group flex items-baseline justify-between border border-[var(--color-rule)] px-6 py-4 transition-colors hover:border-[var(--color-accent)] active:translate-x-[1px]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Spaced repetition
              </p>
              <p className="mt-1 text-base text-[var(--color-ink)]">
                Drill weak spots
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {dueCount > 0
                  ? `${dueCount} ${dueCount === 1 ? 'question is' : 'questions are'} due for review.`
                  : 'No reviews due right now, check back tomorrow.'}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="text-base text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-accent)]"
            >
              →
            </span>
          </Link>

          <hr className="my-12" />
        </>
      )}

      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        Recent attempts
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          No attempts yet. Pick a topic and take a quiz; your scores will
          land here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--color-rule)]">
          {rows.map((row) => (
            <li key={row.topicId} className="py-4">
              <Link
                to={row.href}
                className="group block active:translate-x-[1px]"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <span className="text-base text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                    {row.topicName}
                  </span>
                  <span className="tabular-nums text-[var(--color-accent)]">
                    {row.best} / {row.total}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {row.attempts}{' '}
                  {row.attempts === 1 ? 'attempt' : 'attempts'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12">
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                'Clear all attempts, XP, streaks, and lessons read? This cannot be undone.',
              )
            ) {
              reset();
            }
          }}
          className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-[var(--color-rule)] underline-offset-4 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
        >
          Clear progress
        </button>
      </div>
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  unit,
  flame = false,
}: {
  label: string;
  value: string;
  unit: string;
  flame?: boolean;
}) {
  return (
    <div className="border border-[var(--color-rule)] bg-[rgba(184,65,14,0.035)] px-5 py-4">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold tabular-nums text-[var(--color-ink)]">
          {value}
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {unit}
        </span>
        {flame && (
          <span
            aria-hidden="true"
            className="text-sm text-[var(--color-accent)]"
            title="On fire"
          >
            *
          </span>
        )}
      </p>
    </div>
  );
}

function BarRow({
  pct,
  char,
  color,
}: {
  pct: number;
  char: string;
  color: string;
}) {
  const filled = Math.max(0, Math.min(40, Math.round((pct / 100) * 40)));
  const empty = 40 - filled;
  return (
    <div
      style={{ color }}
      className="overflow-hidden whitespace-nowrap font-mono text-[0.95em] leading-none tracking-tight"
      aria-hidden="true"
    >
      {char.repeat(filled)}
      <span className="text-[var(--color-rule)]">{'░'.repeat(empty)}</span>
    </div>
  );
}
