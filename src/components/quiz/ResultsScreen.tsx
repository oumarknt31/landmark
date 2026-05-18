import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchExplanation } from '../../lib/explanation';
import type {
  AnswerRecord,
  Question,
  QuizAttempt,
  Topic,
} from '../../types/content';

import FeedbackDialog from './FeedbackDialog';

interface ResultsScreenProps {
  topic: Topic;
  attempt: QuizAttempt;
  courseHref: string;
  onRetry: () => void;
}

function congratulations(score: number, total: number): string {
  if (score === total) return 'Perfect score.';
  const ratio = score / total;
  if (ratio >= 0.8) return 'Excellent work.';
  if (ratio >= 0.6) return 'Solid, keep going.';
  return 'Worth another attempt. Review the lesson and retry.';
}

function computeXp(attempt: QuizAttempt) {
  const perCorrect = attempt.score * 10;
  const completion = 5;
  const perfect = attempt.score === attempt.totalQuestions ? 25 : 0;
  return {
    perCorrect,
    completion,
    perfect,
    total: perCorrect + completion + perfect,
    isPerfect: perfect > 0,
  };
}

export default function ResultsScreen({
  topic,
  attempt,
  courseHref,
  onRetry,
}: ResultsScreenProps) {
  const wrong = attempt.answers
    .map((answer, index) => ({ answer, index }))
    .filter(({ answer }) => !answer.correct);
  const xp = computeXp(attempt);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {topic.name} · Results
      </p>

      <p className="mt-6 font-mono text-[4.5rem] font-bold leading-none tabular-nums text-[var(--color-ink)] sm:text-[5.5rem]">
        {attempt.score}
        <span className="text-[var(--color-muted)]">
          {' '}/ {attempt.totalQuestions}
        </span>
      </p>

      <p className="mt-4 text-base italic text-[var(--color-muted)]">
        {congratulations(attempt.score, attempt.totalQuestions)}
      </p>

      <XpBanner xp={xp} />

      {wrong.length > 0 && (
        <>
          <hr className="my-10" />
          <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Worth a second look
          </h2>
          <ol className="mt-6 space-y-8">
            {wrong.map(({ answer, index }) => (
              <li key={answer.questionId}>
                <WrongAnswerBlock
                  question={topic.questions[index]}
                  index={index}
                  answer={answer}
                  topicId={topic.id}
                  topicName={topic.name}
                />
              </li>
            ))}
          </ol>
        </>
      )}

      <hr className="my-10" />

      <div className="flex gap-6">
        <button
          type="button"
          onClick={onRetry}
          className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 transition-all duration-75 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)] active:translate-y-[1px]"
        >
          Retake quiz
        </button>
        <Link
          to={courseHref}
          className="text-xs uppercase tracking-[0.18em] text-[var(--color-ink)] underline decoration-[var(--color-rule)] underline-offset-4 transition-all duration-75 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)] active:translate-y-[1px]"
        >
          Back to course
        </Link>
      </div>
    </div>
  );
}

interface XpBannerProps {
  xp: ReturnType<typeof computeXp>;
}

function XpBanner({ xp }: XpBannerProps) {
  // Counter ticks up from 0 to xp.total over ~800ms with easing.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Ease-out for a satisfying decel at the end.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(xp.total * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [xp.total]);

  return (
    <section className="mt-10 border border-[var(--color-accent)] bg-[rgba(184,65,14,0.05)] p-5 shadow-[2px_2px_0_0_var(--color-rule)]">
      <header className="flex items-baseline justify-between border-b border-[var(--color-rule)] pb-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <span>+--- XP EARNED ---+</span>
        {xp.isPerfect && (
          <span className="text-[var(--color-accent)]">PERFECT *</span>
        )}
      </header>

      <ul className="mt-4 space-y-1.5 font-mono text-sm">
        <li className="flex items-baseline justify-between text-[var(--color-ink)]">
          <span>correct answers (×10)</span>
          <span className="tabular-nums">+{xp.perCorrect}</span>
        </li>
        <li className="flex items-baseline justify-between text-[var(--color-ink)]">
          <span>completion bonus</span>
          <span className="tabular-nums">+{xp.completion}</span>
        </li>
        {xp.isPerfect && (
          <li className="flex items-baseline justify-between text-[var(--color-accent)]">
            <span>perfect score bonus</span>
            <span className="tabular-nums">+{xp.perfect}</span>
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-baseline justify-between border-t border-[var(--color-rule)] pt-3">
        <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          total
        </span>
        <span className="font-mono text-3xl font-bold tabular-nums text-[var(--color-accent)]">
          +{shown} XP
        </span>
      </div>
    </section>
  );
}

type ExplanationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; text: string }
  | { status: 'error' };

interface WrongAnswerBlockProps {
  question: Question;
  index: number;
  answer: AnswerRecord;
  topicId: string;
  topicName: string;
}

function WrongAnswerBlock({
  question,
  index,
  answer,
  topicId,
  topicName,
}: WrongAnswerBlockProps) {
  const [explanation, setExplanation] = useState<ExplanationState>({
    status: 'idle',
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const correctText = question.options[question.correctIndex];
  const userText =
    answer.selectedIndex >= 0
      ? question.options[answer.selectedIndex]
      : '(no answer)';

  async function loadExplanation() {
    setExplanation({ status: 'loading' });
    const text = await fetchExplanation({
      question,
      selectedIndex: answer.selectedIndex,
      topicName,
    });
    setExplanation(
      text ? { status: 'loaded', text } : { status: 'error' },
    );
  }

  return (
    <div>
      <p className="text-base leading-relaxed text-[var(--color-ink)]">
        <span className="text-[var(--color-accent)]">
          Q{String(index + 1).padStart(2, '0')}.
        </span>{' '}
        {question.prompt}
      </p>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Your answer:{' '}
        <span className="line-through text-[var(--color-danger)]">
          {userText}
        </span>
      </p>
      <p className="mt-1 text-xs text-[var(--color-accent)]">
        Correct: {correctText}
      </p>

      {explanation.status === 'idle' && (
        <button
          type="button"
          onClick={loadExplanation}
          className="mt-3 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-transparent underline-offset-4 hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
        >
          Why is this the answer? →
        </button>
      )}

      {explanation.status === 'loading' && (
        <p className="mt-3 text-sm italic text-[var(--color-muted)]">
          Thinking…
        </p>
      )}

      {explanation.status === 'loaded' && (
        <blockquote className="mt-3 border-l-2 border-[var(--color-accent)] pl-4 text-sm leading-relaxed text-[var(--color-ink)]">
          {explanation.text}
        </blockquote>
      )}

      {explanation.status === 'error' && (
        <p className="mt-3 text-xs italic text-[var(--color-muted)]">
          Couldn't load an explanation right now. Try again later.
        </p>
      )}

      <button
        type="button"
        onClick={() => setFeedbackOpen(true)}
        className="mt-3 ml-4 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)] underline decoration-transparent underline-offset-4 hover:text-[var(--color-danger)] hover:decoration-[var(--color-danger)]"
      >
        Report a problem
      </button>

      <FeedbackDialog
        open={feedbackOpen}
        questionId={question.id}
        topicId={topicId}
        onClose={() => setFeedbackOpen(false)}
      />
    </div>
  );
}
