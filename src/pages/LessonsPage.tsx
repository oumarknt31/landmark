import { Link } from 'react-router-dom';

import PageShell from '../components/layout/PageShell';
import { chapterColor } from '../lib/chapterColor';
import { getLesson } from '../lib/loadLesson';
import { listTopicsWithCourse } from '../lib/topicLookup';
import { useProgressStore } from '../store/progressStore';

export default function LessonsPage() {
  const topics = listTopicsWithCourse();
  const lessonsRead = useProgressStore((s) => s.lessonsRead);

  // Only topics that have a paired lesson are listed here.
  const lessonTopics = topics.filter((t) => t.topic.lessonId);

  const grouped = lessonTopics.reduce<
    Record<string, { courseName: string; entries: typeof lessonTopics }>
  >((acc, entry) => {
    const key = entry.course.id;
    if (!acc[key]) {
      acc[key] = { courseName: entry.course.name, entries: [] };
    }
    acc[key].entries.push(entry);
    return acc;
  }, {});

  return (
    <PageShell wide>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        $ ls /lessons
      </p>
      <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        LESSONS_
      </h1>
      <p className="mt-3 max-w-[60ch] text-sm text-[var(--color-muted)]">
        Short, focused write-ups. Each ends with a "Common pitfalls" section
        and links to the quiz for the same topic.
      </p>

      {Object.entries(grouped).map(([courseId, group]) => {
        const color = chapterColor(courseId);
        return (
          <section key={courseId} className="mt-10">
            <header className="flex items-baseline justify-between border-b pb-2"
                    style={{ borderColor: color.ink }}>
              <h2
                className="text-sm uppercase tracking-[0.18em]"
                style={{ color: color.ink }}
              >
                {group.courseName}
              </h2>
              <span className="text-xs text-[var(--color-muted)]">
                {group.entries.length} {group.entries.length === 1 ? 'lesson' : 'lessons'}
              </span>
            </header>

            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.entries.map(({ topic }) => {
                const lesson = topic.lessonId ? getLesson(topic.lessonId) : undefined;
                const read = topic.lessonId
                  ? lessonsRead.includes(topic.lessonId)
                  : false;
                return (
                  <li key={topic.id}>
                    <Link
                      to={`/lesson/${topic.id}`}
                      className="tile block border px-5 py-4"
                      style={{
                        borderColor: color.ink,
                        background: color.tint,
                      }}
                    >
                      <div className="flex items-baseline justify-between">
                        <span
                          className="font-mono text-base font-bold"
                          style={{ color: color.ink }}
                        >
                          {lesson?.title ?? topic.name}
                        </span>
                        {read && (
                          <span
                            className="text-xs uppercase tracking-[0.18em]"
                            style={{ color: 'var(--color-success)' }}
                          >
                            ✓ READ
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-xs text-[var(--color-muted)]">
                        <span>
                          {lesson?.estimatedMinutes ?? 5} min read
                        </span>
                        <span>{topic.questions.length}-question quiz</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </PageShell>
  );
}
