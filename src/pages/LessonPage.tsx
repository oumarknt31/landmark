import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import LessonReader from '../components/lesson/LessonReader';
import NotesPanel from '../components/lesson/NotesPanel';
import PageShell from '../components/layout/PageShell';
import { chapterColor } from '../lib/chapterColor';
import { getLesson } from '../lib/loadLesson';
import { findTopicWithCourse } from '../lib/topicLookup';
import { useProgressStore } from '../store/progressStore';

import NotFoundPage from './NotFoundPage';

export default function LessonPage() {
  const { topicId } = useParams();
  const entry = topicId ? findTopicWithCourse(topicId) : undefined;
  const lesson = entry?.topic.lessonId
    ? getLesson(entry.topic.lessonId)
    : undefined;
  const markLessonRead = useProgressStore((s) => s.markLessonRead);

  useEffect(() => {
    if (lesson) markLessonRead(lesson.id);
  }, [lesson, markLessonRead]);

  if (!entry) return <NotFoundPage />;
  const { topic, course } = entry;
  const color = chapterColor(course.id);

  return (
    <PageShell>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <Link to="/lessons" className="hover:text-[var(--color-ink)]">
          ← /lessons
        </Link>
        <span> &middot; </span>
        <span style={{ color: color.ink }}>{course.name}</span>
      </p>
      <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
        {lesson?.title ?? topic.name}
      </h1>
      <p className="mt-2 text-xs italic text-[var(--color-muted)]">
        {lesson ? `${lesson.estimatedMinutes} min read` : 'No lesson yet'}
      </p>

      <hr className="my-8" />

      {lesson ? (
        <LessonReader body={lesson.body} />
      ) : (
        <p className="text-sm text-[var(--color-muted)]">
          No lesson is paired with this topic yet. The quiz still stands on
          its own.
        </p>
      )}

      <hr className="my-10" />

      <div
        className="border-2 px-6 py-5"
        style={{
          borderColor: 'var(--color-accent)',
          background: 'var(--tint-accent)',
        }}
      >
        <p
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--color-accent)' }}
        >
          Test yourself
        </p>
        <p className="mt-1 font-bold text-[var(--color-ink)]">
          Take the {topic.name} quiz
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          {topic.questions.length} questions &middot; instant feedback &middot;
          AI explanations on misses
        </p>
        <Link
          to={`/quiz/${topic.id}`}
          className="mt-4 inline-block border-2 px-5 py-2 text-xs uppercase tracking-[0.18em] transition-all duration-75 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:translate-y-[1px]"
          style={{
            borderColor: 'var(--color-accent)',
            color: 'var(--color-accent)',
          }}
        >
          Start quiz →
        </Link>
      </div>

      <NotesPanel topicId={topic.id} />

      {topic.attribution && (
        <p className="mt-12 border-t border-[var(--color-rule)] pt-6 text-xs italic text-[var(--color-muted)]">
          {topic.attribution}
        </p>
      )}
    </PageShell>
  );
}
