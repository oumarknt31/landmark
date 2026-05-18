import { Link } from 'react-router-dom';

import PageShell from '../components/layout/PageShell';
import { listTopicsWithCourse } from '../lib/topicLookup';
import { useTypewriter } from '../lib/useTypewriter';

const BOOT_LINES = [
  '> LANDMARK v1.0  --  cs.study/terminal',
  '> rom check ........... OK',
  '> indexing curriculum . OK',
  '> ready.',
];

export default function HomePage() {
  const topics = listTopicsWithCourse();
  const quizCount = topics.length;
  const lessonCount = topics.filter((t) => t.topic.lessonId).length;

  const tagline = useTypewriter(
    'Pick a path. Read, drill, remember.',
    28,
  );

  return (
    <PageShell wide>
      <pre className="font-mono text-xs leading-tight text-[var(--color-muted)] sm:text-sm">
        {BOOT_LINES.join('\n')}
      </pre>

      <h1 className="mt-8 font-mono text-4xl font-medium tracking-tight text-[var(--color-ink)] sm:text-5xl">
        LANDMARK<span className="text-[var(--color-accent)]">_</span>
      </h1>

      <p className="mt-5 max-w-[60ch] text-base text-[var(--color-ink)]">
        {tagline.shown}
        {tagline.done && <span className="caret" aria-hidden="true" />}
      </p>

      <hr className="mt-10" />

      <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--color-muted)]">
        $ choose your path
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link
          to="/lessons"
          aria-label="Browse lessons"
          className="tile border-2 px-7 py-8"
          style={{
            borderColor: 'var(--color-info)',
            background: 'var(--tint-info)',
          }}
        >
          <p
            className="text-[0.65rem] uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-info)' }}
          >
            01.
          </p>
          <p
            className="mt-2 font-mono text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-info)' }}
          >
            LESSONS
          </p>
          <p className="mt-3 text-sm text-[var(--color-ink)]">
            Read short, focused write-ups on each topic. Code samples,
            common pitfalls, plain language.
          </p>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            {lessonCount} lessons available &middot; ~5–8 min each
          </p>
          <p
            className="mt-5 text-xs uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-info)' }}
          >
            Browse lessons →
          </p>
        </Link>

        <Link
          to="/quizzes"
          aria-label="Browse quizzes"
          className="tile border-2 px-7 py-8"
          style={{
            borderColor: 'var(--color-accent)',
            background: 'var(--tint-accent)',
          }}
        >
          <p
            className="text-[0.65rem] uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-accent)' }}
          >
            02.
          </p>
          <p
            className="mt-2 font-mono text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-accent)' }}
          >
            QUIZZES
          </p>
          <p className="mt-3 text-sm text-[var(--color-ink)]">
            Drill yourself. 5 multiple-choice questions per topic, with
            spaced-repetition tracking and per-question explanations.
          </p>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            {quizCount} quizzes &middot; {quizCount * 5} questions total
          </p>
          <p
            className="mt-5 text-xs uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-accent)' }}
          >
            Browse quizzes →
          </p>
        </Link>
      </div>

      <hr className="mt-12" />

      <p className="mt-2 text-xs text-[var(--color-muted)]">
        $ press <span className="text-[var(--color-ink)]">⌘K</span> to search, or
        head to{' '}
        <Link
          to="/progress"
          className="text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 hover:text-[var(--color-highlight)] hover:decoration-[var(--color-highlight)]"
        >
          /progress
        </Link>{' '}
        to see your streak.
      </p>
    </PageShell>
  );
}
