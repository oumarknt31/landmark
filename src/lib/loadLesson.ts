import type { Lesson } from '../types/content';

// Vite bundles every lesson .md as a raw string at build time.
const modules = import.meta.glob<string>('../content/lessons/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

function parse(raw: string): Lesson {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error('Lesson is missing frontmatter');
  }
  const [, yaml, body] = match;
  const meta: Record<string, string> = {};
  for (const line of yaml.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    meta[key] = value;
  }
  return {
    id: meta.id,
    title: meta.title,
    subject: meta.subject,
    course: meta.course,
    estimatedMinutes: Number(meta.estimatedMinutes) || 5,
    body: body.trimStart(),
  };
}

const lessonsById = new Map<string, Lesson>();
for (const raw of Object.values(modules)) {
  const lesson = parse(raw);
  lessonsById.set(lesson.id, lesson);
}

export function getLesson(id: string): Lesson | undefined {
  return lessonsById.get(id);
}

export function getAllLessons(): Lesson[] {
  return Array.from(lessonsById.values());
}
