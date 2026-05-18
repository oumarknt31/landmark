import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import plaintext from 'highlight.js/lib/languages/plaintext';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

import { wrapGlossaryTerms } from '../../lib/wrapGlossaryTerms';

// Only the languages we actually use. rehype-highlight's default ships ~35
// grammars (`common`); explicit registration drops the bundle by ~500KB.
const HIGHLIGHT_LANGUAGES = { cpp, bash, plaintext };

interface LessonReaderProps {
  body: string;
}

export default function LessonReader({ body }: LessonReaderProps) {
  return (
    <article className="lesson-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeHighlight,
            { detect: true, ignoreMissing: true, languages: HIGHLIGHT_LANGUAGES },
          ],
        ]}
        components={{
          // The page itself owns the h1 (lesson title + dateline), strip
          // the lesson's own # heading so it isn't rendered twice.
          h1: () => null,
          h2: ({ children }) => (
            <h2 className="mt-12 mb-4 font-serif text-2xl font-medium text-[var(--color-ink)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 font-serif text-xl font-medium text-[var(--color-ink)]">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-5 font-serif text-[1.125rem] leading-[1.75] text-[var(--color-ink)]">
              {wrapGlossaryTerms(children)}
            </p>
          ),
          li: ({ children }) => <li>{wrapGlossaryTerms(children)}</li>,
          ul: ({ children }) => (
            <ul className="my-5 list-disc space-y-2 pl-6 font-serif text-[1.125rem] leading-[1.7] text-[var(--color-ink)] marker:text-[var(--color-muted)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-5 list-decimal space-y-2 pl-6 font-serif text-[1.125rem] leading-[1.7] text-[var(--color-ink)] marker:text-[var(--color-muted)]">
              {children}
            </ol>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-[var(--color-accent)] underline decoration-[var(--color-rule)] underline-offset-4 hover:decoration-[var(--color-accent)]"
            >
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            // Inline code (no language class) renders compact; block code
            // is delegated to the <pre> override below.
            if (!className) {
              return (
                <code className="rounded-sm bg-[var(--color-rule)]/40 px-1.5 py-0.5 font-mono text-[0.92em] text-[var(--color-ink)]">
                  {children}
                </code>
              );
            }
            return <code className={className}>{children}</code>;
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto border border-[var(--color-rule)] bg-[#efe9dc] px-5 py-4 font-mono text-sm leading-relaxed text-[var(--color-ink)]">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-10 border-[var(--color-rule)]" />,
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-2 border-[var(--color-accent)] pl-5 font-serif italic text-[var(--color-muted)]">
              {children}
            </blockquote>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </article>
  );
}
