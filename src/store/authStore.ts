import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialised: boolean;
  /** True when `user.is_anonymous` is true on the Supabase user. We surface
   *  this so the UI can prompt anonymous users to "save their account". */
  isAnonymous: boolean;
  init: () => Promise<void>;
  signUp: (args: {
    email: string;
    password: string;
    displayName: string;
  }) => Promise<{ error?: string }>;
  signIn: (args: {
    email: string;
    password: string;
  }) => Promise<{ error?: string }>;
  signInAnonymously: () => Promise<{ error?: string }>;
  /** Link an anonymous account to email+password so it survives device loss. */
  upgradeAnonymousAccount: (args: {
    email: string;
    password: string;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

// The Supabase SDK is heavy (~150KB). Dynamic-import the client module so it
// stays out of the initial bundle and loads only on first auth interaction.
async function loadSupabase() {
  const mod = await import('../lib/supabase');
  return mod.supabase;
}

function isAnonUser(user: User | null | undefined): boolean {
  if (!user) return false;
  // is_anonymous is true on accounts created via signInAnonymously().
  const raw = (user as unknown as { is_anonymous?: boolean }).is_anonymous;
  return raw === true;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  initialised: false,
  isAnonymous: false,

  init: async () => {
    if (get().initialised) return;
    set({ initialised: true });

    const sb = await loadSupabase();
    if (!sb) {
      set({ loading: false });
      return;
    }

    const { data } = await sb.auth.getSession();
    const user = data.session?.user ?? null;
    set({
      user,
      isAnonymous: isAnonUser(user),
      loading: false,
    });

    // Backfill: any anon user still on the old `learner_xxxxxx` handle (or
    // with no handle at all) gets an anime-flavored one on this load.
    if (user && isAnonUser(user)) {
      const { useProgressStore } = await import('./progressStore');
      const current = useProgressStore.getState().displayName;
      if (!current || current.startsWith('learner_') || current.startsWith('user_')) {
        const { generateAnimeName } = await import('../lib/animeName');
        useProgressStore.getState().setDisplayName(generateAnimeName(user.id));
      }
    }

    sb.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ?? null,
        isAnonymous: isAnonUser(session?.user),
      });
    });
  },

  signUp: async ({ email, password, displayName }) => {
    const sb = await loadSupabase();
    if (!sb) return { error: 'Backend not configured.' };
    const e = email.trim().toLowerCase();
    if (!e) return { error: 'Email is required.' };
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' };
    }
    const name = displayName.trim();
    if (name.length < 3 || name.length > 20) {
      return { error: 'Display name must be 3 to 20 characters.' };
    }
    if (!/^[A-Za-z0-9_]+$/.test(name)) {
      return { error: 'Display name can only contain letters, numbers, and underscores.' };
    }

    const { error } = await sb.auth.signUp({
      email: e,
      password,
      options: { data: { display_name: name } },
    });
    if (error) return { error: error.message };

    // Persist the chosen display name into our own progress store so the
    // leaderboard view picks it up. (Supabase user_metadata is also set, but
    // the leaderboard reads from user_progress.state.)
    const { useProgressStore } = await import('./progressStore');
    useProgressStore.getState().setDisplayName(name);

    return {};
  },

  signIn: async ({ email, password }) => {
    const sb = await loadSupabase();
    if (!sb) return { error: 'Backend not configured.' };
    const e = email.trim().toLowerCase();
    if (!e) return { error: 'Email is required.' };
    if (!password) return { error: 'Password is required.' };
    const { error } = await sb.auth.signInWithPassword({
      email: e,
      password,
    });
    return error ? { error: error.message } : {};
  },

  signInAnonymously: async () => {
    const sb = await loadSupabase();
    if (!sb) return { error: 'Backend not configured.' };

    const { error, data } = await sb.auth.signInAnonymously();
    if (error) return { error: error.message };

    // Give anon users an anime-flavored handle, seeded from their UUID so it
    // stays stable across reloads.
    const uid = data.user?.id ?? '';
    const { generateAnimeName } = await import('../lib/animeName');
    const { useProgressStore } = await import('./progressStore');
    useProgressStore.getState().setDisplayName(generateAnimeName(uid));

    return {};
  },

  upgradeAnonymousAccount: async ({ email, password }) => {
    const sb = await loadSupabase();
    if (!sb) return { error: 'Backend not configured.' };
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' };
    }
    const e = email.trim().toLowerCase();
    if (!e) return { error: 'Email is required.' };
    const { error } = await sb.auth.updateUser({ email: e, password });
    return error ? { error: error.message } : {};
  },

  signOut: async () => {
    const sb = await loadSupabase();
    if (sb) await sb.auth.signOut();
    // Wipe local state on sign-out: a logged-out user should see a clean
    // app, not the previous account's XP, streaks, attempts, or notes.
    const { useProgressStore } = await import('./progressStore');
    useProgressStore.getState().reset();
    const { markSignedOut } = await import('../lib/syncProgress');
    markSignedOut();
  },
}));
