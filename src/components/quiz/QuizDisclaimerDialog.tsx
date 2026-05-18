import { useEffect } from 'react';

interface QuizDisclaimerDialogProps {
  open: boolean;
  topicName: string;
  onReviewLesson: () => void;
  onSkipAndStart: () => void;
}

/**
 * Shown when a learner opens a quiz for a topic whose lesson they haven't
 * read yet. The dialog isn't a hard block — they can dismiss it and take the
 * quiz cold — but it nudges toward reading first.
 */
export default function QuizDisclaimerDialog({
  open,
  topicName,
  onReviewLesson,
  onSkipAndStart,
}: QuizDisclaimerDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onSkipAndStart();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onSkipAndStart]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lesson not read yet"
      className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--color-ink)]/40 px-4 pt-[14vh]"
      onClick={onSkipAndStart}
    >
      <div
        className="w-full max-w-[54ch] border-2 px-7 py-7"
        style={{
          borderColor: 'var(--color-info)',
          background: 'var(--color-paper)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-info)' }}
        >
          Heads up
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--color-ink)]">
          Want to read the lesson first?
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink)]">
          You haven't read the lesson for{' '}
          <span className="font-bold">{topicName}</span> yet. The lesson is a
          ~5-minute write-up that covers the same material the quiz tests.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          You can take the quiz cold if you'd rather test what you already
          know. We'll still track your score and surface the lesson on the
          results screen for anything you miss.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onSkipAndStart}
            className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-transparent underline-offset-4 hover:text-[var(--color-ink)] hover:decoration-[var(--color-rule)]"
          >
            Skip lesson, start quiz
          </button>
          <button
            type="button"
            onClick={onReviewLesson}
            className="border-2 px-5 py-2 text-xs uppercase tracking-[0.18em] transition-all duration-75 active:translate-y-[1px]"
            style={{
              borderColor: 'var(--color-info)',
              color: 'var(--color-info)',
              background: 'transparent',
            }}
          >
            Review the lesson →
          </button>
        </div>
      </div>
    </div>
  );
}
