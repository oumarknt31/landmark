/**
 * Per-chapter accent colors. Each chapter gets one of the new palette tones
 * so the browse grids visually segment by chapter without needing labels.
 */

export interface ChapterColor {
  /** CSS variable for the ink colour. */
  ink: string;
  /** CSS variable for the matching tinted background. */
  tint: string;
  /** Plain label, used for screen readers / debug. */
  label: string;
}

const FALLBACK: ChapterColor = {
  ink: 'var(--color-accent)',
  tint: 'var(--tint-accent)',
  label: 'accent',
};

const BY_COURSE_ID: Record<string, ChapterColor> = {
  'chapter-1': {
    ink: 'var(--color-success)',
    tint: 'var(--tint-success)',
    label: 'success',
  },
  'chapter-2': {
    ink: 'var(--color-info)',
    tint: 'var(--tint-info)',
    label: 'info',
  },
  'chapter-3': {
    ink: 'var(--color-purple)',
    tint: 'var(--tint-purple)',
    label: 'purple',
  },
};

export function chapterColor(courseId: string): ChapterColor {
  return BY_COURSE_ID[courseId] ?? FALLBACK;
}
