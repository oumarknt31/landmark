/**
 * Helpers around the daily-XP map: building today's key, walking back to find
 * the current streak, and scanning history for the longest streak. Kept pure
 * and time-injectable so they're easy to test.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(now: Date = new Date()): string {
  return dateKey(now);
}

export type DailyXp = Record<string, number>;

/**
 * Number of consecutive days ending today (or yesterday, if today is still
 * empty) where the learner earned XP. Today-only counts as 1.
 */
export function currentStreak(daily: DailyXp, now: Date = new Date()): number {
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);

  // If today is empty, the streak is still "alive" through yesterday.
  if (!daily[dateKey(cursor)]) {
    cursor.setTime(cursor.getTime() - DAY_MS);
  }

  let count = 0;
  while (daily[dateKey(cursor)]) {
    count += 1;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return count;
}

/** Longest consecutive run of non-zero days anywhere in history. */
export function longestStreak(daily: DailyXp): number {
  const days = Object.keys(daily)
    .filter((d) => daily[d] > 0)
    .sort();
  if (days.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime();
    const curr = new Date(days[i]).getTime();
    const diff = Math.round((curr - prev) / DAY_MS);
    if (diff === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

export function totalXp(daily: DailyXp): number {
  let sum = 0;
  for (const v of Object.values(daily)) sum += v;
  return sum;
}
