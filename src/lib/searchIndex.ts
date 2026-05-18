import MiniSearch from 'minisearch';

import { getAllLessons } from './loadLesson';
import { getAllSubjects } from './loadQuizzes';

export type SearchResultKind = 'topic' | 'lesson' | 'question';

export interface SearchDoc {
  id: string;
  kind: SearchResultKind;
  title: string;
  detail: string;
  context: string;
  href: string;
}

function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/[#*_>`~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  // lessonId -> { topicId, context } so lesson docs can link to /lesson/:topicId
  const lessonOwners = new Map<string, { topicId: string; context: string }>();

  for (const subject of getAllSubjects()) {
    for (const course of subject.courses) {
      for (const topic of course.topics) {
        const quizHref = `/quiz/${topic.id}`;
        if (topic.lessonId) {
          lessonOwners.set(topic.lessonId, {
            topicId: topic.id,
            context: `${course.name} · ${topic.name}`,
          });
        }

        docs.push({
          id: `topic:${topic.id}`,
          kind: 'topic',
          title: topic.name,
          detail: `${topic.questions.length} questions`,
          context: `${subject.name} · ${course.name}`,
          href: quizHref,
        });

        for (const question of topic.questions) {
          docs.push({
            id: `question:${question.id}`,
            kind: 'question',
            title: question.prompt,
            detail: question.options.join(' · '),
            context: `${course.name} · ${topic.name}`,
            href: quizHref,
          });
        }
      }
    }
  }

  for (const lesson of getAllLessons()) {
    const owner = lessonOwners.get(lesson.id);
    if (!owner) continue; // unpaired lesson — no topic links to it
    docs.push({
      id: `lesson:${lesson.id}`,
      kind: 'lesson',
      title: lesson.title,
      detail: stripMarkdown(lesson.body).slice(0, 400),
      context: owner.context,
      href: `/lesson/${owner.topicId}`,
    });
  }

  return docs;
}

const docs = buildDocs();
const docsById = new Map(docs.map((d) => [d.id, d]));

const index = new MiniSearch<SearchDoc>({
  fields: ['title', 'detail', 'context'],
  storeFields: ['id'],
  searchOptions: {
    boost: { title: 3, context: 1.5 },
    fuzzy: 0.2,
    prefix: true,
  },
});
index.addAll(docs);

export function search(query: string, limit = 12): SearchDoc[] {
  const q = query.trim();
  if (!q) return [];
  return index
    .search(q)
    .slice(0, limit)
    .map((r) => docsById.get(String(r.id)))
    .filter((d): d is SearchDoc => Boolean(d));
}
