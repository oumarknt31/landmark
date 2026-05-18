import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageShell from '../components/layout/PageShell';
import QuizRunner from '../components/quiz/QuizRunner';
import {
  getAllQuestionsWithTopic,
  getTopicIdForQuestion,
} from '../lib/loadQuizzes';
import { drillPriority } from '../lib/sm2';
import { useProgressStore } from '../store/progressStore';
import type { Question, Topic } from '../types/content';

const DRILL_SIZE = 10;

export default function DrillPage() {
  const questionStats = useProgressStore((s) => s.questionStats);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);

  // The landing-page stats are reactive to questionStats so the "Due now"
  // counter and accuracy update live as the user studies.
  const stats = useMemo(() => {
    const now = Date.now();
    const all = getAllQuestionsWithTopic();
    const tracked = Object.values(questionStats);
    const totalSeen = tracked.reduce((sum, s) => sum + s.totalSeen, 0);
    const totalCorrect = tracked.reduce((sum, s) => sum + s.totalCorrect, 0);
    const accuracy = totalSeen ? totalCorrect / totalSeen : null;
    const dueCount = all.filter(
      ({ question }) => drillPriority(questionStats[question.id], now) > 0,
    ).length;
    const untouched = all.length - tracked.length;
    return { tracked: tracked.length, accuracy, dueCount, untouched };
  }, [questionStats]);

  // The session itself is a *snapshot*, capturing the ranked questions at
  // the moment Start is clicked. If we recomputed mid-quiz from questionStats
  // (which mutates on every confirm), the visible array would shift under
  // QuizRunner's indices and the user would jump to a different question.
  const [session, setSession] = useState<Topic | null>(null);

  function startDrill() {
    const now = Date.now();
    const questions = getAllQuestionsWithTopic()
      .map(({ question }) => ({
        question,
        priority: drillPriority(questionStats[question.id], now),
      }))
      .filter((entry) => entry.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, DRILL_SIZE)
      .map((entry) => entry.question);

    if (questions.length === 0) return;

    setSession(buildDrillTopic(questions));
  }

  function endDrill() {
    setSession(null);
  }

  if (session) {
    return (
      <PageShell>
        <p className="font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
          <Link to="/progress" className="hover:text-[var(--color-ink)]">
            ← Progress
          </Link>
        </p>
        <hr className="my-8 border-[var(--color-rule)]" />
        <QuizRunner
          key={session.id}
          topic={session}
          courseHref="/progress"
          onComplete={(attempt) => recordAttempt(attempt)}
          onAnswer={(questionId, quality) => {
            const topicId = getTopicIdForQuestion(questionId) ?? 'drill';
            recordAnswer(questionId, topicId, quality);
          }}
          onRetry={() => {
            endDrill();
            startDrill();
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <p className="font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-muted)]">
        Drill
      </p>
      <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-[var(--color-ink)]">
        Weak spots
      </h1>
      <p className="mt-4 max-w-[55ch] font-serif text-lg leading-relaxed text-[var(--color-muted)]">
        Spaced repetition pulls questions you've missed or that are due for
        review. Built on SM-2, the algorithm behind Anki, every confirm
        nudges the question's next review date based on whether you got it
        right.
      </p>

      <hr className="my-10 border-[var(--color-rule)]" />

      <dl className="grid grid-cols-2 gap-y-6 gap-x-8 sm:grid-cols-4">
        <Stat label="Due now" value={stats.dueCount.toString()} />
        <Stat label="Tracked" value={stats.tracked.toString()} />
        <Stat label="Unseen" value={stats.untouched.toString()} />
        <Stat
          label="Accuracy"
          value={
            stats.accuracy === null
              ? '-'
              : `${Math.round(stats.accuracy * 100)}%`
          }
        />
      </dl>

      <hr className="my-10 border-[var(--color-rule)]" />

      {stats.dueCount === 0 ? (
        <p className="font-serif text-lg text-[var(--color-muted)]">
          Nothing is due yet. Finish a topic quiz first and check back -
          questions you miss surface here.
        </p>
      ) : (
        <>
          <p className="font-serif text-lg text-[var(--color-ink)]">
            {Math.min(stats.dueCount, DRILL_SIZE)} questions ready to drill.
          </p>
          <div className="mt-8">
            <button
              type="button"
              onClick={startDrill}
              className="bg-[var(--color-accent)] px-7 py-3 font-sans text-sm uppercase tracking-[0.12em] text-[var(--color-paper)] transition-opacity hover:opacity-90"
            >
              Start drill
            </button>
          </div>
        </>
      )}
    </PageShell>
  );
}

function buildDrillTopic(questions: Question[]): Topic {
  return {
    id: `drill-${Date.now()}`,
    name: `Drill, ${questions.length} reviews`,
    questions,
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-sans text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
        {label}
      </dt>
      <dd className="mt-1 font-serif text-3xl tabular-nums text-[var(--color-ink)]">
        {value}
      </dd>
    </div>
  );
}
