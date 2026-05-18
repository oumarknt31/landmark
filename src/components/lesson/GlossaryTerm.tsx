import { type ReactNode } from 'react';

import { getDefinition } from '../../lib/glossary';

interface GlossaryTermProps {
  term: string;
  children: ReactNode;
}

/**
 * Inline term wrapper. Renders a dotted-underline on the matched text and
 * reveals a flat-bordered tooltip below it on hover/focus. The tooltip is a
 * sibling span positioned absolutely, no JS-driven popover, no portal, no
 * shadows; matches the textbook aesthetic.
 */
export default function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const definition = getDefinition(term);
  if (!definition) return <>{children}</>;

  return (
    <span className="group relative cursor-help">
      <span
        tabIndex={0}
        aria-describedby={`glossary-${term.toLowerCase().replace(/\s+/g, '-')}`}
        className="underline decoration-dotted decoration-[var(--color-muted)] underline-offset-[4px] group-hover:decoration-[var(--color-accent)] focus:outline-none focus-visible:decoration-[var(--color-accent)]"
      >
        {children}
      </span>
      <span
        id={`glossary-${term.toLowerCase().replace(/\s+/g, '-')}`}
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-20 mt-2 w-[28ch] max-w-[min(90vw,40ch)] border border-[var(--color-rule)] bg-[var(--color-paper)] px-4 py-3 font-sans text-xs leading-relaxed text-[var(--color-ink)] opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <span className="block font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--color-accent)]">
          {term}
        </span>
        <span className="mt-1 block font-serif text-sm leading-relaxed">
          {definition}
        </span>
      </span>
    </span>
  );
}
