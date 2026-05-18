import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { initialStats, reviseStats } from '../lib/sm2';
import type { Quality } from '../lib/sm2';
import { todayKey } from '../lib/streak';
import type { QuestionStats, QuizAttempt } from '../types/content';

export type XpSource = 'quiz' | 'lesson';

interface ProgressStore {
  attempts: QuizAttempt[];
  lessonsRead: string[];
  /** Spaced-repetition state per question, keyed by question id. */
  questionStats: Record<string, QuestionStats>;
  /** Free-form notes per topic id. Synced via the user_progress state blob. */
  notes: Record<string, string>;
  /** Total XP earned each day (YYYY-MM-DD → XP). Drives the heatmap + streak. */
  dailyXp: Record<string, number>;
  /** Lifetime XP totals broken down by source. */
  xpBySource: Record<XpSource, number>;
  /** Transient: most recent XP gain, used to trigger a toast. */
  recentXpGain: { amount: number; source: XpSource; ts: number } | null;
  /** Public-facing handle shown on the leaderboard. Stored locally and synced
   *  into the user_progress JSONB so the leaderboard SQL view can read it. */
  displayName: string | null;

  /** ID of the user this local state was last synced with. Set after a
   *  successful sign-in pull. Used to detect cross-user contamination on
   *  switch. Persisted so it survives page refresh. */
  lastSignedInUserId: string | null;
  /** ms epoch of the last successful Supabase push. Persisted. */
  lastSyncedAt: number | null;
  /** Transient sync state — drives the in-nav indicator. Not persisted. */
  syncStatus: 'idle' | 'syncing' | 'error';

  recordAttempt: (attempt: QuizAttempt) => void;
  /** Quality is SM-2 0–5. Multiple-choice mode maps correct/wrong → 4/2. */
  recordAnswer: (questionId: string, topicId: string, quality: Quality) => void;
  markLessonRead: (lessonId: string) => void;
  setNote: (topicId: string, content: string) => void;
  awardXp: (amount: number, source: XpSource) => void;
  clearRecentXp: () => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setLastSyncedAt: (ms: number) => void;
  setLastSignedInUserId: (id: string | null) => void;
  setDisplayName: (name: string) => void;
  getBestScoreForTopic: (topicId: string) => number | null;
  getAttemptsForTopic: (topicId: string) => QuizAttempt[];
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      attempts: [],
      lessonsRead: [],
      questionStats: {},
      notes: {},
      dailyXp: {},
      xpBySource: { quiz: 0, lesson: 0 },
      recentXpGain: null,
      lastSignedInUserId: null,
      lastSyncedAt: null,
      syncStatus: 'idle',
      displayName: null,

      recordAttempt: (attempt) =>
        set((state) => {
          // Completion XP + perfect bonus. Drills are also quiz attempts.
          const today = todayKey();
          const bonus =
            attempt.score === attempt.totalQuestions ? 25 + 5 : 5;
          return {
            attempts: [...state.attempts, attempt],
            dailyXp: {
              ...state.dailyXp,
              [today]: (state.dailyXp[today] ?? 0) + bonus,
            },
            xpBySource: {
              ...state.xpBySource,
              quiz: state.xpBySource.quiz + bonus,
            },
          };
        }),

      recordAnswer: (questionId, topicId, quality) =>
        set((state) => {
          const now = Date.now();
          const prev =
            state.questionStats[questionId] ??
            initialStats(questionId, topicId, now);
          const today = todayKey();
          // Quality >= 3 means SM-2 considered it a pass — award per-question XP.
          const earned = quality >= 3 ? 10 : 0;
          return {
            questionStats: {
              ...state.questionStats,
              [questionId]: reviseStats(prev, quality, now),
            },
            dailyXp:
              earned > 0
                ? {
                    ...state.dailyXp,
                    [today]: (state.dailyXp[today] ?? 0) + earned,
                  }
                : state.dailyXp,
            xpBySource:
              earned > 0
                ? {
                    ...state.xpBySource,
                    quiz: state.xpBySource.quiz + earned,
                  }
                : state.xpBySource,
          };
        }),

