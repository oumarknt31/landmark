import glossaryJson from '../content/glossary.json';

interface GlossaryEntry {
  term: string;
  definition: string;
}

interface GlossaryFile {
  terms: GlossaryEntry[];
}

const entries = (glossaryJson as GlossaryFile).terms;

const byLowercaseTerm: Map<string, string> = new Map(
  entries.map((e) => [e.term.toLowerCase(), e.definition]),
);

// Match longer terms first so "virtual function" wins over "function" alone.
const sortedTerms = [...entries]
  .map((e) => e.term)
  .sort((a, b) => b.length - a.length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const glossaryRegex = new RegExp(
  `\\b(${sortedTerms.map(escapeRegex).join('|')})\\b`,
  'gi',
);

export function getDefinition(term: string): string | undefined {
  return byLowercaseTerm.get(term.toLowerCase());
}
