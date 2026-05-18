// Typographic helpers for the design motif.
// Roman numerals anchor hierarchies (subjects, courses).
// Spelled-out ordinals appear in italic serif inside running content
// ("Question seven.", "Example three.").

const ROMAN = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
];

const SPELLED = [
  'zero', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
];

export function toRoman(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

export function spellOut(n: number): string {
  return SPELLED[n] ?? String(n);
}
