import { supabase } from './supabase';
import { useProgressStore } from '../store/progressStore';
import type { XpSource } from '../store/progressStore';
import type { QuestionStats, QuizAttempt } from '../types/content';

interface RemoteProgressState {
  attempts: QuizAttempt[];
  lessonsRead: string[];
  questionStats: Record<string, QuestionStats>;
  notes: Record<string, string>;
  dailyXp: Record<string, number>;
  xpBySource: Record<XpSource, number>;
  displayName: string | null;
}

const TABLE = 'user_progress';
const DEBOUNCE_MS = 2000;

/**
 * On sign-in:
 *   1. If the user differs from the last signed-in user we tracked locally,
 *      we reset the local progress to prevent cross-user contamination.
 *   2. Pull the remote state.
 *   3. Merge local (now usually empty after a switch) into remote. Union for
 *      append-only collections, max-per-day for dailyXp, lastSeenAt for stats.
 *   4. Write the merged state locally + push back up so both sides converge.
 *   5. Stamp lastSignedInUserId + lastSyncedAt so we can detect switches and
 *      surface "synced N seconds ago" in the UI.
 */
export async function syncOnSignIn(userId: string) {
  if (!supabase) return;

  const store = useProgressStore.getState();
  const previousUserId = store.lastSignedInUserId;

  // If switching users (and we'd previously signed in as someone else), wipe
  // local data so the next user doesn't inherit it.
  if (previousUserId && previousUserId !== userId) {
    store.reset();
  }

  store.setSyncStatus('syncing');

  const { data, error } = await supabase
    .from(TABLE)
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to pull progress:', error.message);
    store.setSyncStatus('error');
    return;
  }

  const remote = normaliseRemote(data?.state);
  const local = useProgressStore.getState();

  const merged: RemoteProgressState = {
    attempts: dedupeAttempts([...remote.attempts, ...local.attempts]),
    lessonsRead: Array.from(
      new Set([...remote.lessonsRead, ...local.lessonsRead]),
    ),
    questionStats: mergeStats(remote.questionStats, local.questionStats),
    notes: { ...remote.notes, ...local.notes },
    dailyXp: mergeDailyXp(remote.dailyXp, local.dailyXp),
    xpBySource: {
      quiz: Math.max(remote.xpBySource.quiz, local.xpBySource.quiz),
      lesson: Math.max(remote.xpBySource.lesson, local.xpBySource.lesson),
    },
    // Prefer the local display name if set (the user just picked it during
    // signup) — fall back to whatever was stored remotely.
    displayName: local.displayName ?? remote.displayName ?? null,
  };

  useProgressStore.setState(merged);
  useProgressStore.getState().setLastSignedInUserId(userId);
  await pushNow(userId);
}

function normaliseRemote(state: unknown): RemoteProgressState {
  const s = (state ?? {}) as Partial<RemoteProgressState>;
  return {
    attempts: Array.isArray(s.attempts) ? s.attempts : [],
    lessonsRead: Array.isArray(s.lessonsRead) ? s.lessonsRead : [],
    questionStats:
      s.questionStats && typeof s.questionStats === 'object'
        ? s.questionStats
        : {},
    notes: s.notes && typeof s.notes === 'object' ? s.notes : {},
    dailyXp:
      s.dailyXp && typeof s.dailyXp === 'object' ? s.dailyXp : {},
    xpBySource:
      s.xpBySource && typeof s.xpBySource === 'object'
        ? { quiz: s.xpBySource.quiz ?? 0, lesson: s.xpBySource.lesson ?? 0 }
        : { quiz: 0, lesson: 0 },
    displayName:
      typeof s.displayName === 'string' ? s.displayName : null,
  };
}

function dedupeAttempts(attempts: QuizAttempt[]): QuizAttempt[] {
  const seen = new Map<string, QuizAttempt>();
  for (const a of attempts) {
    seen.set(`${a.topicId}::${a.completedAt}`, a);
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt),
  );
}

function mergeStats(
  a: Record<string, QuestionStats>,
  b: Record<string, QuestionStats>,
): Record<string, QuestionStats> {
  const out: Record<string, QuestionStats> = { ...a };
  for (const [id, stats] of Object.entries(b)) {
    const existing = out[id];
    if (!existing || stats.lastSeenAt > existing.lastSeenAt) {
      out[id] = stats;
    }
  }
  return out;
}

function mergeDailyXp(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...a };
  for (const [day, xp] of Object.entries(b)) {
    out[day] = Math.max(out[day] ?? 0, xp);
  }
  return out;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUserId: string | null = null;

/** Debounced push, coalesces bursts of writes into one network round-trip. */
export function schedulePush(userId: string) {
  if (!supabase) return;
  pendingUserId = userId;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushNow(userId);
  }, DEBOUNCE_MS);
}

async function pushNow(userId: string) {
  if (!supabase) return;
  if (pendingUserId !== userId && pendingUserId !== null) return;

  const store = useProgressStore.getState();
  store.setSyncStatus('syncing');

  const {
    attempts,
    lessonsRead,
    questionStats,
    notes,
    dailyXp,
    xpBySource,
    displayName,
  } = store;

  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      state: {
        attempts,
        lessonsRead,
        questionStats,
        notes,
        dailyXp,
        xpBySource,
        displayName,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to push progress:', error.message);
    useProgressStore.getState().setSyncStatus('error');
    return;
  }

  useProgressStore.getState().setSyncStatus('idle');
  useProgressStore.getState().setLastSyncedAt(Date.now());
}

/** Called from authStore.signOut so the next sign-in can detect the switch
 *  and reset cleanly. We DO NOT clear local state here — it stays as the
 *  "anonymous" working copy until a different user signs in. */
export function markSignedOut() {
  useProgressStore.getState().setLastSignedInUserId(null);
  useProgressStore.getState().setSyncStatus('idle');
}
