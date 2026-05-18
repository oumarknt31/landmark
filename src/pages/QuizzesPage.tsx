import { Link } from 'react-router-dom';

import PageShell from '../components/layout/PageShell';
import { chapterColor } from '../lib/chapterColor';
import { listTopicsWithCourse } from '../lib/topicLookup';
import { useProgressStore } from '../store/progressStore';

export default function QuizzesPage() {
  const topics = listTopicsWithCourse();
  const getBest = useProgressStore((s) => s.getBestScoreForTopic);

  // Group topics by their course so the page can render section headers.
  const grouped = topics.reduce<
    Record<string, { courseName: string; entries: typeof topics }>
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
        $ ls /quizzes
      </p>
      <h1 className="mt-2 font-mono text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        QUIZZES_
      </h1>
      <p className="mt-3 max-w-[60ch] text-sm text-[var(--color-muted)]">
        Pick any topic. Each quiz is 5 questions with instant feedback and an
        optional AI walkthrough on each miss.
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
                {group.entries.length} {group.entries.length === 1 ? 'quiz' : 'quizzes'}
              </span>
            </header>

            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.entries.map(({ topic }) => {
                const best = getBest(topic.id);
                return (
                  <li key={topic.id}>
                    <Link
                      to={`/quiz/${topic.id}`}
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
                          {topic.name}
                        </span>
                        {best !== null && (
                          <span
                            className="text-xs uppercase tracking-[0.18em]"
                            style={{ color: 'var(--color-highlight)' }}
                          >
                            BEST {best}/{topic.questions.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-baseline justify-between text-xs text-[var(--color-muted)]">
                        <span>{topic.questions.length} questions</span>
                        <span>
                          {topic.lessonId
                            ? 'lesson available'
                            : 'quiz only'}
                        </span>
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