      markLessonRead: (lessonId) =>
        set((state) => {
          if (state.lessonsRead.includes(lessonId)) return state;
          // First-time read: also award lesson XP + trigger a toast.
          const today = todayKey();
          return {
            lessonsRead: [...state.lessonsRead, lessonId],
            dailyXp: {
              ...state.dailyXp,
              [today]: (state.dailyXp[today] ?? 0) + 15,
            },
            xpBySource: {
              ...state.xpBySource,
              lesson: state.xpBySource.lesson + 15,
            },
            recentXpGain: { amount: 15, source: 'lesson', ts: Date.now() },
          };
        }),

      awardXp: (amount, source) =>
        set((state) => {
          if (amount <= 0) return state;
          const today = todayKey();
          return {
            dailyXp: {
              ...state.dailyXp,
              [today]: (state.dailyXp[today] ?? 0) + amount,
            },
            xpBySource: {
              ...state.xpBySource,
              [source]: state.xpBySource[source] + amount,
            },
            recentXpGain: { amount, source, ts: Date.now() },
          };
        }),

      clearRecentXp: () => set({ recentXpGain: null }),

      setSyncStatus: (status) => set({ syncStatus: status }),
      setLastSyncedAt: (ms) => set({ lastSyncedAt: ms }),
      setLastSignedInUserId: (id) => set({ lastSignedInUserId: id }),
      setDisplayName: (name) => set({ displayName: name.trim() || null }),

      setNote: (topicId, content) =>
        set((state) => {
          const trimmed = content.trim();
          const next = { ...state.notes };
          if (trimmed === '') {
            delete next[topicId];
          } else {
            next[topicId] = content;
          }
          return { notes: next };
        }),

      getBestScoreForTopic: (topicId) => {
        const scores = get()
          .attempts.filter((a) => a.topicId === topicId)
          .map((a) => a.score);
        return scores.length ? Math.max(...scores) : null;
      },

      getAttemptsForTopic: (topicId) =>
        get().attempts.filter((a) => a.topicId === topicId),

      reset: () =>
        set({
          attempts: [],
          lessonsRead: [],
          questionStats: {},
          notes: {},
          dailyXp: {},
          xpBySource: { quiz: 0, lesson: 0 },
          recentXpGain: null,
          lastSignedInUserId: null,
          lastSyncedAt: null,
          syncStatus: 'idle',
          displayName: null,
        }),
    }),
    {
      name: 'landmark-progress',
      version: 6,
      // Don't persist transient UI state like syncStatus / recentXpGain.
      partialize: (state) => ({
        attempts: state.attempts,
        lessonsRead: state.lessonsRead,
        questionStats: state.questionStats,
        notes: state.notes,
        dailyXp: state.dailyXp,
        xpBySource: state.xpBySource,
        lastSignedInUserId: state.lastSignedInUserId,
        lastSyncedAt: state.lastSyncedAt,
        displayName: state.displayName,
      }),
      // Preserve everything from older versions; just fill missing fields.
      migrate: (persisted) => {
        const s = (persisted ?? {}) as Partial<ProgressStore>;
        return {
          ...s,
          attempts: Array.isArray(s.attempts) ? s.attempts : [],
          lessonsRead: Array.isArray(s.lessonsRead) ? s.lessonsRead : [],
          questionStats:
            s.questionStats && typeof s.questionStats === 'object'
              ? s.questionStats
              : {},
          notes:
            s.notes && typeof s.notes === 'object' ? s.notes : {},
          dailyXp:
            s.dailyXp && typeof s.dailyXp === 'object' ? s.dailyXp : {},
          xpBySource:
            s.xpBySource && typeof s.xpBySource === 'object'
              ? {
                  quiz: s.xpBySource.quiz ?? 0,
                  lesson: s.xpBySource.lesson ?? 0,
                }
              : { quiz: 0, lesson: 0 },
          lastSignedInUserId:
            typeof s.lastSignedInUserId === 'string'
              ? s.lastSignedInUserId
              : null,
          lastSyncedAt:
            typeof s.lastSyncedAt === 'number' ? s.lastSyncedAt : null,
          displayName:
            typeof s.displayName === 'string' ? s.displayName : null,
        } as ProgressStore;
      },
    },
  ),
);
