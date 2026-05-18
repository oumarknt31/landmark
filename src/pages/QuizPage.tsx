import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PageShell from '../components/layout/PageShell';
import QuizDisclaimerDialog from '../components/quiz/QuizDisclaimerDialog';
import QuizRunner from '../components/quiz/QuizRunner';
import { findTopicWithCourse } from '../lib/topicLookup';
import { useProgressStore } from '../store/progressStore';

import NotFoundPage from './NotFoundPage';

export default function QuizPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const entry = topicId ? findTopicWithCourse(topicId) : undefined;
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const recordAnswer = useProgressStore((s) => s.recordAnswer);
  const lessonsRead = useProgressStore((s) => s.lessonsRead);
  const [attemptNonce, setAttemptNonce] = useState(0);
  const [disclaimerHandled, setDisclaimerHandled] = useState(false);

  if (!entry) return <NotFoundPage />;
  const { topic } = entry;

  const lessonAvailable = Boolean(topic.lessonId);
  const lessonAlreadyRead = topic.lessonId
    ? lessonsRead.includes(topic.lessonId)
    : false;
  const showDisclaimer =
    lessonAvailable && !lessonAlreadyRead && !disclaimerHandled;

  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <Link to="/quizzes" className="hover:text-[var(--color-ink)]">
          ← /quizzes
        </Link>
      </p>

      <hr className="my-8" />

      <QuizRunner
        key={attemptNonce}
        topic={topic}
        courseHref="/quizzes"
        onComplete={(attempt) => recordAttempt(attempt)}
        onAnswer={(questionId, quality) =>
          recordAnswer(questionId, topic.id, quality)
        }
        onRetry={() => setAttemptNonce((n) => n + 1)}
      />

      <QuizDisclaimerDialog
        open={showDisclaimer}
        topicName={topic.name}
        onSkipAndStart={() => setDisclaimerHandled(true)}
        onReviewLesson={() => {
          setDisclaimerHandled(true);
          navigate(`/lesson/${topic.id}`);
        }}
      />
    </PageShell>
  );
}
