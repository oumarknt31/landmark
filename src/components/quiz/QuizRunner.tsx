import { useEffect, useRef, useState } from 'react';

import type { Quality } from '../../lib/sm2';
import { qualityFromCorrect } from '../../lib/sm2';
import type { AnswerRecord, QuizAttempt, Topic } from '../../types/content';

import ResultsScreen from './ResultsScreen';

interface QuizRunnerProps {
  topic: Topic;
  courseHref: string;
  onComplete: (attempt: QuizAttempt) => void;
  onRetry: () => void;
  /** Called once per question with the SM-2 quality score (0–5). For MC
   *  quizzes this is derived from correct/wrong (4 / 2). */
  onAnswer?: (questionId: string, quality: Quality) => void;
}

function buildAttempt(topic: Topic, selections: (number | null)[]): QuizAttempt {
  const answers: AnswerRecord[] = topic.questions.map((q, i) => ({
    questionId: q.id,
    selectedIndex: selections[i] ?? -1,
    correct: selections[i] === q.correctIndex,
  }));
  const score = answers.filter((a) => a.correct).length;
  return {
    topicId: topic.id,
    score,
    totalQuestions: topic.questions.length,
    completedAt: new Date().toISOString(),
    answers,
  };
}

export default function QuizRunner({
  topic,
  courseHref,
  onComplete,
  onRetry,
  onAnswer,
}: QuizRunnerProps) {
  const total = topic.questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>(() =>
    Array(total).fill(null),
  );
  const [confirmedFlags, setConfirmedFlags] = useState<boolean[]>(() =>
    Array(total).fill(false),
  );
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  // Visual feedback flags. `pressedKey` flashes the matching option briefly
  // when its number key is pressed; `scoreBump` triggers the floating "+1".
  const [pressedKey, setPressedKey] = useState<number | null>(null);
  const [scoreBump, setScoreBump] = useState(0);
  const scoreBumpTimeoutRef = useRef<number | null>(null);

  const question = topic.questions[currentIndex];
  const selectedIndex = selections[currentIndex];
  const confirmed = confirmedFlags[currentIndex];
  const isLast = currentIndex === total - 1;
  const correct = selectedIndex === question?.correctIndex;

  // Score & streak computed across already-confirmed questions.
  const { score, streak } = (() => {
    let s = 0;
    let st = 0;
    for (let i = 0; i < total; i++) {
      if (!confirmedFlags[i]) break;
      if (selections[i] === topic.questions[i].correctIndex) {
        s += 1;
        st += 1;
      } else {
        st = 0;
      }
    }
    return { score: s, streak: st };
  })();

  function selectOption(optionIndex: number, viaKey = false) {
    if (confirmed) return;
    setSelections((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
    if (viaKey) {
      setPressedKey(optionIndex);
      window.setTimeout(() => setPressedKey(null), 220);
    }
  }

  function handleConfirm() {
    if (selectedIndex === null || selectedIndex === undefined) return;
    const wasCorrect = selectedIndex === question.correctIndex;
    setConfirmedFlags((prev) => {
      const next = [...prev];
      next[currentIndex] = true;
      return next;
    });
    onAnswer?.(question.id, qualityFromCorrect(wasCorrect));
    if (wasCorrect) {
      // Tick the bump counter — the floating "+1" mounts and self-removes.
      setScoreBump((n) => n + 1);
      if (scoreBumpTimeoutRef.current !== null) {
        window.clearTimeout(scoreBumpTimeoutRef.current);
      }
      scoreBumpTimeoutRef.current = window.setTimeout(() => {
        scoreBumpTimeoutRef.current = null;
      }, 800);
    }
  }

  function advance() {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
      return;
    }
    const finalAttempt = buildAttempt(topic, selections);
    onComplete(finalAttempt);
    setAttempt(finalAttempt);
  }

  // Keyboard shortcuts: 1-4 selects; Enter confirms / advances.
  useEffect(() => {
    if (attempt) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!confirmed && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        selectOption(Number(e.key) - 1, true);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!confirmed) {
          handleConfirm();
        } else {
          advance();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, confirmed, selectedIndex, currentIndex]);

  if (attempt) {
    return (
      <ResultsScreen
        topic={topic}
        attempt={attempt}
        courseHref={courseHref}
        onRetry={onRetry}
      />
    );
  }

  // ASCII progress bar reflecting position + completion.
  const progressBar =
    '[' +
    Array.from({ length: total }, (_, i) => {
      if (i < currentIndex) return '#';
      if (i === currentIndex) return '>';
      return '.';
    }).join('') +
    ']';

  return (
    <div>
      {/* Stats header */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <Stat label="PROGRESS">
          <span className="font-mono text-[var(--color-ink)]">{progressBar}</span>{' '}
          <span className="text-[var(--color-muted)]">
            {currentIndex + 1}/{total}
          </span>
        </Stat>
        <Stat label="SCORE">
          <span className="relative inline-block text-[var(--color-ink)] tabular-nums">
            {score}/{currentIndex + (confirmed ? 1 : 0)}
            {/* Floating +1 — keyed by scoreBump so each correct remounts the
                animation node and replays the keyframes. */}
            {scoreBump > 0 && confirmed && correct && (
              <span
                key={scoreBump}
                aria-hidden="true"
                className="absolute -right-7 top-0 animate-float-up font-mono text-sm font-bold text-[var(--color-accent)]"
              >
                +1
              </span>
            )}
          </span>
        </Stat>
        <Stat label="STREAK">
          <span
            className={
              streak >= 3
                ? 'tabular-nums text-[var(--color-accent)]'
                : 'tabular-nums text-[var(--color-ink)]'
            }
          >
            {streak}
            {streak >= 3 && '*'}
          </span>
        </Stat>
      </div>

      {/* Question card */}
      <article className="term-card mt-6">
        <header className="mb-5 flex items-baseline justify-between border-b border-[var(--color-rule)] pb-3 text-[var(--color-muted)]">
          <span className="text-xs uppercase tracking-[0.18em]">
            QUESTION {String(currentIndex + 1).padStart(2, '0')}
          </span>
          {question.topicTag && (
            <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              tag: {question.topicTag}
            </span>
          )}
        </header>

        <h2 className="text-base leading-relaxed text-[var(--color-ink)] sm:text-lg">
          {question.prompt}
        </h2>

        <ol className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedIndex === optionIndex;
            const isCorrect = question.correctIndex === optionIndex;
            const showCorrect = confirmed && isCorrect;
            const showWrong = confirmed && isSelected && !isCorrect;
            const isFlashing = pressedKey === optionIndex;

            // Each option gets a distinct accent so the 2×2 grid reads at a
            // glance: rust / blue / green / mustard.
            const baseColor = [
              'var(--color-accent)',
              'var(--color-info)',
              'var(--color-success)',
              'var(--color-highlight)',
            ][optionIndex];
            const baseTint = [
              'var(--tint-accent)',
              'var(--tint-info)',
              'var(--tint-success)',
              'var(--tint-highlight)',
            ][optionIndex];

            // After-confirm states override the per-option palette so the
            // verdict reads clearly even with colorful tiles.
            const borderColor = showCorrect
              ? 'var(--color-success)'
              : showWrong
                ? 'var(--color-danger)'
                : isSelected
                  ? 'var(--color-ink)'
                  : baseColor;
            const background = showCorrect
              ? 'var(--tint-success)'
              : showWrong
                ? 'rgba(176,48,32,0.12)'
                : isSelected
                  ? baseTint
                  : 'var(--color-paper)';
            const textColor = showWrong
              ? 'var(--color-danger)'
              : showCorrect
                ? 'var(--color-success)'
                : 'var(--color-ink)';

            return (
              <li key={optionIndex} className="h-full">
                <button
                  type="button"
                  onClick={() => selectOption(optionIndex)}
                  disabled={confirmed}
                  aria-pressed={isSelected}
                  style={{
                    borderColor,
                    background,
                    color: textColor,
                  }}
                  className={`group flex h-full min-h-[88px] w-full items-center gap-3 border-2 px-4 py-3 text-left transition-all duration-100 ${
                    showWrong ? 'line-through opacity-90' : ''
                  } ${
                    confirmed
                      ? ''
                      : 'hover:-translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--color-rule)]'
                  } ${isFlashing ? 'animate-key-flash' : ''}`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center border-2 font-mono text-sm font-bold"
                    style={{
                      borderColor: isSelected || showCorrect || showWrong
                        ? borderColor
                        : baseColor,
                      color: isSelected || showCorrect || showWrong
                        ? textColor
                        : baseColor,
                      background:
                        isSelected && !confirmed
                          ? baseColor
                          : showCorrect
                            ? 'var(--color-success)'
                            : showWrong
                              ? 'var(--color-danger)'
                              : 'transparent',
                    }}
                  >
                    {showCorrect ? '✓' : showWrong ? '✗' : optionIndex + 1}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </article>

      {/* Result banner / hint */}
      <div className="mt-5 min-h-[2.5rem]">
        {!confirmed ? (
          <p className="text-xs text-[var(--color-muted)]">
            {'> '}press{' '}
            <kbd className="text-[var(--color-ink)]">1</kbd>–
            <kbd className="text-[var(--color-ink)]">4</kbd> to choose,{' '}
            <kbd className="text-[var(--color-ink)]">Enter</kbd> to confirm.
          </p>
        ) : correct ? (
          <div className="text-sm text-[var(--color-accent)]">
            <p className="font-bold">+---- CORRECT ----+</p>
            <p className="mt-1 text-[var(--color-muted)]">
              {'> '}well done.{' '}
              <kbd className="text-[var(--color-ink)]">Enter</kbd> to continue.
            </p>
          </div>
        ) : (
          <div className="text-sm text-[var(--color-danger)]">
            <p className="font-bold">+--- INCORRECT ---+</p>
            <p className="mt-1 text-[var(--color-muted)]">
              {'> '}correct answer was{' '}
              <span className="text-[var(--color-accent)]">
                [{question.correctIndex + 1}]
              </span>
              .{' '}
              <kbd className="text-[var(--color-ink)]">Enter</kbd> to continue.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-baseline justify-end gap-4">
        {!confirmed ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedIndex === null || selectedIndex === undefined}
            className="border border-[var(--color-ink)] bg-transparent px-5 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-ink)] transition-all duration-75 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] active:translate-y-[1px] active:bg-[var(--color-accent)] active:text-[var(--color-paper)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            [ ENTER ] CONFIRM
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            className="border border-[var(--color-accent)] bg-transparent px-5 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-accent)] transition-all duration-75 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:translate-y-[1px] active:bg-[var(--color-ink)] active:text-[var(--color-paper)]"
          >
            [ ENTER ] {isLast ? 'FINISH >>' : 'NEXT >'}
          </button>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-baseline gap-2">
      <span>{label}</span>
      <span className="font-mono">{children}</span>
    </span>
  );
}
