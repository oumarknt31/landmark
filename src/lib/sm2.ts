import type { QuestionStats } from '../types/content';

/**
 * SuperMemo SM-2 with quality 0–5. The algorithm is unmodified; the four UI
 * ratings map onto canonical SM-2 quality values:
 *
 *   Again = 0  → fail; ease drops, interval resets to 1 day
 *   Hard  = 2  → fail; ease drops less, interval still resets
 *   Good  = 4  → pass; ease unchanged, interval grows by current ease factor
 *   Easy  = 5  → pass; ease bumps up, interval grows more aggressively
 *
 * For traditional multiple-choice quizzes (no self-rating), the binary
 * correct/wrong is mapped to Good (4) / Hard (2) by the caller.
 */

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

const DAY_MS = 24 * 60 * 60 * 1000;

export function initialStats(
  questionId: string,
  topicId: string,
  now: number,
): QuestionStats {
  return {
    questionId,
    topicId,
    ease: 2.5,
    repetitions: 0,
    intervalDays: 0,
    nextDueAt: now,
    totalSeen: 0,
    totalCorrect: 0,
    lastSeenAt: now,
  };
}

export function reviseStats(
  prev: QuestionStats,
  quality: Quality,
  now: number,
): QuestionStats {
  let { repetitions, intervalDays, ease } = prev;
  const passed = quality >= 3;

  if (passed) {
    if (repetitions === 0) intervalDays = 1;
    else if (repetitions === 1) intervalDays = 6;
    else intervalDays = Math.max(1, Math.round(intervalDays * ease));
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  ease = Math.max(
    1.3,
    ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  return {
    ...prev,
    ease,
    repetitions,
    intervalDays,
    nextDueAt: now + intervalDays * DAY_MS,
    totalSeen: prev.totalSeen + 1,
    totalCorrect: prev.totalCorrect + (passed ? 1 : 0),
    lastSeenAt: now,
  };
}

export function qualityFromCorrect(correct: boolean): Quality {
  return correct ? 4 : 2;
}

/**
 * Priority for surfacing in a drill: higher means review sooner. Unseen
 * questions get the highest priority so a new learner gets exposure first;
 * after that, weakness (miss rate) and overdue-ness dominate.
 */
export function drillPriority(
  stats: QuestionStats | undefined,
  now: number,
): number {
  if (!stats) return 100;
  if (stats.nextDueAt > now) return -1;
  const missRate =
    stats.totalSeen === 0 ? 1 : 1 - stats.totalCorrect / stats.totalSeen;
  const daysOverdue = Math.max(0, (now - stats.nextDueAt) / DAY_MS);
  return missRate * 10 + daysOverdue;
}
