import { useEffect } from 'react';

import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';

/**
 * Single hook that owns the sync lifecycle: initialise auth on mount, then
 * pull-and-merge on sign-in and push local changes back up while signed in.
 *
 * The sync module is dynamically imported so the Supabase SDK stays out of
 * the initial bundle until someone signs in.
 */
export function useSync() {
  const init = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void import('./syncProgress').then(({ syncOnSignIn, schedulePush }) => {
      if (cancelled) return;
      void syncOnSignIn(user.id);

      // Subscribe but only fire schedulePush when *data* fields change.
      // Transient fields (syncStatus, recentXpGain, lastSyncedAt) change
      // inside the sync layer itself — if we fired on those too we'd loop
      // forever after any push failure.
      let last = useProgressStore.getState();
      unsubscribe = useProgressStore.subscribe((state) => {
        const dataChanged =
          state.attempts !== last.attempts ||
          state.lessonsRead !== last.lessonsRead ||
          state.questionStats !== last.questionStats ||
          state.notes !== last.notes ||
          state.dailyXp !== last.dailyXp ||
          state.xpBySource !== last.xpBySource ||
          state.displayName !== last.displayName;
        if (!dataChanged) return;
        last = state;
        schedulePush(user.id);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [user?.id]);
}
