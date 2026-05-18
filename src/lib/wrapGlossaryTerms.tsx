import { Fragment, type ReactNode } from 'react';

import GlossaryTerm from '../components/lesson/GlossaryTerm';

import { glossaryRegex } from './glossary';

/**
 * Walk a react-markdown `children` value and wrap glossary terms inside any
 * plain text segments. Non-string nodes (inline code, links, formatting tags)
 * pass through untouched, so we never wrap terms that live inside ``code``.
 */
export function wrapGlossaryTerms(children: ReactNode): ReactNode {
  if (typeof children === 'string') return splitOnTerms(children);
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === 'string' ? (
        <Fragment key={i}>{splitOnTerms(child)}</Fragment>
      ) : (
        child
      ),
    );
  }
  return children;
}

function splitOnTerms(text: string): ReactNode[] {
  // Reset lastIndex because the regex is shared (`/g`).
  glossaryRegex.lastIndex = 0;
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = glossaryRegex.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }
    parts.push(
      <GlossaryTerm key={match.index} term={match[1]}>
        {match[0]}
      </GlossaryTerm>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length > 0 ? parts : [text];
}
